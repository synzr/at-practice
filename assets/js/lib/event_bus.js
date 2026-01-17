export const eventBus = new EventTarget();

export function emit(name, detail = {}) {
  eventBus.dispatchEvent(new CustomEvent(name, { detail }));
}

export function on(name, handler) {
  eventBus.addEventListener(name, (e) => handler(e.detail));
}

export function off(name, handler) {
  eventBus.removeEventListener(name, handler);
}
