import mongoose from 'mongoose';
import { Appointment, IAppointment } from '../models/Appointment';
import { BookingLock } from '../models/BookingLock';
import { Setting } from '../models/Setting';
import {
  validDate,
  minutes,
  formatTime,
  zonedNow,
  overlaps,
  wallTimeInstant,
} from '../utils/bookingRules';

export interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}
const conflict = (message: string, statusCode = 409) =>
  Object.assign(new Error(message), { statusCode });
export const getAvailableSlotsForDate = async (
  dateStr: string,
  excludeId?: string,
): Promise<TimeSlot[]> => {
  if (!validDate(dateStr)) throw conflict('Invalid calendar date.', 400);
  const settings = await Setting.findOne();
  if (!settings) throw conflict('Booking settings unavailable.', 503);
  const { start, end, workDays } = settings.businessHours;
  const weekday = new Date(`${dateStr}T00:00:00Z`).getUTCDay() || 7;
  if (!workDays.includes(weekday)) return [];
  const current = zonedNow(settings.timeZone);
  const appointments = await Appointment.find({
    appointmentDate: dateStr,
    status: { $in: ['pending', 'confirmed'] },
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  }).select('startTime endTime');
  const slots: TimeSlot[] = [];
  for (
    let value = minutes(start);
    value + settings.slotDurationMinutes <= minutes(end);
    value += settings.slotDurationMinutes
  ) {
    const startTime = formatTime(value),
      endTime = formatTime(value + settings.slotDurationMinutes);
    const future =
      dateStr > current.date || (dateStr === current.date && value > current.minute + 15);
    slots.push({
      startTime,
      endTime,
      isAvailable:
        future &&
        wallTimeInstant(dateStr, startTime, settings.timeZone) !== null &&
        wallTimeInstant(dateStr, endTime, settings.timeZone) !== null &&
        !appointments.some((other) => overlaps(startTime, endTime, other.startTime, other.endTime)),
    });
  }
  return slots;
};

export const reserveAppointment = async (
  data: Record<string, any>,
  id?: string,
): Promise<IAppointment> => {
  const existing = id ? await Appointment.findById(id) : null;
  if (!existing) {
    const settings = await Setting.findOne();
    if (!settings) throw conflict('Booking settings unavailable.', 503);
    data.timeZone = settings.timeZone;
  }
  if (id && !existing) throw conflict('Appointment not found.', 404);
  const merged = { ...(existing?.toObject() || {}), ...data };
  const active = ['pending', 'confirmed'].includes(merged.status || 'confirmed');
  const changedSlot =
    !existing ||
    !['pending', 'confirmed'].includes(existing.status) ||
    existing.appointmentDate !== merged.appointmentDate ||
    existing.startTime !== merged.startTime ||
    existing.endTime !== merged.endTime;
  if (active && changedSlot) {
    const slots = await getAvailableSlotsForDate(String(merged.appointmentDate), id);
    if (
      !slots.some(
        (slot) =>
          slot.startTime === merged.startTime &&
          slot.endTime === merged.endTime &&
          slot.isAvailable,
      )
    )
      throw conflict('Choose an available slot with the correct duration.');
  }
  const session = await mongoose.startSession();
  let result: IAppointment | undefined;
  try {
    await session.withTransaction(async () => {
      if (existing) await BookingLock.deleteMany({ appointmentId: existing._id }, { session });
      const appointment = existing
        ? await Appointment.findOneAndUpdate(
            { _id: id!, updatedAt: existing.updatedAt },
            { $set: data },
            { new: true, runValidators: true, session },
          )
        : new Appointment({ ...data, status: data.status || 'confirmed' });
      if (!appointment) throw conflict('Appointment changed. Refresh and try again.');
      if (!existing) await appointment.save({ session });
      if (active) {
        const others = await Appointment.find({
          appointmentDate: appointment.appointmentDate,
          status: { $in: ['confirmed', 'pending'] },
          _id: { $ne: appointment._id },
        }).session(session);
        if (
          others.some((other) =>
            overlaps(appointment.startTime, appointment.endTime, other.startTime, other.endTime),
          )
        )
          throw conflict('Appointment overlaps an existing booking.');
        const locks = [];
        for (
          let minute = minutes(appointment.startTime);
          minute < minutes(appointment.endTime);
          minute++
        )
          locks.push({ date: appointment.appointmentDate, minute, appointmentId: appointment._id });
        await BookingLock.insertMany(locks, { session });
      }
      result = appointment;
    });
    return result!;
  } catch (error: any) {
    if (error.code === 11000) throw conflict('This time is already reserved. Choose another slot.');
    throw error;
  } finally {
    await session.endSession();
  }
};
export const bookSlotAtomically = (data: Record<string, any>) => reserveAppointment(data);

export async function initializeReservations() {
  await BookingLock.init();
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const appointments = await Appointment.find({
        status: { $in: ['confirmed', 'pending'] },
      }).session(session);
      for (const appointment of appointments) {
        const start = minutes(appointment.startTime),
          end = minutes(appointment.endTime);
        if (
          !validDate(appointment.appointmentDate) ||
          !Number.isFinite(start) ||
          !Number.isFinite(end) ||
          start < 0 ||
          end > 1440 ||
          start >= end
        )
          throw new Error(
            'An existing appointment has invalid date or times. Repair it before enabling bookings.',
          );
        const writes = [];
        for (let minute = start; minute < end; minute++)
          writes.push({
            updateOne: {
              filter: { date: appointment.appointmentDate, minute, appointmentId: appointment._id },
              update: {
                $setOnInsert: {
                  date: appointment.appointmentDate,
                  minute,
                  appointmentId: appointment._id,
                },
              },
              upsert: true,
            },
          });
        await BookingLock.bulkWrite(writes, { session });
      }
    });
  } finally {
    await session.endSession();
  }
}
