import { useRef, useState, useCallback, type ReactNode } from "react";
import { Check, X } from "lucide-react";

type SwipeDirection = "left" | "right" | null;

type SwipeCardProps = {
  children: ReactNode;
  onSwipe: (direction: "left" | "right") => void;
  disabled?: boolean;
};

export function SwipeCard({ children, onSwipe, disabled = false }: SwipeCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const currentX = useRef(0);
  const [offsetX, setOffsetX] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [exitDir, setExitDir] = useState<"left" | "right" | null>(null);

  const threshold = 100;

  const getDirection = useCallback(
    (dx: number): SwipeDirection => {
      if (dx > threshold) return "right";
      if (dx < -threshold) return "left";
      return null;
    },
    [threshold],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled || isExiting) return;
      dragging.current = true;
      startX.current = e.clientX;
      startY.current = e.clientY;
      currentX.current = 0;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [disabled, isExiting],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current || disabled || isExiting) return;
      const dx = e.clientX - startX.current;
      const dy = e.clientY - startY.current;
      if (Math.abs(dy) > Math.abs(dx) * 1.2 && Math.abs(dx) < 20) return;
      currentX.current = dx;
      setOffsetX(dx);
    },
    [disabled, isExiting],
  );

  const handlePointerUp = useCallback(() => {
    if (!dragging.current || disabled || isExiting) return;
    dragging.current = false;

    const dx = currentX.current;
    if (Math.abs(dx) > threshold) {
      const dir = dx > 0 ? "right" : "left";
      setExitDir(dir);
      setIsExiting(true);
      setTimeout(() => {
        setOffsetX(0);
        setIsExiting(false);
        setExitDir(null);
        onSwipe(dir);
      }, 350);
    } else {
      setOffsetX(0);
    }
  }, [disabled, isExiting, threshold, onSwipe]);

  const direction = getDirection(offsetX);
  const rotation = offsetX * 0.08;
  const opacity = Math.max(0.5, 1 - Math.abs(offsetX) / 400);

  const animStyle = isExiting
    ? {
        animation:
          exitDir === "right"
            ? "fly-right 0.35s ease-out forwards"
            : "fly-left 0.35s ease-out forwards",
      }
    : {
        transform: `translateX(${offsetX}px) rotate(${rotation}deg)`,
        transition: dragging.current ? "none" : "transform 0.3s ease, opacity 0.3s ease",
        opacity: dragging.current ? opacity : 1,
      };

  return (
    <div className="relative select-none touch-none" style={{ animation: "pop-in 0.3s ease-out" }}>
      {/* Verdadero hint (right) */}
      <div
        className={`pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-3xl border-4 border-success bg-success/10 transition-opacity duration-150 ${
          direction === "right" ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex items-center gap-2 rounded-full bg-success/90 px-5 py-2 text-lg font-black text-white shadow-lg">
          <Check className="h-6 w-6" /> VERDADERO
        </div>
      </div>

      {/* Falso hint (left) */}
      <div
        className={`pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-3xl border-4 border-destructive bg-destructive/10 transition-opacity duration-150 ${
          direction === "left" ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex items-center gap-2 rounded-full bg-destructive/90 px-5 py-2 text-lg font-black text-white shadow-lg">
          <X className="h-6 w-6" /> FALSO
        </div>
      </div>

      {/* Card */}
      <div
        ref={cardRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative z-20 cursor-grab active:cursor-grabbing"
        style={animStyle}
      >
        {children}
      </div>
    </div>
  );
}
