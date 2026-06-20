export default function LogoIcon({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <span
      className={`relative inline-flex ${className} shrink-0 items-center justify-center rounded-full bg-white`}
      aria-hidden
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="black"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-[55%] w-[55%]"
      >
        {/* base */}
        <path d="M8 18h8" />
        {/* pillar */}
        <line x1="12" y1="4" x2="12" y2="18" />
        {/* beam */}
        <line x1="4" y1="6" x2="20" y2="6" />
        {/* left chain */}
        <line x1="4" y1="6" x2="4" y2="10" />
        {/* right chain */}
        <line x1="20" y1="6" x2="20" y2="10" />
        {/* left pan */}
        <path d="M1.5 10.5 Q4 13 6.5 10.5" />
        {/* right pan */}
        <path d="M17.5 10.5 Q20 13 22.5 10.5" />
      </svg>
    </span>
  );
}
