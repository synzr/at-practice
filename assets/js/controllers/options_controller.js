import { Controller } from "@hotwired/stimulus";
import ajaxClient from "../lib/ajax_client";
import eventBus from "../lib/event_bus";

export default class extends Controller {
  static targets = ['form'];

  initialize() {
    // NOTE: сохранение изначальных параметров в сессию
    sessionStorage.setItem(
      'options', JSON.stringify(this._getFilterParams())
    );
  }

  /**
   * Обновление задач под параметры фильтрации
   */
  update() {
    const query = this._getFilterParams();

    ajaxClient
      .get(query)
      .then((html) => {
        eventBus.emit('grid:updated', html);

        // NOTE: сохранение параметров в сессию и ссылку
        sessionStorage.setItem('options', JSON.stringify(query));
        this._updateQuery(query);
      });
  }

  /**
   * @returns {Object} Параметры фильтрации
   */
  _getFilterParams() {
    return Object.fromEntries(
      new FormData(this.formTarget).entries(),
    );
  }

  /**
   * Обновление URL с параметрами фильтрации без перезагрузки страницы
   * @param {Object} query Параметры фильтрации
   */
  _updateQuery(query) {
    // NOTE: создание URL с параметрами
    const url = new URL(window.location.href);
    url.search = new URLSearchParams(query).toString();

    // NOTE: обновление URL без перезагрузки страницы
    window.history.pushState({}, '', url);
  }
}
