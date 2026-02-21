// Shared scroll progress — written by GSAP ScrollTrigger, read by R3F scene
export const scrollProgress = { current: 0 }

// Mobile detection
export const isMobile =
  typeof window !== 'undefined' &&
  (window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent))
