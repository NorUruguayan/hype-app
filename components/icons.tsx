// components/icons.tsx
// Minimal, crisp inline SVG icons. All inherit currentColor.

export function IconCompass(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      <path fill="currentColor" d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2Zm3.9 6.1-2.1 5.5a2 2 0 0 1-1.2 1.2l-5.5 2.1 2.1-5.5a2 2 0 0 1 1.2-1.2l5.5-2.1Z"/>
    </svg>
  );
}

export function IconUser(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      <path fill="currentColor" d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-5 0-9 2.5-9 5.5V22h18v-2.5C21 16.5 17 14 12 14Z"/>
    </svg>
  );
}

export function IconSparkles(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      <path fill="currentColor" d="M9 2 7.5 7.5 2 9l5.5 1.5L9 16l1.5-5.5L16 9 10.5 7.5 9 2Zm8 3-.9 3.1L13 9l3.1.9L17 13l.9-3.1L21 9l-3.1-.9L17 5Zm-2 8-1 3.4L10.6 18 14 19l1 3.4L16 19l3.4-1-3.4-1Z"/>
    </svg>
  );
}

export function IconGear(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      <path fill="currentColor" d="M19.4 12.9a7.8 7.8 0 0 0 0-1.8l2-1.6-1.9-3.3-2.3.6a6.9 6.9 0 0 0-1.6-.9L15.2 2h-3.8l-.4 2.9c-.6.2-1.1.5-1.6.9l-2.3-.6L5.2 9.5l2 1.6a7.8 7.8 0 0 0 0 1.8l-2 1.6 1.9 3.3 2.3-.6c.5.4 1 .7 1.6.9l.4 2.9h3.8l.4-2.9c.6-.2 1.1-.5 1.6-.9l2.3.6 1.9-3.3-2-1.6ZM12 15.5A3.5 3.5 0 1 1 15.5 12 3.5 3.5 0 0 1 12 15.5Z"/>
    </svg>
  );
}

export function IconDoor(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      <path fill="currentColor" d="M3 3h12v18H3V3Zm14 4h4v10h-4v2h6V5h-6v2ZM9 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"/>
    </svg>
  );
}

export function IconBell(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      <path fill="currentColor" d="M12 22a2.5 2.5 0 0 1-2.45-2h4.9A2.5 2.5 0 0 1 12 22Zm8-6v-4a8 8 0 1 0-16 0v4l-2 2v1h20v-1l-2-2Z"/>
    </svg>
  );
}

export function IconPlus(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      <path fill="currentColor" d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2h6Z"/>
    </svg>
  );
}

/** Extra icons for notifications & empty states */
export function IconUserPlus(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      <path fill="currentColor" d="M16 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-9 1c-3.3 0-6 1.7-6 3.8V20h12v-4.2C13 13.7 10.3 12 7 12Zm14 1h-2v-2h-2v2h-2v2h2v2h2v-2h2v-2Z"/>
    </svg>
  );
}

export function IconAt(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      <path fill="currentColor" d="M12 4a8 8 0 1 0 8 8v-1h-2v1a6 6 0 1 1-2.1-4.6A3.5 3.5 0 0 0 20 11v3a2 2 0 0 1-2 2h-1.3a1 1 0 0 1-1-1V9.8a1 1 0 1 1 2 0V11h1a1 1 0 0 0 1-1 6 6 0 0 0-6-6Z"/>
    </svg>
  );
}

export function IconInbox(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      <path fill="currentColor" d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Zm-1 12h-3.2a2 2 0 0 1-1.6-.8l-.4-.54a1 1 0 0 0-1.6 0l-.4.54a2 2 0 0 1-1.6.8H6v4h12v-4Zm0-9H6v7h3.2c.63 0 1.22-.3 1.6-.8l.4-.54a1 1 0 0 1 1.6 0l.4.54c.38.5.97.8 1.6.8H18V6Z"/>
    </svg>
  );
}