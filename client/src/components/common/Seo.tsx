import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
export function Seo({ title, description }: { title?: string; description?: string }) {
  const { pathname } = useLocation();
  const { settings } = useSettings();
  useEffect(() => {
    const metadata = settings.pageSeo?.[pathname];
    document.title =
      title ||
      metadata?.title ||
      `${pathname === '/' ? 'Home' : pathname.split('/').filter(Boolean).join(' · ')} | ${settings.studioName}`;
    const meta =
      document.querySelector('meta[name="description"]') ||
      document.head.appendChild(document.createElement('meta'));
    meta.setAttribute('name', 'description');
    meta.setAttribute('content', description || metadata?.description || settings.tagline);
    const canonical =
      document.querySelector('link[rel="canonical"]') ||
      document.head.appendChild(document.createElement('link'));
    canonical.setAttribute('rel', 'canonical');
    canonical.setAttribute('href', window.location.origin + pathname);
    const robots =
      document.querySelector('meta[name="robots"]') ||
      document.head.appendChild(document.createElement('meta'));
    robots.setAttribute('name', 'robots');
    robots.setAttribute(
      'content',
      /^\/(admin|track|manage-booking)/.test(pathname) ? 'noindex,nofollow' : 'index,follow',
    );
  }, [pathname, title, description, settings]);
  return null;
}
