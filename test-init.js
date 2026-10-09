const { JSDOM } = require("jsdom");
const dom = new JSDOM(`<!DOCTYPE html><div id="root"></div>`);
global.window = dom.window;
global.document = dom.window.document;
global.matchMedia = () => ({
  matches: false,
  addEventListener: () => {},
  removeEventListener: () => {},
});
global.HTMLElement = dom.window.HTMLElement;
global.KeyboardEvent = dom.window.KeyboardEvent;
global.PointerEvent = dom.window.PointerEvent;
global.IntersectionObserver = class {
  observe() {}
  disconnect() {}
};
global.requestAnimationFrame = (cb) => setTimeout(cb, 16);
global.cancelAnimationFrame = clearTimeout;

// Stub GSAP and Lenis module resolution if needed
// Actually, let's just compile the file or bundle it with esbuild and require it.
