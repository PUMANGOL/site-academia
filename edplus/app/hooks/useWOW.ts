"use client";

import { useEffect } from "react";

export type UseWOWOptions = {
  /** Class marking the elements to reveal on scroll. */
  boxClass?: string;
  /** Class added to an element once it enters the viewport. */
  animateClass?: string;
  /** Distance in pixels before the viewport edge at which an element is revealed. */
  offset?: number;
  /** Animate on mobile devices too. */
  mobile?: boolean;
  /** Watch the DOM for boxes added after mount. */
  live?: boolean;
};

const MOBILE_UA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

/**
 * Scroll-triggered animate.css reveals, following the WOW.js conventions:
 * elements carrying `boxClass` stay hidden until they scroll into view, then
 * receive `animateClass` plus any `data-wow-duration|delay|iteration` settings.
 */
export function useWOW({
  boxClass = "wow",
  animateClass = "animated",
  offset = 0,
  mobile = true,
  live = true,
}: UseWOWOptions = {}) {
  useEffect(() => {
    const supportsAnimation =
      typeof window !== "undefined" && "IntersectionObserver" in window;
    const skipAnimation =
      !supportsAnimation || (!mobile && MOBILE_UA.test(navigator.userAgent));

    const reveal = (box: HTMLElement) => {
      const duration = box.dataset.wowDuration;
      const delay = box.dataset.wowDelay;
      const iteration = box.dataset.wowIteration;

      if (duration) box.style.animationDuration = duration;
      if (delay) box.style.animationDelay = delay;
      if (iteration) box.style.animationIterationCount = iteration;

      box.style.visibility = "visible";
      box.style.animationName = "";
      box.classList.add(...animateClass.split(" ").filter(Boolean));
    };

    if (skipAnimation) {
      document
        .querySelectorAll<HTMLElement>(`.${boxClass}`)
        .forEach((box) => (box.style.visibility = "visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          reveal(entry.target as HTMLElement);
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: `${offset}px 0px ${offset}px 0px` }
    );

    const tracked = new WeakSet<HTMLElement>();

    const track = (root: ParentNode) => {
      const boxes = [
        ...(root instanceof HTMLElement && root.classList.contains(boxClass)
          ? [root]
          : []),
        ...root.querySelectorAll<HTMLElement>(`.${boxClass}`),
      ];

      boxes.forEach((box) => {
        if (tracked.has(box)) return;
        tracked.add(box);
        // Hide up front so the animation starts from its first keyframe.
        box.style.visibility = "hidden";
        box.style.animationName = "none";
        observer.observe(box);
      });
    };

    track(document.body);

    let mutationObserver: MutationObserver | undefined;
    if (live) {
      mutationObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) track(node as Element);
          });
        });
      });
      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      observer.disconnect();
      mutationObserver?.disconnect();
    };
  }, [boxClass, animateClass, offset, mobile, live]);
}
