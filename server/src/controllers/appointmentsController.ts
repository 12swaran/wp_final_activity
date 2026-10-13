import { newToken, hashToken, escapeHtml } from '../utils/security';
import { Setting } from '../models/Setting';
import { canClientChange } from '../utils/bookingRules';
import { escapeRegex } from '../utils/security';
import { Request, Response } from 'express';
import { Appointment } from '../models/Appointment';
import {
  getAvailableSlotsForDate,
  bookSlotAtomically,
  reserveAppointment,
} from '../services/bookingReservations';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { sendEmail, emailTemplates } from '../services/emailService';
import { env } from '../config/env';

export const getAvailableSlots = async (req: Request, res: Response): Promise<void> => {
  try {
    const { date } = req.query;

    if (!date || typeof date !== 'string') {
      sendError(res, 'A date query parameter in YYYY-MM-DD format is required.', 400);
      return;
    }

    const slots = await getAvailableSlotsForDate(date);
    sendSuccess(res, { date, slots }, 'Available appointment slots retrieved.');
  } catch (err: any) {
    sendError(res, err.message, err.statusCode || 500);
  }
};

export const bookAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      clientName,
      clientEmail,
      clientPhone,
      serviceType,
      appointmentDate,
      startTime,
      endTime,
      notes,
      idempotencyKey,
    } = req.body;

    if (!clientName || !clientEmail || !appointmentDate || !startTime || !endTime) {
      sendError(res, 'Client name, email, date, start time, and end time are required.', 400);
      return;
    }

    // Atomic reservation & conflict detection
    const manageToken = newToken();
    if (idempotencyKey) {
      const previous = await Appointment.findOne({ idempotencyKey });
      if (previous) {
        if (
          previous.clientEmail !== clientEmail ||
          previous.appointmentDate !== appointmentDate ||
          previous.startTime !== startTime
        ) {
          sendError(res, 'This request key was already used for a different booking.', 409);
          return;
        }
        await Appointment.updateOne(
          { _id: previous._id },
          { manageTokenHash: hashToken(manageToken) },
        );
        sendSuccess(res, { ...previous.toObject(), manageToken }, 'Booking already received.');
        return;
      }
    }
    const appointment = await bookSlotAtomically({
      manageTokenHash: hashToken(manageToken),
      clientName: clientName.trim(),
      clientEmail: clientEmail.toLowerCase().trim(),
      clientPhone: clientPhone ? clientPhone.trim() : '',
      serviceType: serviceType || 'Discovery Consultation (30 mins)',
      appointmentDate,
      startTime,
      endTime,
      notes: notes ? notes.trim() : '',
      idempotencyKey,
    });

    // Send confirmation email
    const meetingLink = appointment.meetingLink || 'https://meet.google.com/sample-discovery-call';
    const confirmation = emailTemplates.appointmentConfirmation(
      appointment.clientName,
      appointment.serviceType,
      appointment.appointmentDate,
      `${appointment.startTime} - ${appointment.endTime}`,
      meetingLink,
    );
    sendEmail({
      referenceId: String(appointment._id),
      to: appointment.clientEmail,
      subject: confirmation.subject,
      html: confirmation.html,
    }).catch((err) => console.error('[Email Error] Booking confirmation failed:', err.message));

    // Send admin notification
    const adminAlert = emailTemplates.adminNewNotification(
      'Confirmed Appointment',
      `Client: ${escapeHtml(appointment.clientName)} (${appointment.clientEmail})\nPhone: ${appointment.clientPhone || 'N/A'}\nService: ${appointment.serviceType}\nDate: ${appointment.appointmentDate}\nTime: ${appointment.startTime} - ${appointment.endTime}\nNotes: ${appointment.notes || 'None'}`,
    );
    sendEmail({
      referenceId: String(appointment._id),
      to: env.ADMIN_NOTIFICATION_EMAIL,
      subject: adminAlert.subject,
      html: adminAlert.html,
    }).catch((err) => console.error('[Email Error] Admin notification failed:', err.message));

    sendSuccess(
      res,
      { ...appointment.toObject(), manageTokenHash: undefined, manageToken },
      'Appointment booked. Save your private management code.',
      201,
    );
  } catch (err: any) {
    const statusCode = err.statusCode || 500;
    sendError(res, err.message, statusCode);
  }
};

export const getAppointmentsAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, date, startDate, endDate, page = '1', limit = '20' } = req.query;

    const query: any = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    if (date) {
      query.appointmentDate = String(date);
    } else if (startDate || endDate) {
      query.appointmentDate = {};
      if (startDate) query.appointmentDate.$gte = String(startDate);
      if (endDate) query.appointmentDate.$lte = String(endDate);
    }

    const pageNum = Math.max(1, parseInt(String(page), 10));
    const limitNum = Math.max(1, parseInt(String(limit), 10));
    const skip = (pageNum - 1) * limitNum;

    const [appointments, total] = await Promise.all([
      Appointment.find(query).sort({ appointmentDate: 1, startTime: 1 }).skip(skip).limit(limitNum),
      Appointment.countDocuments(query),
    ]);

    sendSuccess(res, appointments, 'Appointments retrieved successfully.', 200, {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err: any) {
    sendError(res, err.message, err.statusCode || 500);
  }
};

export const updateAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, meetingLink, notes, appointmentDate, startTime, endTime } = req.body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (meetingLink) updateData.meetingLink = meetingLink;
    if (notes !== undefined) updateData.notes = notes;
    if (appointmentDate) updateData.appointmentDate = appointmentDate;
    if (startTime) updateData.startTime = startTime;
    if (endTime) updateData.endTime = endTime;

    const appointment = await reserveAppointment(updateData, String(id));
    if (!appointment) {
      sendError(res, 'Appointment not found.', 404);
      return;
    }

    if (appointmentDate || startTime)
      await sendEmail({
        referenceId: String(appointment._id),
        to: appointment.clientEmail,
        subject: 'Appointment rescheduled',
        html: '<p>Your appointment has been rescheduled. Check your management page for the new time.</p>',
      });
    sendSuccess(res, appointment, 'Appointment updated successfully.');
  } catch (err: any) {
    if (err.code === 11000) {
      sendError(res, 'Conflicting appointment: this slot is already booked.', 409);
      return;
    }
    sendError(res, err.message, err.statusCode || 500);
  }
};

export const cancelAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const appointment = await reserveAppointment({ status: 'cancelled' }, String(id));
    if (!appointment) {
      sendError(res, 'Appointment not found.', 404);
      return;
    }

    // Send cancellation notice to client
    sendEmail({
      referenceId: String(appointment._id),
      to: appointment.clientEmail,
      subject: `Cancelled: ${appointment.serviceType} appointment on ${appointment.appointmentDate}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b; background: #f8fafc; border-radius: 8px;">
          <h2 style="color: #ef4444;">Appointment Cancelled</h2>
          <p>Hi ${appointment.clientName},</p>
          <p>Your appointment on <strong>${appointment.appointmentDate} at ${appointment.startTime}</strong> has been cancelled.</p>
          <p>If you would like to book a new time, please visit our booking page at <a href="${env.CLIENT_URL}/book">${env.CLIENT_URL}/book</a>.</p>
          <p>Best regards,<br/><strong>Teja Web Studio</strong></p>
        </div>
      `,
    }).catch((err) => console.error('[Email Error] Cancellation notice failed:', err.message));

    sendSuccess(res, appointment, 'Appointment cancelled successfully.');
  } catch (err: any) {
    sendError(res, err.message, err.statusCode || 500);
  }
};

export const manageAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const appointment = await Appointment.findOne({ manageTokenHash: hashToken(req.body.token) });
    if (!appointment) {
      sendError(res, 'Invalid management code.', 404);
      return;
    }
    const settings = await Setting.findOne();
    if (!settings) {
      sendError(res, 'Booking settings unavailable.', 503);
      return;
    }
    if (req.body.action === 'view') {
      sendSuccess(res, {
        ...appointment.toObject(),
        timeZone: appointment.timeZone || settings.timeZone,
        cancellationHours: settings.cancellationHours,
      });
      return;
    }
    if (
      !['confirmed', 'pending'].includes(appointment.status) ||
      !canClientChange(
        appointment.appointmentDate,
        appointment.startTime,
        settings.cancellationHours,
        appointment.timeZone || settings.timeZone,
      )
    ) {
      sendError(res, 'This booking can no longer be changed online. Contact the studio.', 409);
      return;
    }
    let update: Record<string, any> = { status: 'cancelled' };
    if (req.body.action === 'reschedule') {
      if (!req.body.appointmentDate || !req.body.startTime || !req.body.endTime) {
        sendError(res, 'Choose a new date and slot.', 400);
        return;
      }
      update = {
        appointmentDate: req.body.appointmentDate,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
      };
    }
    const result = await reserveAppointment(update, String(appointment._id));
    await sendEmail({
      referenceId: String(appointment._id),
      to: result.clientEmail,
      subject: req.body.action === 'cancel' ? 'Appointment cancelled' : 'Appointment rescheduled',
      html: '<p>Your appointment was updated. Check your management page for details.</p>',
    });
    sendSuccess(
      res,
      {
        ...result.toObject(),
        timeZone: appointment.timeZone || settings.timeZone,
        cancellationHours: settings.cancellationHours,
      },
      'Booking updated.',
    );
  } catch (error: any) {
    sendError(res, error.message, error.statusCode || 500);
  }
};
export const rotateAppointmentCode = async (req: Request, res: Response): Promise<void> => {
  const token = newToken();
  const appointment = await Appointment.findByIdAndUpdate(req.params.id, {
    manageTokenHash: hashToken(token),
  });
  if (!appointment) {
    sendError(res, 'Appointment not found.', 404);
    return;
  }
  sendSuccess(res, { token }, 'Private code regenerated.');
};
