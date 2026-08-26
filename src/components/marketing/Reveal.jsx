import { useEffect, useRef, useState } from "react";

/**
 * Scroll-reveal wrapper. Fades/slides children in the first time they
 * enter the viewport. Pure IntersectionObserver + CSS transition — no
 * animation libraries. Respects prefers-reduced-motion via CSS.
 */
function Reveal({ className = "", delay = 0, children, ...rest }) {
  const ref = useRef(null);
  // If IntersectionObserver is unavailable, show content immediately.
  const [visible, setVisible] = useState(
    () => typeof IntersectionObserver === "undefined",
  );

  useEffect(() => {
    const node = ref.current;
    if (!node || visible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [visible]);

  return (
    <div
      ref={ref}
      className={`cw-reveal ${visible ? "is-visible" : ""} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      {...rest}
    >
      {children}
    </div>
  );
}

export default Reveal;
