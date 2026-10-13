import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { settingsApi } from '../services/api';
import { WebsiteSettings } from '../types';
const defaults = {
  studioName: 'Teja Web Studio',
  tagline: 'Websites for small businesses',
  contactEmail: '',
  logoUrl: '',
  footerText: 'Web design and development',
  brandColor: '#6366f1',
  timeZone: 'Asia/Kolkata',
  cancellationHours: 24,
  pageSeo: {},
  socialLinks: {},
} as WebsiteSettings;
const Context = createContext({ settings: defaults, refresh: async () => {} });
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(defaults);
  const refresh = async () => {
    const data = await settingsApi.get();
    setSettings({ ...defaults, ...data });
  };
  useEffect(() => {
    refresh().catch(() => {});
    const handler = () => {
      refresh().catch(() => {});
    };
    window.addEventListener('settings-updated', handler);
    return () => window.removeEventListener('settings-updated', handler);
  }, []);
  useEffect(() => {
    const hex = settings.brandColor || '#6366f1';
    const values = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255);
    const max = Math.max(...values),
      min = Math.min(...values),
      delta = max - min,
      light = (max + min) / 2;
    let hue = 0;
    if (delta) {
      const [red, green, blue] = values;
      hue =
        max === red
          ? ((green - blue) / delta) % 6
          : max === green
            ? (blue - red) / delta + 2
            : (red - green) / delta + 4;
      hue *= 60;
      if (hue < 0) hue += 360;
    }
    const saturation = delta ? delta / (1 - Math.abs(2 * light - 1)) : 0;
    document.documentElement.style.setProperty(
      '--primary',
      `${hue} ${saturation * 100}% ${light * 100}%`,
    );
  }, [settings.brandColor]);
  return <Context.Provider value={{ settings, refresh }}>{children}</Context.Provider>;
}
export const useSettings = () => useContext(Context);
