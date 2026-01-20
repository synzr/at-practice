import { Controller } from "@hotwired/stimulus";
import eventBus from "../lib/event_bus";
import Masonry from "masonry-layout";

export default class extends Controller {
  /**
   * Инициализация контроллера
   */
  initialize() {
    // NOTE: инциализируем Masonry-верстку
    this.grid = new Masonry(this.element, {
      itemSelector: ".task-item",
      percentPosition: true,
      transitionDuration: "0.1s",
    });
  }

  /**
   * Подключение контроллера
   */
  connect() {
    // NOTE: регистрируем события
    eventBus.on("task:created", this.onTaskCreated.bind(this))
    eventBus.on("task:updated", this.onTaskUpdated.bind(this))
    eventBus.on("task:done", this.onTaskUpdated.bind(this))
    eventBus.on("task:removed", this.onTaskUpdated.bind(this))
    eventBus.on("task:deleted", this.onTaskDeleted.bind(this))
    eventBus.on("task:restored", this.onTaskUpdated.bind(this))
    eventBus.on("grid:updated", this.onGridUpdated.bind(this))
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
    const { html, id } = event.detail;

    // NOTE: находим задачу в DOM
    const item = this.element.querySelector(
      `[data-item-id-value="${id}"]`
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
      `[data-item-id-value="${id}"]`
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

  /**
   * Событие обновления списка задач
   * @param {Event} event Событие
   */
  onGridUpdated(event) {
    const html = event.detail;

    // NOTE: обновляем список задач в DOM
    this.element.innerHTML = html;

    // NOTE: обновляем Masonry-верстку
    this.grid.reloadItems();
    this.grid.layout();
  }
  // #endregion
}
