import { Controller } from "@hotwired/stimulus";
import { AjaxClient } from "../lib/ajax_client";
import { getFilterOptions } from "../lib/utils";
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
        const statusFilter = getFilterOptions().status;

        if (statusFilter === 'all' || task.done) {
          eventBus.emit("task:done", task);
        }

        eventBus.emit("task:deleted", task);
      })
      .catch((error) => {
        console.error(error);
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
    this._setDeleted(true);
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
    this._setDeleted(false);
  }
  // #endregion

  _setDeleted(flag) {
    this.ajaxClient
      .setDeleted(this.idValue, flag)
      .then((task) => {
        const statusFilter = getFilterOptions().status;

        const cannotBeDeletedShown =
          statusFilter !== "all" && statusFilter !== "deleted";
        if (flag && cannotBeDeletedShown) {
          eventBus.emit("task:deleted", task);
        }
        if (!flag) {
          eventBus.emit("task:restored", task);
        }

        eventBus.emit("task:removed", task);
      })
      .catch((error) => {
        alert("Ошибка удаления задачи: ", error.message);
      });
  }
}
