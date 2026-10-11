import React, { useEffect, useState } from 'react';
import { Save, CheckCircle2, Clock, Phone, Mail, Globe } from 'lucide-react';
import { WebsiteSettings } from '../../types';
import { settingsApi } from '../../services/api';

export const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [studioName, setStudioName] = useState('Teja Web Studio');
  const [tagline, setTagline] = useState('Simple, Affordable Websites for Small Businesses');
  const [contactEmail, setContactEmail] = useState('hello@tejastudio.com');
  const [whatsappNumber, setWhatsappNumber] = useState('1234567890');
  const [startHour, setStartHour] = useState('09:00');
  const [endHour, setEndHour] = useState('18:00');
  const [slotDuration, setSlotDuration] = useState(30);
  const [github, setGithub] = useState('https://github.com');
  const [linkedin, setLinkedin] = useState('https://linkedin.com');
  const [twitter, setTwitter] = useState('https://twitter.com');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    settingsApi
      .get()
      .then((data) => {
        if (data) {
          setSettings(data);
          setStudioName(data.studioName || 'Teja Web Studio');
          setTagline(data.tagline || '');
          setContactEmail(data.contactEmail || '');
          setWhatsappNumber(data.whatsappNumber || '');
          if (data.businessHours) {
            setStartHour(data.businessHours.start || '09:00');
            setEndHour(data.businessHours.end || '18:00');
          }
          setSlotDuration(data.slotDurationMinutes || 30);
          if (data.socialLinks) {
            setGithub(data.socialLinks.github || '');
            setLinkedin(data.socialLinks.linkedin || '');
            setTwitter(data.socialLinks.twitter || '');
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    const payload = {
      studioName,
      tagline,
      contactEmail,
      whatsappNumber,
      businessHours: {
        start: startHour,
        end: endHour,
        workDays: [1, 2, 3, 4, 5],
      },
      slotDurationMinutes: Number(slotDuration),
      socialLinks: {
        github,
        linkedin,
        twitter,
      },
    };

    try {
      await settingsApi.update(payload);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Studio &amp; Website Settings</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Configure global studio identity, customer service email, direct WhatsApp number, and appointment calendar slots.
        </p>
      </div>

      {savedSuccess && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3.5 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Website settings updated and synchronized successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Studio Identity Card */}
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" /> Studio Identity
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-white mb-1">Studio Brand Name</label>
              <input
                type="text"
                required
                value={studioName}
                onChange={(e) => setStudioName(e.target.value)}
                className="w-full rounded-xl border border-border bg-secondary px-3.5 py-2 text-xs text-white focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white mb-1">Studio Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full rounded-xl border border-border bg-secondary px-3.5 py-2 text-xs text-white focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-white mb-1 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-primary" /> Primary Contact Email
              </label>
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full rounded-xl border border-border bg-secondary px-3.5 py-2 text-xs text-white focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white mb-1 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-[#25D366]" /> WhatsApp Phone (Numbers only)
              </label>
              <input
                type="text"
                required
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="1234567890"
                className="w-full rounded-xl border border-border bg-secondary px-3.5 py-2 text-xs text-white focus:outline-none focus:border-primary font-mono"
              />
            </div>
          </div>
        </div>

        {/* Appointment Scheduling Settings */}
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Clock className="h-4 w-4 text-indigo-400" /> Booking Engine Working Hours
          </h2>
          <p className="text-xs text-muted-foreground">
            The appointment slot calculator uses these hours to dynamically generate client booking intervals and prevent overlaps.
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-white mb-1">Business Day Start</label>
              <input
                type="time"
                value={startHour}
                onChange={(e) => setStartHour(e.target.value)}
                className="w-full rounded-xl border border-border bg-secondary px-3.5 py-2 text-xs text-white focus:outline-none focus:border-primary font-mono cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white mb-1">Business Day End</label>
              <input
                type="time"
                value={endHour}
                onChange={(e) => setEndHour(e.target.value)}
                className="w-full rounded-xl border border-border bg-secondary px-3.5 py-2 text-xs text-white focus:outline-none focus:border-primary font-mono cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white mb-1">Slot Duration (Minutes)</label>
              <select
                value={slotDuration}
                onChange={(e) => setSlotDuration(Number(e.target.value))}
                className="w-full rounded-xl border border-border bg-secondary px-3.5 py-2 text-xs text-white focus:outline-none focus:border-primary"
              >
                <option value={15}>15 Minutes</option>
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes</option>
                <option value={60}>60 Minutes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Social Links</h2>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">GitHub URL</label>
              <input
                type="url"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                className="w-full rounded-xl border border-border bg-secondary px-3.5 py-2 text-xs text-white focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">LinkedIn URL</label>
              <input
                type="url"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                className="w-full rounded-xl border border-border bg-secondary px-3.5 py-2 text-xs text-white focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Twitter / X URL</label>
              <input
                type="url"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                className="w-full rounded-xl border border-border bg-secondary px-3.5 py-2 text-xs text-white focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="glow-card inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-xs font-semibold text-white shadow-glow hover:scale-105 transition-all disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'Saving Settings...' : 'Save Website Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
