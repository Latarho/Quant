import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = React.useState<boolean>(false);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const updateIsMobile = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches);
    };
    setIsMobile(mql.matches);
    if (mql.addEventListener) {
      mql.addEventListener("change", updateIsMobile);
      return () => mql.removeEventListener("change", updateIsMobile);
    } else {
      mql.addListener(updateIsMobile);
      return () => mql.removeListener(updateIsMobile);
    }
  }, []);

  return isMobile;
}
