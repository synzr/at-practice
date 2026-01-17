import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static values = {
    id: Number,
    name: String,
    description: String,
    deadline: String,
    doneUrl: String,
    fullDeleteUrl: String,
    deleteOrRestoreUrl: String,
    editUrl: String,
  };

  // #region Действия
  done() {
    fetch(this.doneUrlValue, { method: "POST" })
      .then((response) => response.json())
      .then((data) => {
        if (!data.success) {
          alert("Ошибка выполнения задачи: " + data.message);
          return;
        }

        this.dispatch("done", { detail: data.task });
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
    fetch(this.fullDeleteUrlValue, { method: "DELETE" })
      .then((response) => response.json())
      .then((data) => {
        if (!data.success) {
          alert("Ошибка удаления задачи: " + data.message);
          return;
        }

        this.dispatch("full-delete", { detail: { id: this.idValue } });
      });
  }

  restore() {
    this.deleteOrRestore(false);
  }
  // #endregion

  deleteOrRestore(flag) {
    fetch(this.deleteOrRestoreUrlValue, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ flag }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data.success) {
          alert("Ошибка удаления задачи: " + data.message);
          return;
        }

        this.dispatch(flag ? "soft-delete" : "restore", {
          detail: data.task ?? { id: this.idValue },
        });
      });
  }
}
