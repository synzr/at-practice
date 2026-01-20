import { Controller } from "@hotwired/stimulus";
import { getFilterOptions } from "../lib/utils";
import ajaxClient from "../lib/ajax_client";
import eventBus from "../lib/event_bus";
import { Modal } from "bootstrap";
import { BadRequestException, InternalServerErrorException, NotFoundException, UnprocessableEntityException } from "../lib/errors";

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
  static targets = [
    "grid",
    "form",
    "title",
    "submit",
    "confirmSubmit",
    "taskModal",
    "confirmModal"
  ];

  /**
   * Подключение контроллера к элементу
   */
  connect() {
    this.taskModal = new Modal(this.taskModalTarget);
    this.confirmModal = new Modal(this.confirmModalTarget);

    eventBus.on("modal:update", this.openUpdateModal.bind(this));
    eventBus.on("modal:delete", this.openDeleteModal.bind(this));
  }

  // #region Открытие модального окна
  /**
   * Открытие модального окна для создания
   */
  openCreateModal() {
    // NOTE: проверка, если модальное окно не было открыто до этого
    if (this.taskModalTarget.classList.contains("show")) {
      return;
    }

    // NOTE: сбор формы и установка URL и режима
    this.formTarget.action = this.createUrlValue;
    this.taskFormMode = "create";

    if (this.previouslyOpenedForm != 'create' || this.resetCreateForm) {
      // NOTE: если предыдущий открытый форма был другой, то сброс формы
      this.formTarget.reset();
    }
    this.previouslyOpenedForm = 'create';
    this.resetCreateForm = false;

    // NOTE: открытие модального окна
    this._openTaskModal();
  }

  /**
   * Открытие модального окна для редактирования
   * @param {CustomEvent} event Событие редактирования задачи
   */
  openUpdateModal(event) {
    const { id, name, description, deadline } = event.detail;

    // NOTE: проверка, если модальное окно не было открыто до этого
    if (this.taskModalTarget.classList.contains("show")) {
      return;
    }

    // NOTE: заполнение формы
    if (this.previouslyOpenedForm != 'update' || this.updateFormId !== id) {
      this.formTarget.reset();
    }
    const taskNameInput = this.formTarget.querySelector('[name="task[name]"]');
    if (taskNameInput.value == "") {
      taskNameInput.value = name;
    }
    const taskDescriptionInput =
      this.formTarget.querySelector('[name="task[description]"]');
    if (taskDescriptionInput.value == "") {
      taskDescriptionInput.value = description || "";
    }
    const taskDeadlineInput =
      this.formTarget.querySelector('[name="task[deadline]"]');
    if (taskDeadlineInput.value == "") {
      taskDeadlineInput.value = deadline || "";
    }

    this.updateFormId = id;
    this.taskFormMode = "update";
    this.previouslyOpenedForm = 'update';

    // NOTE: открытие модального окна
    this._openTaskModal();
  }

  /**
   * Открытие модального окна для удаления
   * @param {CustomEvent} event Событие удаления задачи
   */
  openDeleteModal(event) {
    // NOTE: проверка, если модальное окно не было открыто до этого
    if (this.confirmModalTarget.classList.contains("show")) {
      return;
    }

    // NOTE: записание id задачи
    const { id } = event.detail;
    this.deleteFormId = id;

    // NOTE: открытие модального окна
    this.confirmModal.show();
  }

  /**
   * Открытие модального окна для создания/редактирования задачи
   */
  _openTaskModal() {
    // NOTE: смена заголовка и текста кнопки
    this.titleTarget.textContent =
      this.constructor.modalTexts[this.taskFormMode].title;
    this.submitTarget.textContent =
      this.constructor.modalTexts[this.taskFormMode].submitText;

    // NOTE: открытие модального окна
    this.taskModal.show();
  }
  // #endregion

  // #region Отправка формы создания/редактирования
  /**
   * Отправка формы
   * @param {SubmitEvent} event Событие отправки формы
   */
  submitForm(event) {
    event.preventDefault();
    this.submitTarget.disabled = true;

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
        eventBus.emit("task:created", task);

        this.taskModal.hide();
        this.resetCreateForm = true;

        eventBus.emit("toast:message", 'Задача успешна создана');
      })
      .catch((error) => {
        console.error("Ошибка запроса задачи:", error);

        if (error instanceof BadRequestException) {
          eventBus.emit("toast:message", "Не удалось создать задачу, проверьте вводные данные");
          return;
        }

        if (error instanceof UnprocessableEntityException) {
          for (const error of error.errors) {
            eventBus.emit("toast:message", error);
          }
          return;
        }

        if (error instanceof InternalServerErrorException) {
          eventBus.emit("toast:message", "Внутренняя ошибка сервера, попробуйте позже");
          return;
        }
      })
      .then(() => {
        this.submitTarget.disabled = false;
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

        // NOTE: отправка события в зависимости от фильтров
        const filterOptions = getFilterOptions();
        if (
          this._shouldBeVisibleByDeadlineFilter(
            task.deadline,
            filterOptions.deadline_from,
            filterOptions.deadline_to
          )
        ) {
          eventBus.emit("task:updated", task);
          return;
        }
        eventBus.emit("task:deleted", task);

        eventBus.emit("toast:message", 'Задача успешна редактирована');
      })
      .catch((error) => {
        console.error("Ошибка запроса задачи:", error);

        if (error instanceof NotFoundException) {
          eventBus.emit("toast:message", "Задача не найдена на сервере, попробуйте перезагрузить страницу");
          return;
        }

        if (error instanceof BadRequestException) {
          eventBus.emit("toast:message", "Не удалось редактировать задачу, проверьте вводные данные");
          return;
        }

        if (error instanceof UnprocessableEntityException) {
          for (const error of error.errors) {
            eventBus.emit("toast:message", error);
          }
          return;
        }

        if (error instanceof InternalServerErrorException) {
          eventBus.emit("toast:message", "Внутренняя ошибка сервера, попробуйте позже");
          return;
        }
      })
      .then(() => {
        this.submitTarget.disabled = false;
      });
  }

  /**
   * Проверка фильтрации по дедлайну.
   * @param {string} current Текущий дедлайн.
   * @param {string} from Начальный дедлайн.
   * @param {string} to Конечный дедлайн.
   * @returns {boolean} Возможность фильтрации.
   */
  _shouldBeVisibleByDeadlineFilter(current, from, to) {
    const hasFilter = from || to;

    // NOTE: если задача не имеет дедлайна, то возвращаем возможность фильтрации
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
  // #endregion

  /**
   * Обработка удаления задачи.
   */
  delete() {
    this.confirmSubmitTarget.disabled = true;

    ajaxClient
      .delete(this.deleteFormId)
      .then(() => {
        // NOTE: отправка события удаления задачи
        eventBus.emit("task:deleted", {
          id: this.deleteFormId,
        });

        // NOTE: закрытие модального окна
        this.confirmModal.hide();

        eventBus.emit("toast:message", 'Задача успешна бесвозрастно удалена');
      })
      .catch((error) => {
        console.error("Ошибка запроса задачи:", error);
        eventBus.emit("toast:message", "Во время удаления задачи произошла ошибка");
      })
      .then(() => {
        this.confirmSubmitTarget.disabled = false;
      });
  }
}
