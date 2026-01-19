import { Controller } from "@hotwired/stimulus";
import Masonry from "masonry-layout";
import eventBus from "../lib/event_bus";

export default class extends Controller {
  connect() {
    // NOTE: регистрируем события
    eventBus.on("task:created", this.onTaskCreated.bind(this))
    eventBus.on("task:updated", this.onTaskUpdated.bind(this))
    eventBus.on("task:done", this.onTaskUpdated.bind(this))
    eventBus.on("task:removed", this.onTaskUpdated.bind(this))
    eventBus.on("task:deleted", this.onTaskDeleted.bind(this))
    eventBus.on("task:restored", this.onTaskUpdated.bind(this))

    // NOTE: инциализируем Masonry-верстку
    this.grid = new Masonry(this.element, {
      itemSelector: ".task-item",
      percentPosition: true,
      transitionDuration: "0.1s",
    });
  }

  // #region События
  /**
   * Событие добавления задачи
   * @param {Event} event Событие
   */
  onTaskCreated(event) {
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
  onTaskUpdated(event) {
    console.debug('event.detail:', event.detail);
    const { html, id } = event.detail;

    // NOTE: находим задачу в DOM
    const item = this.element.querySelector(
      `[data-task-item-id-value="${id}"]`
    );
    if (!item) {
      console.error("onTaskUpdated(): Измененная задача не найдена в DOM");
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
      console.error("onTaskDeleted(): Удаленная задача не найдена в DOM");
      return;
    }

    // NOTE: удаляем задачу из Masonry-верстки
    item.remove();
    this.grid.remove(item);
    this.grid.layout();
  }
  // #endregion
}
