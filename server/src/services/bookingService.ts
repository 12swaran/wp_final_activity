import { Appointment, IAppointment } from '../models/Appointment';
import { Setting } from '../models/Setting';

export interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export const getAvailableSlotsForDate = async (dateStr: string): Promise<TimeSlot[]> => {
  // Validate date format YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    throw new Error('Invalid date format. Expected YYYY-MM-DD.');
  }

  // 1. Get studio settings for working hours
  let settings = await Setting.findOne();
  if (!settings) {
    settings = await Setting.create({});
  }

  const { start, end, workDays } = settings.businessHours;
  const slotDuration = settings.slotDurationMinutes || 30;

  // 2. Check if the requested day of week is a working day
  // Note: dateStr is YYYY-MM-DD
  const targetDate = new Date(`${dateStr}T00:00:00`);
  const dayOfWeek = targetDate.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const normalizedDay = dayOfWeek === 0 ? 7 : dayOfWeek; // map to 1-7

  if (!workDays.includes(normalizedDay)) {
    return []; // Closed on this day
  }

  // 3. Generate candidate slots between start and end
  const [startHour, startMin] = start.split(':').map(Number);
  const [endHour, endMin] = end.split(':').map(Number);

  const startTotalMins = startHour * 60 + startMin;
  const endTotalMins = endHour * 60 + endMin;

  const candidateSlots: { startTime: string; endTime: string }[] = [];
  for (let mins = startTotalMins; mins + slotDuration <= endTotalMins; mins += slotDuration) {
    const sH = String(Math.floor(mins / 60)).padStart(2, '0');
    const sM = String(mins % 60).padStart(2, '0');
    const eMins = mins + slotDuration;
    const eH = String(Math.floor(eMins / 60)).padStart(2, '0');
    const eM = String(eMins % 60).padStart(2, '0');

    candidateSlots.push({
      startTime: `${sH}:${sM}`,
      endTime: `${eH}:${eM}`,
    });
  }

  // 4. Query existing confirmed and pending appointments for that date
  const bookedAppointments = await Appointment.find({
    appointmentDate: dateStr,
    status: { $in: ['confirmed', 'pending'] },
  }).select('startTime');

  const bookedStartTimes = new Set(bookedAppointments.map((a) => a.startTime));

  // 5. Check if requested date is today; cull past slots
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentMinsToday = now.getHours() * 60 + now.getMinutes();

  return candidateSlots.map((slot) => {
    const isBooked = bookedStartTimes.has(slot.startTime);
    let isPast = false;

    if (dateStr === todayStr) {
      const [slotH, slotM] = slot.startTime.split(':').map(Number);
      if (slotH * 60 + slotM <= currentMinsToday + 15) { // 15 min buffer
        isPast = true;
      }
    } else if (dateStr < todayStr) {
      isPast = true;
    }

    return {
      startTime: slot.startTime,
      endTime: slot.endTime,
      isAvailable: !isBooked && !isPast,
    };
  });
};

export const bookSlotAtomically = async (data: {
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  serviceType: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  notes?: string;
  idempotencyKey?: string;
}): Promise<IAppointment> => {
  // 1. Verify slot is currently open
  const availableSlots = await getAvailableSlotsForDate(data.appointmentDate);
  const targetSlot = availableSlots.find((s) => s.startTime === data.startTime);

  if (!targetSlot || !targetSlot.isAvailable) {
    const error: any = new Error('The selected appointment time slot is already booked or no longer available.');
    error.statusCode = 409;
    throw error;
  }

  // 2. Perform write. The compound unique index in AppointmentSchema ensures race-condition safety.
  try {
    const appointment = new Appointment({
      ...data,
      status: 'confirmed',
    });
    await appointment.save();
    return appointment;
  } catch (err: any) {
    if (err.code === 11000) {
      const error: any = new Error('This slot was just claimed by another user. Please choose another time.');
      error.statusCode = 409;
      throw error;
    }
    throw err;
  }
};
