import { Controller } from "@hotwired/stimulus";
import { Modal } from "bootstrap";

export default class extends Controller {
  static modalTexts = {
    create: {
      title: "Создание задачи",
      submitText: "Создать",
    },
    edit: {
      title: "Редактирование задачи",
      submitText: "Сохранить",
    },
  };

  static targets = ["grid", "form", "title", "submit"];
  static values = {
    createUrl: String,
    editUrl: String,
  };

  connect() {
    this.modal = new Modal(document.getElementById("taskModal"));

    // Listen for edit events from task items
    this.element.addEventListener(
      "task-item:edit",
      this.openEditModal.bind(this)
    );
  }

  /**
   * Открытие модального окна для создания
   */
  openCreateModal() {
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

    // NOTE: форматирование даты
    if (deadline) {
      const date = new Date(deadline);
      const formattedDate = date.toISOString().slice(0, 16); // NOTE: YYYY-MM-DDTHH:mm
      form.querySelector('[name="task[deadline]"]').value = formattedDate;
    } else {
      form.querySelector('[name="task[deadline]"]').value = "";
    }

    // NOTE: установка URL и режима для отправки формы
    form.action = this.editUrlValue.replace("0", id);
    this.formMode = "edit";

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

  /**
   * Отправка формы
   * @param {SubmitEvent} event Событие отправки формы
   */
  submitForm(event) {
    event.preventDefault();

    const form = this.formTarget;
    const formData = new FormData(form);
    const isEdit = new URL(form.action).pathname !== this.createUrlValue;

    fetch(form.action, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data.success) {
          alert(
            isEdit ? "Ошибка редактирования задачи" : "Ошибка создания задачи"
          ); // TODO: реализовать флэш для ошибок
          return;
        }

        // NOTE: говорим гриду задач, что у нас новый или измененный элемент
        if (this.hasGridTarget) {
          const eventName = isEdit ? "task-item:edit" : "task-item:add";
          const eventDetail = isEdit
            ? { id: data.task.id, html: data.task.html }
            : data.task;

          this.gridTarget.dispatchEvent(
            new CustomEvent(eventName, {
              bubbles: true,
              detail: eventDetail,
            })
          );
        }

        // NOTE: скрываем модальное окно и очищаем форму
        this.modal.hide();
      })
      .catch((error) => {
        // TODO: реализовать флэш для ошибок
        console.error("Task request error:", error);
        alert(
          isEdit
            ? "Во время редактирования задачи произошла ошибка"
            : "Во время создания задачи произошла ошибка"
        );
      });
  }
}
