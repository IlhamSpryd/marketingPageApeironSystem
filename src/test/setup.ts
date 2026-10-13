import "@testing-library/jest-dom/vitest";

Object.defineProperty(window, "scrollTo", {
  writable: true,
  value: () => {},
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

class MockObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof window.ResizeObserver === "undefined") {
  window.ResizeObserver = MockObserver as unknown as typeof ResizeObserver;
  globalThis.ResizeObserver = MockObserver as unknown as typeof ResizeObserver;
}

if (typeof window.IntersectionObserver === "undefined") {
  window.IntersectionObserver = MockObserver as unknown as typeof IntersectionObserver;
  globalThis.IntersectionObserver = MockObserver as unknown as typeof IntersectionObserver;
}
