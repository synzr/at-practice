import { Modal } from 'bootstrap';

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
            taskModal.hide();
        })
});
