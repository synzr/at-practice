import { Controller } from "@hotwired/stimulus";
import Masonry from "masonry-layout";

export default class extends Controller {
  connect() {
    // NOTE: регистрируем собственные события
    this.element.addEventListener("task-grid:add", this.onTaskAdded.bind(this));
    this.element.addEventListener("task-grid:change", this.onTaskChanged.bind(this));
    this.element.addEventListener("task-grid:delete", this.onTaskDeleted.bind(this));

    // NOTE: регистрируем события от других контроллеров
    this.element.addEventListener("task-item:done", this.onTaskChanged.bind(this));
    this.element.addEventListener("task-item:delete", this.onTaskDeleted.bind(this));
    this.element.addEventListener("task-item:restore", this.onTaskChanged.bind(this));

    // NOTE: инциализируем Masonry-верстку
    this.grid = new Masonry(this.element, {
      itemSelector: ".task-item",
      percentPosition: true,
      transitionDuration: "0s", // TODO: отключить анимацию по-нормальному
    });
  }

  // #region События
  /**
   * Событие добавления задачи
   * @param {Event} event Событие
   */
  onTaskAdded(event) {
    const html = event.detail;

    // NOTE: добавляем задачу в начало DOM
    this.element.insertAdjacentHTML("afterbegin", html);

    // NOTE: передаем задачу в Masonry-верстку
    const item = this.element.firstElementChild;
    this.grid.prepended(item);
    this.grid.layout();
  }

  /**
   * Событие изменения задачи
   * @param {Event} event Событие
   */
  onTaskChanged(event) {
    const { html, id } = event.detail;

    // NOTE: находим задачу в DOM
    const item = this.element.querySelector(
      `[data-task-item-id-value="${id}"]`
    );
    if (!item) {
      console.error("onTaskChanged(): Changed task not found in DOM");
      return;
    }

    // NOTE: обновляем задачу в DOM
    item.outerHTML = html;
    this.grid.reloadItems();
    this.grid.layout();
  }

  /**
   * Событие удаления задачи
   * @param {Event} event Событие
   */
  onTaskDeleted(event) {
    const { id } = event.detail;

    // NOTE: находим задачу в DOM
    const item = this.element.querySelector(
      `[data-task-item-id-value="${id}"]`
    );
    if (!item) {
      console.error("onTaskDeleted(): Deleted task not found in DOM");
      return;
    }

    // NOTE: удаляем задачу из Masonry-верстки
    this.grid.remove(item);
    this.grid.layout();
  }
  // #endregion
}
