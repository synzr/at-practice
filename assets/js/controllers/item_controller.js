import { Controller } from "@hotwired/stimulus";
import { getFilterOptions } from "../lib/utils";
import ajaxClient from "../lib/ajax_client";
import eventBus from "../lib/event_bus";

export default class extends Controller {
  static values = {
    id: Number,
    name: String,
    description: String,
    deadline: String,
  };

  // #region Действия
  done() {
    ajaxClient
      .toggleDone(this.idValue)
      .then((task) => {
        const filterOptions = getFilterOptions();

        if (filterOptions.status === 'all' || task.done) {
          eventBus.emit("task:done", task);
          return;
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
    eventBus.emit("modal:delete", { id: this.idValue });
  }

  restore() {
    this._setDeleted(false);
  }
  // #endregion

  _setDeleted(flag) {
    ajaxClient
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
