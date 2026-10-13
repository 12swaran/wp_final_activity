import { useEffect } from 'react';
export function DialogAccessibility() {
  useEffect(() => {
    let dialog: HTMLElement | null = null,
      previous: HTMLElement | null = null;
    const focusable = () =>
      dialog
        ? Array.from(
            dialog.querySelectorAll<HTMLElement>(
              'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex="0"]',
            ),
          ).filter((element) => element.getClientRects().length)
        : [];
    const observe = () => {
      const current = document.querySelector<HTMLElement>('[role="dialog"][aria-modal="true"]');
      if (current === dialog) return;
      if (dialog && !current) {
        previous?.focus();
        document.body.style.overflow = '';
      }
      dialog = current;
      if (dialog) {
        previous = document.activeElement as HTMLElement;
        document.body.style.overflow = 'hidden';
        dialog.tabIndex = -1;
        (focusable()[0] || dialog).focus();
      }
    };
    const keyboard = (event: KeyboardEvent) => {
      if (!dialog) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        dialog.querySelector<HTMLElement>('[data-dialog-close]')?.click();
      }
      if (event.key === 'Tab') {
        const items = focusable();
        if (!items.length) {
          event.preventDefault();
          dialog.focus();
          return;
        }
        const first = items[0],
          last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    const observer = new MutationObserver(observe);
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener('keydown', keyboard);
    observe();
    return () => {
      observer.disconnect();
      document.removeEventListener('keydown', keyboard);
      document.body.style.overflow = '';
    };
  }, []);
  return null;
}
