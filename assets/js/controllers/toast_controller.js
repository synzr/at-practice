import { Controller } from "@hotwired/stimulus";
import eventBus from "../lib/event_bus";
import { Toast } from "bootstrap";

export default class extends Controller {
  static targets = ["template"];

  connect() {
    eventBus.on("toast:message", this.createToast.bind(this));
  }

  createToast(event) {
    const message = event.detail;

    // NOTE: клонирование шаблона
    const fragment = this.templateTarget.content.cloneNode(true);

    // NOTE: вставка сообщения в тост
    const toastElement = fragment.querySelector(".toast");
    toastElement.querySelector(".toast-body").textContent = message;

    this.element.appendChild(toastElement);

    // NOTE: показ тоста
    const toast = new Toast(toastElement);
    toastElement.addEventListener("hidden.bs.toast", () => {
      toastElement.remove();
    });
    toast.show();
  }
}
