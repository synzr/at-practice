import { Controller } from "@hotwired/stimulus";
import Masonry from "masonry-layout";

export default class extends Controller {
  connect() {
    // NOTE: регистрируем события
    this._onAdd = this.onTaskAdded.bind(this);
    this.element.addEventListener("task:add", this._onAdd);

    this._onEdit = this.onTaskEdited.bind(this);
    this.element.addEventListener("task:edit", this._onEdit);

    this._onDelete = this.onTaskDeleted.bind(this);
    this.element.addEventListener("task:delete", this._onDelete);

    // NOTE: инциализируем Masonry-верстку
    this.grid = new Masonry(this.element, {
      itemSelector: ".task-item",
      percentPosition: true,
      transitionDuration: "0.2s",
    });
  }

  disconnect() {
    // NOTE: удаляем события
    this.element.removeEventListener("task:add", this._onAdd);
    this.element.removeEventListener("task:edit", this._onEdit);
    this.element.removeEventListener("task:delete", this._onDelete);

    // NOTE: удаляем Masonry-верстку
    this.grid.destroy();
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
  onTaskEdited(event) {
    const { html, id } = event.detail;

    // NOTE: находим задачу в DOM
    const item = this.element.querySelector(`[data-id="${id}"]`);
    if (!item) {
      console.error("onTaskEdited(): Changed task not found in DOM");
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
    const item = this.element.querySelector(`[data-id="${id}"]`);
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
