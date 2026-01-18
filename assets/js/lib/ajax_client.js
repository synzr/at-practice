export class AjaxClient {
  /**
   * AJAX-запрос к серверу.
   *
   * @param {String} url URL-адрес запроса.
   * @param {String} method Метод запроса.
   * @param {String} type Тип запроса.
   * @param {any} body Тело запроса.
   *
   * @returns {Promise<any>} Результат запроса.
   */
  async _request(url, method, type, body) {
    // NOTE: Сборка и отправка запроса
    const request = {
      headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      method,
    };

    switch (type) {
      case 'json':
        request.headers['Content-Type'] = 'application/json';
        request.body = JSON.stringify(body);
        break;

      case 'form':
        request.body = new FormData(body);
        break;
    }

    const response = await fetch(url, request);

    // NOTE: Обработка ответа
    let data;
    try {
      data = await response.json();
    } catch (error) {
      throw new Error('Failed to parse JSON', { cause: error });
    }

    if (!data.success) {
      throw new Error('Failed to request');
    }

    // NOTE: Возвращаем данные (без success)
    return { ...data, success: undefined };
  }

  // #region Методы
  /**
   * Создать задачи в списке.
   *
   * @param {HTMLFormElement} form Форма задачи.
   *
   * @returns {string} HTML-код новосозданной задачи.
   */
  async createTask(form) {
    const response = await this._request(
      '/', 'POST', 'form', form
    );
    return response.task;
  }

  /**
   * Обновить задачу в списке.
   *
   * @param {Number} id Идентификатор задачи.
   * @param {HTMLFormElement} form Форма задачи.
   *
   * @returns {Object} Объект с идентификатором и HTML-код задачи.
   */
  async updateTask(id, form) {
    const response = await this._request(
      `/${id}`, 'POST', 'form', form
    );
    return response.task;
  }

  /**
   * Удалить безвозвратно задачу из списка.
   *
   * @param {Number} id Идентификатор задачи.
   */
  async fullDeleteTask(id) {
    await this._request(`/${id}`, 'DELETE');
  }

  /**
   * Удалить или восстановить задачу из списка.
   *
   * @param {String} id Идентификатор задачи.
   * @param {Boolean} flag Флаг удаления или восстановления.
   *
   * @returns {Object} Объект с идентификатором и HTML-код задачи.
   */
  async deleteOrRestoreTask(id, flag) {
    const response = await this._request(
      `/${id}/delete-or-restore`, 'POST', 'json', { flag }
    );
    return response.task;
  }

  /**
   * Пометить задачу как выполненную или наоборот.
   *
   * @param {Number} id Идентификатор задачи.
   *
   * @returns {Object} Объект с идентификатором и HTML-код задачи.
   */
  async flipTaskDone(id) {
    const response = await this._request(`/${id}/done`, 'POST');
    return response.task;
  }
  // #endregion
}
