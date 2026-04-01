"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function useShellNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return {
    pathname,
    mobileOpen,
    setMobileOpen,
    toggleMobileOpen: () => setMobileOpen((open) => !open),
  };
}
