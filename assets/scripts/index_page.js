import { Modal } from 'bootstrap';
import Masonry from 'masonry-layout';

let masonry;

document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('#task-list');

    if (!grid) {
        return;
    }

    masonry = new Masonry(grid, {
        itemSelector: '.task-item',
        percentPosition: true,
        transitionDuration: '0.2s',
    });
});

const taskList = document.getElementById('task-list');
const taskModal = Modal.getInstance(
    document.getElementById('taskModal')
) || new Modal('#taskModal');

document.addEventListener('submit', (event) => {
    if (event.target.id !== 'task-form') {
        return;
    }

    event.preventDefault();

    fetch(event.target.action, {
        method: event.target.method,
        body: new FormData(event.target),
    })
        .then((response) => response.json())
        .then((data) => {
            if (!data.success) {
                alert('failed'); // TODO: добавить флэш для сообщения с ошибками
                return;
            }

            taskList.insertAdjacentHTML('afterbegin', data.task);

            const newItem = taskList.firstElementChild;
            masonry.prepended(newItem);
            masonry.layout();

            taskModal.hide();
        })
});
