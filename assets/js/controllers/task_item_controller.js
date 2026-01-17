import { Controller } from "@hotwired/stimulus";
import { AjaxClient } from "../lib/ajax_client";

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
      .catch((error) => {
        alert("Ошибка выполнения задачи: ", error.message);
      })
      .then((task) => {
        this.dispatch("done", { detail: task });
      });
  }

  edit() {
    this.dispatch("edit", {
      detail: {
        id: this.idValue,
        name: this.nameValue,
        description: this.descriptionValue,
        deadline: this.deadlineValue,
        editUrl: this.editUrlValue,
      },
    });
  }

  delete() {
    this.deleteOrRestore(true);
  }

  fullDelete() {
    this.ajaxClient
      .fullDeleteTask(this.idValue)
      .catch((error) => {
        alert("Ошибка удаления задачи: ", error.message);
      })
      .then(() => {
        this.dispatch("full-delete", {
          detail: { id: this.idValue },
        });
      });
  }

  restore() {
    this.deleteOrRestore(false);
  }
  // #endregion

  deleteOrRestore(flag) {
    this.ajaxClient
      .deleteOrRestoreTask(this.idValue, flag)
      .catch((error) => {
        alert("Ошибка удаления задачи: ", error.message);
      })
      .then((task) => {
        this.dispatch(flag ? "soft-delete" : "restore", { detail: task });
      });
  }
}
