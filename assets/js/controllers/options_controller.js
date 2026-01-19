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

  filter() {
    const query = this._getFilterParams();
    this.update(query)
  }

  sort(event) {
    // NOTE: получение параметров из формы фильтрации
    const query = this._getFilterParams();

    // NOTE: установка параметров сортировки
    query.sort = event.target.dataset.sortField;
    query.order = event.target.dataset.sortOrder;

    this.update(query);
  }

  update(query) {
    ajaxClient
      .get(query)
      .then((html) => {
        eventBus.emit('grid:updated', html);

        // NOTE: сохранение параметров в сессию и ссылку
        sessionStorage.setItem('options', JSON.stringify(query));
        this._updateQuery(query);
      });
  }

  _getFilterParams() {
    // NOTE: получение параметров из формы фильтрации
    return Object.fromEntries(
      new FormData(this.formTarget).entries(),
    );
  }

  _updateQuery(query) {
    // NOTE: создание URL с параметрами
    const url = new URL(window.location.href);
    url.search = new URLSearchParams(query).toString();

    // NOTE: обновление URL без перезагрузки страницы
    window.history.pushState({}, '', url);
  }
}
