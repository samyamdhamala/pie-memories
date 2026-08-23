// Minimal thin-stroke icon set, styled after Pie's own nav/meta iconography.
type IconProps = { size?: number };

const base = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export function IconHome({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" />
    </svg>
  );
}

export function IconCalendar({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <rect x="4" y="5.5" width="16" height="14" rx="2" />
      <path d="M8 3.5v4M16 3.5v4M4 10h16" />
    </svg>
  );
}

export function IconPeople({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <circle cx="9" cy="8" r="2.75" />
      <circle cx="16.5" cy="9.5" r="2.1" />
      <path d="M3.5 19c.6-3 2.7-4.8 5.5-4.8s4.9 1.8 5.5 4.8M15 14.6c2 .2 3.5 1.6 4 4" />
    </svg>
  );
}

export function IconSearch({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M20 20 15.5 15.5" />
    </svg>
  );
}

export function IconBell({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <path d="M18 15.5c-.6-1-1-2.7-1-4.7a5 5 0 0 0-10 0c0 2-.4 3.7-1 4.7a1 1 0 0 0 .9 1.5h10.2a1 1 0 0 0 .9-1.5" />
      <path d="M9.5 19.5a2.5 2.5 0 0 0 5 0" />
    </svg>
  );
}

export function IconChat({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <path d="M4.5 12a7.5 7.5 0 1 1 2.7 5.8L4 18.5l.9-3.3A7.4 7.4 0 0 1 4.5 12" />
    </svg>
  );
}

export function IconPin({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11" />
      <circle cx="12" cy="10" r="2.2" />
    </svg>
  );
}

export function IconClock({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4.5l3 2" />
    </svg>
  );
}

export function IconDollar({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7.5v9M14.5 9.7c-.4-.7-1.2-1.1-2.2-1.1-1.3 0-2.4.8-2.4 1.9 0 1.2 1.1 1.7 2.6 2 1.5.3 2.4.9 2.4 2.1 0 1.1-1.1 1.9-2.4 1.9-1.1 0-1.9-.4-2.4-1.1" />
    </svg>
  );
}

export function IconCheck({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <path d="M5 12.5 10 17l9-10" />
    </svg>
  );
}

export function IconX({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function IconBookmark({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <path d="M6 4.5h12V20l-6-4-6 4z" />
    </svg>
  );
}

export function IconShare({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <path d="M12 15V4M8 8l4-4 4 4M5 14v4.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V14" />
    </svg>
  );
}
