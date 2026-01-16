import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static values = {
    id: Number,
    name: String,
    description: String,
    deadline: String,
    doneUrl: String,
  };

  // #region Действия
  done() {
    fetch(this.doneUrlValue, { method: 'POST' })
      .then((response) => response.json())
      .then((data) => {
        if (!data.success) {
          alert('Ошибка выполнения задачи');
        }

        this.dispatch("done", { detail: data.task });
      })
  }

  edit() {
    this.dispatch("edit", {
      detail: {
        id: this.idValue,
        name: this.nameValue,
        description: this.descriptionValue,
        deadline: this.deadlineValue,
      },
    });
  }

  delete() {}

  fullDelete() {}

  restore() {}
  // #endregion
}
