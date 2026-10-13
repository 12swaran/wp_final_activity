import { useState, useEffect } from 'react';
import { api, appointmentsApi } from '../../services/api';
import { Field, fieldClass } from '../../components/common/Forms';
export function ManageBookingPage() {
  const [token, setToken] = useState(() => window.location.hash.slice(1)),
    [booking, setBooking] = useState<any>(null),
    [date, setDate] = useState(''),
    [slots, setSlots] = useState<any[]>([]),
    [start, setStart] = useState(''),
    [error, setError] = useState('');
  useEffect(() => {
    setStart('');
    if (date)
      appointmentsApi
        .getAvailableSlots(date)
        .then((data) => setSlots(data.slots.filter((slot: any) => slot.isAvailable)))
        .catch(() => setSlots([]));
  }, [date]);
  const manage = async (action: string) => {
    setError('');
    const slot = slots.find((value) => value.startTime === start);
    try {
      const data = (
        await api.post('/appointments/manage', {
          token,
          action,
          ...(action === 'reschedule' && slot
            ? { appointmentDate: date, startTime: slot.startTime, endTime: slot.endTime }
            : {}),
        })
      ).data.data;
      setBooking(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Unable to update booking.');
    }
  };
  return (
    <div className="mx-auto max-w-xl px-6 pt-32 pb-24 space-y-6">
      <h1 className="text-3xl">Manage your booking</h1>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          manage('view');
        }}
      >
        <Field label="Private management code" value={token} onChange={setToken} required />
        <button className="bg-primary rounded-xl px-5 py-2">View booking</button>
      </form>
      {error && (
        <p role="alert" className="text-rose-300">
          {error}
        </p>
      )}
      {booking && (
        <section className="space-y-4 border border-border rounded-xl p-6">
          <h2>{booking.serviceType}</h2>
          <p>
            {booking.appointmentDate} · {booking.startTime}–{booking.endTime} ({booking.timeZone})
          </p>
          <p>Status: {booking.status}</p>
          <p className="text-sm">
            Changes must be made more than {booking.cancellationHours} hours before the appointment.
          </p>
          {['pending', 'confirmed'].includes(booking.status) && (
            <>
              <Field type="date" label="New appointment date" value={date} onChange={setDate} />
              <label htmlFor="manage-slot" className="block">
                Available time
              </label>
              <select
                id="manage-slot"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className={fieldClass}
              >
                <option value="">Select a time</option>
                {slots.map((slot) => (
                  <option key={slot.startTime} value={slot.startTime}>
                    {slot.startTime}–{slot.endTime}
                  </option>
                ))}
              </select>
              <button
                disabled={!start}
                className="bg-primary rounded-xl px-5 py-2 disabled:opacity-40"
                onClick={() => manage('reschedule')}
              >
                Reschedule
              </button>
              <button
                className="block text-rose-300"
                onClick={() => {
                  if (window.confirm('Cancel this booking?')) manage('cancel');
                }}
              >
                Cancel booking
              </button>
            </>
          )}
        </section>
      )}
    </div>
  );
}
