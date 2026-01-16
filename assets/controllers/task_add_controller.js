import { Controller } from "@hotwired/stimulus";
import { Modal } from "bootstrap";

export default class extends Controller {
  static targets = ["grid", "form"];
  static values = {
    createUrl: String,
  };

  /**
   * Инициализация контроллера
   */
  connect() {
    this.modal = new Modal(
      document.getElementById("taskModal")
    );
  }

  /**
   * Отправка формы
   * @param {SubmitEvent} event Событие отправки формы
   */
  submitForm(event) {
    event.preventDefault();
    console.debug("submitForm()");

    const form = this.formTarget;
    const formData = new FormData(form);

    fetch(this.createUrlValue, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data.success) {
          alert("Ошибка создания задачи"); // TODO: реализовать флэш для ошибок
          return;
        }

        // NOTE: говорим гриду задач, что у нас новый элемент
        if (this.hasGridTarget) {
          this.gridTarget.dispatchEvent(
            new CustomEvent("task:add", {
              bubbles: true,
              detail: data.task,
            }),
          );
        }

        // NOTE: скрываем модальное окно и очищаем форму
        this.modal.hide();
      })
      .catch((error) => {
        // TODO: реализовать флэш для ошибок
        console.error("Task create error:", error);
        alert("Во время создания задачи произошла ошибка");
      });
  }
}
