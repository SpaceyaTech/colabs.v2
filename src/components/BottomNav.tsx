import { useRef, useCallback, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { workspaceItems } from "@/config/nav";
import { motion } from "framer-motion";

const navItems = workspaceItems;

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const activeIndex = navItems.findIndex(
    (item) =>
      item.url === "/dashboard"
        ? location.pathname === "/dashboard"
        : location.pathname.startsWith(item.url)
  );

  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      const dy = e.changedTouches[0].clientY - touchStartY.current;

      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        const direction = dx < 0 ? 1 : -1;
        const nextIndex = activeIndex + direction;
        if (nextIndex >= 0 && nextIndex < navItems.length) {
          navigate(navItems[nextIndex].url);
        }
      }
    },
    [activeIndex, navigate]
  );

  useEffect(() => {
    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchEnd]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <ul className={`grid grid-cols-${navItems.length} relative`}>
        {activeIndex >= 0 && (
          <motion.div
            className="absolute top-0 h-0.5 bg-primary"
            style={{ width: `${100 / navItems.length}%` }}
            animate={{ left: `${(activeIndex / navItems.length) * 100}%` }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          />
        )}

        {navItems.map((item, i) => {
          const isActive = i === activeIndex;
          return (
            <li key={item.title} className="flex items-center justify-center">
              <NavLink
                to={item.url}
                end={item.url === "/dashboard"}
                className="flex flex-col items-center justify-center h-14 w-full text-xs gap-1 transition-colors"
              >
                <motion.div
                  animate={isActive ? { scale: 1.15, y: -1 } : { scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 22 }}
                  className={isActive ? "text-primary" : "text-muted-foreground"}
                >
                  <item.icon className="h-5 w-5" />
                </motion.div>
                <span
                  className={`transition-colors duration-200 ${
                    isActive ? "text-primary font-medium" : "text-muted-foreground"
                  }`}
                >
                  {item.title}
                </span>
              </NavLink>
            </li>
          );
        })}
      </ul>
      <div className="pb-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
