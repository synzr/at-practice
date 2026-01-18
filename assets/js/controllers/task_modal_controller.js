import { Controller } from "@hotwired/stimulus";
import { Modal } from "bootstrap";
import { AjaxClient } from "../lib/ajax_client";
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
  static values = {
    createUrl: String,
  };

  initialize() {
    this.ajaxClient = new AjaxClient();
  }

  connect() {
    this.modal = new Modal("#taskModal");
    eventBus.on("task:edit", this.openEditModal.bind(this));
  }

  /**
   * Открытие модального окна для создания
   */
  openCreateModal() {
    // NOTE: сброс данных формы
    delete this.formTarget.dataset.id;

    // NOTE: сбор формы и установка URL и режима
    this.formTarget.action = this.createUrlValue;
    this.formTarget.reset();
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
    form.action = event.detail.editUrl;
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
        this.createTask();
        break;

      case "update":
        this.updateTask();
        break;
    }
  }

  /**
   * Обработка создания задачи.
   */
  createTask() {
    this.ajaxClient
      .createTask(this.id, this.formTarget)
      .then((task) => {
        console.log("Task created:", task);
        eventBus.emit("task:created", task);
        this.modal.hide();
      })
      .catch((error) => {
        console.error("Task request error:", error);
        alert("Во время создания задачи произошла ошибка");
      });
  }

  /**
   * Обработка редактирования задачи.
   */
  updateTask() {
    // NOTE: получение ID задачи
    const id = parseInt(this.formTarget.dataset.id, 10);

    this.ajaxClient.updateTask(id, this.formTarget)
      .then((task) => {
        eventBus.emit("task:updated", task);
        this.modal.hide();
      })
      .catch((error) => {
        console.error("Task request error:", error);
        alert("Во время редактирования задачи произошла ошибка");
      });
  }
  // #endregion
}
