export class EventBus {
  constructor() {
    this._eventTarget = new EventTarget();
  }

  emit(eventName, detail) {
    this._eventTarget.dispatchEvent(new CustomEvent(eventName, { detail }));
  }

  on(eventName, callback) {
    this._eventTarget.addEventListener(eventName, callback);
  }

  off(eventName, callback) {
    this._eventTarget.removeEventListener(eventName, callback);
  }
}

export default new EventBus();
