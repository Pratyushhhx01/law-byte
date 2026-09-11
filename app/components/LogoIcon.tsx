export default function LogoIcon({
  className = "h-7 w-7",
}: {
  className?: string;
}) {
  return (
    <span
      className={`relative inline-flex ${className} shrink-0 items-center justify-center`}
      aria-hidden
    >
      <svg
        viewBox="0 0 64 64"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-full w-full"
      >
        <path d="M32 4 L60 32 L32 60 L4 32 Z" />
        <ellipse cx="32" cy="24" rx="12" ry="14" />
        <ellipse cx="32" cy="40" rx="12" ry="14" />
      </svg>
    </span>
  );
}
