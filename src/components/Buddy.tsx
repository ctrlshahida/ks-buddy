/** Buddy: the friendly little work-companion robot (public/buddy.png). */
export function Buddy({ size = 120, mood = 'wave', face = false }: { size?: number; mood?: 'wave' | 'listening' | 'thinking'; face?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={`buddy-img ${face ? "face" : ""}`}
      src="/buddy.png"
      width={size}
      height={face ? size : undefined}
      alt="Buddy, your work companion"
    />
  )
}
