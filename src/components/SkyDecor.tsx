export function SkyDecor() {
  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden -z-10"
      aria-hidden
    >
      <div className="absolute -top-16 right-[8%] h-28 w-28 rounded-full bg-sun/70 blur-sm animate-float-slow" />
      <div className="absolute top-24 left-[5%] text-5xl opacity-30 animate-drift">
        ☁️
      </div>
      <div className="absolute top-40 right-[18%] text-3xl opacity-25 animate-drift-reverse">
        ☁️
      </div>
      <div className="absolute bottom-32 left-[12%] text-4xl opacity-20">
        🌾
      </div>
      <div className="absolute bottom-20 right-[10%] text-3xl opacity-25">
        🐓
      </div>
      <svg
        className="absolute bottom-0 left-0 w-full h-32 text-sage/30"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
      >
        <path
          d="M0,80 Q300,20 600,70 T1200,50 L1200,120 L0,120 Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}
