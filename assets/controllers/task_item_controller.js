import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static values = {
    id: Number,
    name: String,
    description: String,
    deadline: String,
  };

  connect() {}

  disconnect() {}

  // #region Действия
  done() {}

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
