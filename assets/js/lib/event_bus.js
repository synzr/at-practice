export class EventBus {
  constructor() {
    this._eventTarget = new EventTarget();
  }

  /**
   * Отправка события.
   * @param {string} eventName Имя события.
   * @param {any} detail Детали события.
   */
  emit(eventName, detail) {
    this._eventTarget.dispatchEvent(new CustomEvent(eventName, { detail }));
  }

  /**
   * Подписка на событие.
   * @param {string} eventName Имя события.
   * @param {function} callback Функция обработки события.
   **/
  on(eventName, callback) {
    this._eventTarget.addEventListener(eventName, callback);
  }
}

export default new EventBus();
