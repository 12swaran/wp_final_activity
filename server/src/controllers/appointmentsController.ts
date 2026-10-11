import { Request, Response } from 'express';
import { Appointment } from '../models/Appointment';
import { getAvailableSlotsForDate, bookSlotAtomically } from '../services/bookingService';
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
    sendError(res, err.message, 500);
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
    const appointment = await bookSlotAtomically({
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
      meetingLink
    );
    sendEmail({
      to: appointment.clientEmail,
      subject: confirmation.subject,
      html: confirmation.html,
    }).catch((err) => console.error('[Email Error] Booking confirmation failed:', err.message));

    // Send admin notification
    const adminAlert = emailTemplates.adminNewNotification(
      'Confirmed Appointment',
      `Client: ${appointment.clientName} (${appointment.clientEmail})\nPhone: ${appointment.clientPhone || 'N/A'}\nService: ${appointment.serviceType}\nDate: ${appointment.appointmentDate}\nTime: ${appointment.startTime} - ${appointment.endTime}\nNotes: ${appointment.notes || 'None'}`
    );
    sendEmail({
      to: env.ADMIN_NOTIFICATION_EMAIL,
      subject: adminAlert.subject,
      html: adminAlert.html,
    }).catch((err) => console.error('[Email Error] Admin notification failed:', err.message));

    sendSuccess(res, appointment, 'Appointment booked successfully! A confirmation email with call details has been sent.', 201);
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
    sendError(res, err.message, 500);
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

    const appointment = await Appointment.findByIdAndUpdate(id, updateData, { new: true });
    if (!appointment) {
      sendError(res, 'Appointment not found.', 404);
      return;
    }

    sendSuccess(res, appointment, 'Appointment updated successfully.');
  } catch (err: any) {
    if (err.code === 11000) {
      sendError(res, 'Conflicting appointment: this slot is already booked.', 409);
      return;
    }
    sendError(res, err.message, 500);
  }
};

export const cancelAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findByIdAndUpdate(id, { status: 'cancelled' }, { new: true });
    if (!appointment) {
      sendError(res, 'Appointment not found.', 404);
      return;
    }

    // Send cancellation notice to client
    sendEmail({
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
    sendError(res, err.message, 500);
  }
};
