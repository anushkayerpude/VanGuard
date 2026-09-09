import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { ArrowUp } from 'lucide-react';

interface SmoothScrollContextType {
  lenis: Lenis | null;
  scrollTo: (
    target: string | number | HTMLElement,
    options?: { offset?: number; duration?: number; immediate?: boolean }
  ) => void;
  scrollToTop: () => void;
}

const SmoothScrollContext = createContext<SmoothScrollContextType>({
  lenis: null,
  scrollTo: () => {},
  scrollToTop: () => {},
});

export const useSmoothScroll = () => useContext(SmoothScrollContext);

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const lenisRef = useRef<Lenis | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    // Respect reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.25,
      infinite: false,
      autoRaf: true,
      anchors: true,
      allowNestedScroll: true,
      prevent: (node) => {
        // Prevent Lenis wheel hijacking inside tactical maps, 3D globes, and interactive canvases
        if (!node || !(node instanceof HTMLElement)) return false;
        return (
          node.tagName === 'CANVAS' ||
          node.hasAttribute('data-lenis-prevent') ||
          Boolean(node.closest('[data-lenis-prevent]'))
        );
      },
    });

    lenisRef.current = lenis;
    (window as any).lenis = lenis;

    // Listen to scroll to toggle "Back to Top" indicator
    const handleScroll = () => {
      const scrollPos = window.scrollY || document.documentElement.scrollTop || 0;
      setShowScrollTop(scrollPos > 480);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Universal anchor click handler to guarantee silky smooth scroll across all devices
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a[href^="#"]');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href || href === '#' || href.length <= 1) return;

      const targetEl = document.querySelector(href);
      if (targetEl instanceof HTMLElement) {
        e.preventDefault();
        lenis.scrollTo(targetEl, {
          offset: -84, // Account for fixed tactical header height
          duration: 1.2,
        });
      }
    };

    document.addEventListener('click', handleAnchorClick);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleAnchorClick);
      lenis.destroy();
      lenisRef.current = null;
      delete (window as any).lenis;
    };
  }, []);

  const scrollTo = useCallback(
    (
      target: string | number | HTMLElement,
      options?: { offset?: number; duration?: number; immediate?: boolean }
    ) => {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(target, {
          offset: options?.offset ?? -84,
          duration: options?.duration ?? 1.15,
          immediate: options?.immediate ?? false,
        });
      } else {
        if (typeof target === 'number') {
          window.scrollTo({ top: target, behavior: 'smooth' });
        } else if (typeof target === 'string') {
          const el = document.querySelector(target);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (target instanceof HTMLElement) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    },
    []
  );

  const scrollToTop = useCallback(() => {
    scrollTo(0, { duration: 1.0 });
  }, [scrollTo]);

  return (
    <SmoothScrollContext.Provider value={{ lenis: lenisRef.current, scrollTo, scrollToTop }}>
      {children}

      {/* Floating Tactical "Back to Top" Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          type="button"
          aria-label="Scroll back to top"
          className="fixed bottom-6 right-6 z-50 p-2.5 rounded-xl bg-[#091007]/90 hover:bg-[#111c0a] border border-[#526a27]/70 hover:border-[#a4c639] text-[#a4c639] hover:text-[#c6ff00] shadow-[0_0_25px_rgba(0,0,0,0.85)] backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-1.5 font-mono text-[10px] font-bold cursor-pointer group"
        >
          <ArrowUp className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5" />
          <span className="hidden sm:inline tracking-wider">TOP</span>
        </button>
      )}
    </SmoothScrollContext.Provider>
  );
}
