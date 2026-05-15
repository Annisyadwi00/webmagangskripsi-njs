type ThemeIconProps = {
  type: 'sun' | 'moon';
  className?: string;
};

export default function ThemeIcon({
  type,
  className = 'h-5 w-5',
}: ThemeIconProps) {
  if (type === 'sun') {
    return (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 4V2m0 20v-2m8-8h2M2 12h2m14.95-6.95 1.414-1.414M3.636 20.364 5.05 18.95m0-13.9L3.636 3.636M20.364 20.364 18.95 18.95M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z"
        />
      </svg>
    );
  }

  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 14.5A8.5 8.5 0 0 1 9.5 3a7 7 0 1 0 11.5 11.5z"
      />
    </svg>
  );
}