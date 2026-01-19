import { Controller } from "@hotwired/stimulus";
import { AjaxClient } from "../lib/ajax_client";
import eventBus from "../lib/event_bus";

export default class extends Controller {
  static values = {
    id: Number,
    name: String,
    description: String,
    deadline: String,
  };

  initialize() {
    this.ajaxClient = new AjaxClient();
  }

  // #region Действия
  done() {
    this.ajaxClient
      .toggleDone(this.idValue)
      .then((task) => {
        eventBus.emit("task:done", task);
      })
      .catch((error) => {
        alert("Ошибка выполнения задачи: ", error.message);
      });
  }

  update() {
    eventBus.emit("modal:update", {
      id: this.idValue,
      name: this.nameValue,
      description: this.descriptionValue,
      deadline: this.deadlineValue,
    });
  }

  remove() {
    this.setDeleted(true);
  }

  delete() {
    this.ajaxClient
      .delete(this.idValue)
      .then(() => {
        eventBus.emit("task:deleted", { id: this.idValue });
      })
      .catch((error) => {
        alert("Ошибка удаления задачи: ", error.message);
      });
  }

  restore() {
    this.setDeleted(false);
  }
  // #endregion

  setDeleted(flag) {
    this.ajaxClient
      .setDeleted(this.idValue, flag)
      .then((task) => {
        eventBus.emit(flag ? "task:removed" : "task:restored", task);
      })
      .catch((error) => {
        alert("Ошибка удаления задачи: ", error.message);
      });
  }
}
