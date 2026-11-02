"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

interface SidebarContextType {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Restaurar preferencia de colapsado desde localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("synkro_sidebar_collapsed");
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      }
    } catch {
      // Ignorar restricciones en entornos restrictivos
    }
  }, []);

  const handleSetCollapsed = useCallback((val: boolean) => {
    setIsCollapsed(val);
    try {
      localStorage.setItem("synkro_sidebar_collapsed", String(val));
    } catch {
      // Ignorar
    }
  }, []);

  const toggleSidebar = useCallback(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setIsMobileOpen((prev) => !prev);
    } else {
      setIsCollapsed((prev) => {
        const next = !prev;
        try {
          localStorage.setItem("synkro_sidebar_collapsed", String(next));
        } catch {
          // Ignorar
        }
        return next;
      });
    }
  }, []);

  // Atajo de teclado Ctrl+B / Cmd+B para alternar el menú
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  return (
    <SidebarContext.Provider
      value={{
        isMobileOpen,
        setIsMobileOpen,
        isCollapsed,
        setIsCollapsed: handleSetCollapsed,
        toggleSidebar,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebarLayout() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebarLayout must be used within a SidebarProvider");
  }
  return context;
}

