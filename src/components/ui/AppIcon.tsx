type IconName =
  | 'document'
  | 'calendar'
  | 'check'
  | 'users'
  | 'briefcase'
  | 'message'
  | 'book'
  | 'chart'
  | 'clock'
  | 'warning';

type AppIconProps = {
  name: IconName;
  className?: string;
};

export default function AppIcon({ name, className = 'h-6 w-6' }: AppIconProps) {
  const icons: Record<IconName, React.ReactNode> = {
    document: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z"
      />
    ),
    calendar: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 7V3m8 4V3M5 11h14M7 21h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    ),
    check: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
    users: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m6-4a4 4 0 10-8 0 4 4 0 008 0zm6 0a3 3 0 10-6 0 3 3 0 006 0z"
      />
    ),
    briefcase: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10 6V5a2 2 0 012-2h0a2 2 0 012 2v1m-9 4h14m-16 0a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8z"
      />
    ),
    message: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 10h8m-8 4h5m8-2a9 9 0 11-4.219-7.628L21 3v5h-5"
      />
    ),
    book: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5S19.832 5.477 21 6.253v13C19.832 18.477 18.246 18 16.5 18s-3.332.477-4.5 1.253"
      />
    ),
    chart: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 19V5m0 14h16M8 16v-5m4 5V8m4 8v-7"
      />
    ),
    clock: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6l4 2m5-2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
    warning: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
      />
    ),
  };

  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  );
}