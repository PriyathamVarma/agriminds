type IconProps = { className?: string };

export function LinkedinIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M4.983 3.5C4.983 4.881 3.87 6 2.5 6S.017 4.881.017 3.5 1.13 1 2.5 1s2.483 1.119 2.483 2.5zM.222 8.222H4.7V23H.222V8.222zM8.222 8.222h4.288v2.016h.06c.598-1.133 2.058-2.328 4.234-2.328 4.528 0 5.365 2.982 5.365 6.86V23h-4.477v-6.53c0-1.557-.028-3.56-2.168-3.56-2.17 0-2.502 1.694-2.502 3.445V23H8.222V8.222z" />
    </svg>
  );
}

export function XIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <path d="M17.5 6.5h.01" />
    </svg>
  );
}
