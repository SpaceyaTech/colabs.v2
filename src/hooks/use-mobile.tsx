import * as React from 'react';

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  // Lazy initializer reads window.innerWidth synchronously at mount;
  // the effect only wires up the media-query listener for subsequent changes
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(() =>
    globalThis.window === undefined ? undefined : globalThis.window.innerWidth < MOBILE_BREAKPOINT
  );

  React.useEffect(() => {
    const mql = globalThis.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(globalThis.window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return !!isMobile;
}
