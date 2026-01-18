import { Controller } from "@hotwired/stimulus";
import { AjaxClient } from "../lib/ajax_client";
import eventBus from "../lib/event_bus";

export default class extends Controller {
  static values = {
    id: Number,
    name: String,
    description: String,
    deadline: String,
    editUrl: String,
  };

  initialize() {
    this.ajaxClient = new AjaxClient();
  }

  // #region Действия
  done() {
    this.ajaxClient
      .flipTaskDone(this.idValue)
      .then((task) => {
        eventBus.emit("task:done", task);
      })
      .catch((error) => {
        alert("Ошибка выполнения задачи: ", error.message);
      });
  }

  edit() {
    eventBus.emit("task:edit", {
      id: this.idValue,
      name: this.nameValue,
      description: this.descriptionValue,
      deadline: this.deadlineValue,
      editUrl: this.editUrlValue,
    });
  }

  delete() {
    this.deleteOrRestore(true);
  }

  fullDelete() {
    this.ajaxClient
      .fullDeleteTask(this.idValue)
      .then(() => {
        eventBus.emit("task:full-delete", { id: this.idValue });
      })
      .catch((error) => {
        alert("Ошибка удаления задачи: ", error.message);
      });
  }

  restore() {
    this.deleteOrRestore(false);
  }
  // #endregion

  deleteOrRestore(flag) {
    this.ajaxClient
      .deleteOrRestoreTask(this.idValue, flag)
      .then((task) => {
        eventBus.emit(flag ? "task:soft-delete" : "task:restore", task);
      })
      .catch((error) => {
        alert("Ошибка удаления задачи: ", error.message);
      });
  }
}
