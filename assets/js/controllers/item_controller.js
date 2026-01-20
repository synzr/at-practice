import { Controller } from "@hotwired/stimulus";
import { getFilterOptions } from "../lib/utils";
import ajaxClient from "../lib/ajax_client";
import eventBus from "../lib/event_bus";
import { InternalServerErrorException, NotFoundException } from "../lib/errors";

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

        if (
          (filterOptions.status === 'completed' && !task.done) ||
          (filterOptions.status === 'active' && task.done)
        ) {
          eventBus.emit("task:deleted", task);
        }

        eventBus.emit("task:done", task);
      })
      .catch((error) => {
        console.error('Ошибка переключения пометки:', error.message);

        if (error instanceof NotFoundException) {
          eventBus.emit("toast:message", "Задача не найдена на сервере, попробуйте перезагрузить страницу");
          return;
        }

        if (error instanceof InternalServerErrorException) {
          eventBus.emit("toast:message", "Внутренняя ошибка сервера, попробуйте позже");
          return;
        }
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
          eventBus.emit("toast:message", 'Задача успешно удалена');

          return;
        }
        if (!flag) {
          if (statusFilter !== "deleted") {
            eventBus.emit("task:restored", task);
          } else {
            eventBus.emit("task:deleted", task);
          }
          eventBus.emit("toast:message", 'Задача успешно восстановлена');

          return;
        }

        eventBus.emit("task:removed", task);
        eventBus.emit("toast:message", 'Задача успешно удалена');
      })
      .catch((error) => {
        console.error('Ошибка удаления задачи:', error.message);

        if (error instanceof NotFoundException) {
          eventBus.emit("toast:message", "Задача не найдена на сервере, попробуйте перезагрузить страницу");
          return;
        }

        if (error instanceof InternalServerErrorException) {
          eventBus.emit("toast:message", "Внутренняя ошибка сервера, попробуйте позже");
          return;
        }
      });
  }
}
