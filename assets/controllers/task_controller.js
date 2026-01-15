import { Controller } from '@hotwired/stimulus';
import { Modal } from 'bootstrap';
import Masonry from 'masonry-layout';

export default class extends Controller {
    static targets = ['list', 'form'];
    static values = {
        createUrl: String
    };

    /**
     * Инициализация контроллера
     */
    connect() {
        if (this.hasListTarget) {
            this.masonry = new Masonry(this.listTarget, {
                itemSelector: '.task-item',
                percentPosition: true,
                transitionDuration: '0.2s',
            });
        }

        this.modal = new Modal(document.getElementById('taskModal'));
    }

    /**
     * Отправка формы
     * @param {SubmitEvent} event Событие отправки формы
     */
    submitForm(event) {
        event.preventDefault();

        const form = this.formTarget;
        const formData = new FormData(form);

        fetch(this.createUrlValue, {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                alert('Ошибка создания задачи'); // TODO: реализовать флэш для ошибок
                return;
            }

            // NOTE: вставляем новую задачу в список
            this.listTarget.insertAdjacentHTML('afterbegin', data.task);

            // NOTE: говорим masonry, что у нас новый элемент
            const newItem = this.listTarget.firstElementChild;
            if (this.masonry) {
                this.masonry.prepended(newItem);
                this.masonry.layout();
            }

            // NOTE: скрываем модальное окно и очищаем форму
            this.modal.hide();
            form.reset();
        })
        .catch(error => {
            // TODO: реализовать флэш для ошибок
            console.error('Error:', error);
            alert('Во время создания задачи произошла ошибка');
        });
    }
}
