import {
  BadRequestException,
  InternalServerErrorException,
  UnprocessableEntityException,
  NotFoundException
} from "./errors";

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
    // NOTE: сборка и отправка запроса
    const request = {
      headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      method,
    };

    // NOTE: обработка тело запроса перед отправкой
    switch (type) {
      case 'json':
        request.headers['Content-Type'] = 'application/json';
        request.body = JSON.stringify(body);
        break;

      case 'form':
        request.body = new FormData(body);
        break;
    }

    // NOTE: отправка запроса
    const response = await fetch(url, request);

    // NOTE: обработка тела ответа
    let data;
    try {
      data = await response.json();
    } catch (error) {
      throw new Error('Не удалось разобрать JSON', { cause: error });
    }
    if (!data.success) {
      switch (response.status) {
        case 400:
          throw new BadRequestException(data.message ?? 'Неверный запрос');

        case 404:
          throw new NotFoundException(data.message ?? 'Не найдено');

        case 422:
          throw new UnprocessableEntityException(
            data.message ?? 'Неверные данные',
            data.errors ?? []
          );

        case 500:
          throw new InternalServerErrorException(data.message ?? 'Ошибка сервера');

        default:
          throw new Error(data.message ?? 'Неизвестная ошибка сервера');
      }
    }

    // NOTE: возвращаем данные (без success)
    return { ...data, success: undefined };
  }

  // #region Методы
  /**
   * Получить список задач.
   *
   * @param {Object} queryParams Параметры запроса.
   */
  async get(queryParams) {
    // NOTE: преобразуем параметры запроса в строку URL
    let queryString;
    if (queryParams instanceof URLSearchParams) {
      queryString = queryParams.toString();
    } else {
      queryString = new URLSearchParams(queryParams).toString();
    }

    const url = `/?${queryString}`;
    const response = await this._request(url, 'GET', null, null);

    return response.tasks;
  }

  /**
   * Создать задачи в списке.
   *
   * @param {HTMLFormElement} form Форма задачи.
   *
   * @returns {string} HTML-код новосозданной задачи.
   */
  async create(form) {
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
  async update(id, form) {
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
  async delete(id) {
    await this._request(`/${id}`, 'DELETE');
  }

  /**
   * Выставить задачу как удаленную или наоборот.
   *
   * @param {String} id Идентификатор задачи.
   * @param {Boolean} flag Флаг удаления или восстановления.
   *
   * @returns {Object} Объект с идентификатором и HTML-код задачи.
   */
  async setDeleted(id, flag) {
    const response = await this._request(
      `/${id}/deleted`, 'POST', 'json', { flag }
    );
    return response.task;
  }

  /**
   * Переключить флаг выполнения задачи.
   *
   * @param {Number} id Идентификатор задачи.
   *
   * @returns {Object} Объект с идентификатором и HTML-код задачи.
   */
  async toggleDone(id) {
    const response = await this._request(`/${id}/done`, 'POST');
    return response.task;
  }
  // #endregion
}

export default new AjaxClient();
