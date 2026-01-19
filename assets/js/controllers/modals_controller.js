import { Controller } from "@hotwired/stimulus";
import { getFilterOptions } from "../lib/utils";
import ajaxClient from "../lib/ajax_client";
import eventBus from "../lib/event_bus";
import { Modal } from "bootstrap";

export default class extends Controller {
  static modalTexts = {
    create: {
      title: "Создать задачу",
      submitText: "Сохранить",
    },
    update: {
      title: "Редактировать задачу",
      submitText: "Сохранить",
    },
  };
  static targets = ["grid", "form", "title", "submit", "confirmSubmit"];

  connect() {
    this.taskModal = new Modal("#taskModal");
    this.confirmModal = new Modal("#confirmModal");

    eventBus.on("modal:update", this.openUpdateModal.bind(this));
    eventBus.on("modal:delete", this.openDeleteModal.bind(this));
  }

  /**
   * Открытие модального окна для создания
   */
  openCreateModal() {
    // NOTE: сброс данных формы
    this.formTarget.reset();

    // NOTE: сбор формы и установка URL и режима
    this.formTarget.action = this.createUrlValue;
    this.taskFormMode = "create";

    // NOTE: открытие модального окна
    this.openTaskModal();
  }

  /**
   * Открытие модального окна для редактирования
   * @param {CustomEvent} event Событие редактирования задачи
   */
  openUpdateModal(event) {
    const { id, name, description, deadline } = event.detail;

    // NOTE: заполнение формы
    const form = this.formTarget;

    form.querySelector('[name="task[name]"]').value = name;
    form.querySelector('[name="task[description]"]').value = description || "";

    this.updateFormId = id;

    // NOTE: форматирование даты
    if (deadline) {
      const date = new Date(deadline);
      const formattedDate = date.toISOString().slice(0, 16); // NOTE: YYYY-MM-DDTHH:mm
      form.querySelector('[name="task[deadline]"]').value = formattedDate;
    } else {
      form.querySelector('[name="task[deadline]"]').value = "";
    }

    // NOTE: установка URL и режима для отправки формы
    this.taskFormMode = "update";

    // NOTE: открытие модального окна
    this.openTaskModal();
  }

  openDeleteModal(event) {
    // NOTE: записание id задачи в дата-атрибут
    const { id } = event.detail;
    this.deleteFormId = id;
    this.confirmModal.show();
  }

  openTaskModal() {
    // NOTE: смена заголовка и текста кнопки
    this.titleTarget.textContent =
      this.constructor.modalTexts[this.taskFormMode].title;
    this.submitTarget.textContent =
      this.constructor.modalTexts[this.taskFormMode].submitText;

    // NOTE: открытие модального окна
    this.taskModal.show();
  }

  /**
   * Отправка формы
   * @param {SubmitEvent} event Событие отправки формы
   */
  submitForm(event) {
    event.preventDefault();

    // NOTE: выполнение действие в зависимости от режима
    switch (this.taskFormMode) {
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
   ajaxClient
     .create(this.formTarget)
      .then((task) => {
        console.log("Задача создана:", task);
        eventBus.emit("task:created", task);
        this.taskModal.hide();
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
    const id = parseInt(this.updateFormId, 10);

    ajaxClient
      .update(id, this.formTarget)
      .then((task) => {
        this.taskModal.hide();

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

  delete() {
    ajaxClient
      .delete(this.deleteFormId)
      .then(() => {
        eventBus.emit("task:deleted", {
          id: this.deleteFormId,
        });

        this.confirmModal.hide();
      })
      .catch((error) => {
        console.error("Ошибка запроса задачи:", error);
        alert("Во время удаления задачи произошла ошибка");
      });
  }

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
