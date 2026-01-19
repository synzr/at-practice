import { Controller } from "@hotwired/stimulus";
import { AjaxClient } from "../lib/ajax_client";
import { getFilterOptions } from "../lib/utils";
import { Modal } from "bootstrap";
import eventBus from "../lib/event_bus";

export default class extends Controller {
  static modalTexts = {
    create: {
      title: "Создание задачи",
      submitText: "Создать",
    },
    update: {
      title: "Редактирование задачи",
      submitText: "Сохранить",
    },
  };
  static targets = ["grid", "form", "title", "submit"];

  initialize() {
    this.ajaxClient = new AjaxClient();
  }

  connect() {
    this.modal = new Modal("#taskModal");
    eventBus.on("modal:update", this.openEditModal.bind(this));
  }

  /**
   * Открытие модального окна для создания
   */
  openCreateModal() {
    // NOTE: сброс данных формы
    delete this.formTarget.dataset.id;
    this.formTarget.reset();

    // NOTE: сбор формы и установка URL и режима
    this.formTarget.action = this.createUrlValue;
    this.formMode = "create";

    // NOTE: открытие модального окна
    this.openModal();
  }

  /**
   * Открытие модального окна для редактирования
   * @param {CustomEvent} event Событие редактирования задачи
   */
  openEditModal(event) {
    const { id, name, description, deadline } = event.detail;

    // NOTE: заполнение формы
    const form = this.formTarget;

    form.querySelector('[name="task[name]"]').value = name;
    form.querySelector('[name="task[description]"]').value = description || "";

    form.dataset.id = id;

    // NOTE: форматирование даты
    if (deadline) {
      const date = new Date(deadline);
      const formattedDate = date.toISOString().slice(0, 16); // NOTE: YYYY-MM-DDTHH:mm
      form.querySelector('[name="task[deadline]"]').value = formattedDate;
    } else {
      form.querySelector('[name="task[deadline]"]').value = "";
    }

    // NOTE: установка URL и режима для отправки формы
    this.formMode = "update";

    // NOTE: открытие модального окна
    this.openModal();
  }

  openModal() {
    // NOTE: смена заголовка и текста кнопки
    this.titleTarget.textContent =
      this.constructor.modalTexts[this.formMode].title;
    this.submitTarget.textContent =
      this.constructor.modalTexts[this.formMode].submitText;

    // NOTE: открытие модального окна
    this.modal.show();
  }

  // #region Обработка формы
  /**
   * Отправка формы
   * @param {SubmitEvent} event Событие отправки формы
   */
  submitForm(event) {
    event.preventDefault();

    switch (this.formMode) {
      case "create":
        this.create();
        break;

      case "update":
        this.update();
        break;
    }
  }

  /**
   * Обработка создания задачи.
   */
  create() {
   this.ajaxClient
     .create(this.formTarget)
      .then((task) => {
        console.log("Задача создана:", task);
        eventBus.emit("task:created", task);
        this.modal.hide();
      })
      .catch((error) => {
        console.error("Ошибка запроса задачи:", error);
        alert("Во время создания задачи произошла ошибка");
      });
  }

  /**
   * Обработка редактирования задачи.
   */
  update() {
    // NOTE: получение ID задачи
    const id = parseInt(this.formTarget.dataset.id, 10);

    this.ajaxClient
      .update(id, this.formTarget)
      .then((task) => {
        this.modal.hide();

        const filterOptions = getFilterOptions();
        if (
          this._shouldBeVisibleByDeadlineFilter(
            task.deadline,
            filterOptions.deadline_from,
            filterOptions.deadline_to
          )
        ) {
          return eventBus.emit("task:updated", task);
        }

        eventBus.emit("task:deleted", task);
      })
      .catch((error) => {
        console.error("Ошибка запроса задачи:", error);
        alert("Во время редактирования задачи произошла ошибка");
      });
  }
  // #endregion
_shouldBeVisibleByDeadlineFilter(current, from, to) {
  const hasFilter = from || to;

  // If filter exists and task has no deadline → exclude
  if (!current) {
    return !hasFilter;
  }

  const currentDate = new Date(current);
  const fromDate = from ? new Date(from) : null;
  const toDate = to ? new Date(to) : null;

  if (fromDate && currentDate < fromDate) {
    return false;
  }

  if (toDate && currentDate > toDate) {
    return false;
  }

  return true;
}
}
