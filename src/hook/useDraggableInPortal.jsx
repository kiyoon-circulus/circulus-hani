import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export function useDraggableInPortal() {
  const portalRef = useRef(null);

  useEffect(() => {
    const el = document.createElement("div");
    el.style.position = "fixed";
    el.style.pointerEvents = "none";
    el.style.top = "0";
    el.style.left = "0";
    el.style.width = "100%";
    el.style.height = "100%";
    el.style.zIndex = "9999";
    document.body.appendChild(el);
    portalRef.current = el;
    return () => document.body.removeChild(el);
  }, []);

  return (render) => (provided, snapshot, rubric) => {
    const child = render(provided, snapshot, rubric);
    if (!snapshot.isDragging) return child;
    return createPortal(child, portalRef.current);
  };
}
