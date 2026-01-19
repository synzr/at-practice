<?php

namespace App\Service;

use App\Dto\TaskDto;
use App\Entity\Task;
use App\Repository\TaskRepository;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\EntityNotFoundException;

class TaskService
{
    /**
     * Менеджер сущностей.
     */
    private EntityManagerInterface $entityManager;

    /**
     * Репозиторий задач.
     */
    private TaskRepository $taskRepository;

    public function __construct(
        EntityManagerInterface $entityManager,
        TaskRepository $taskRepository,
    ) {
        $this->entityManager = $entityManager;
        $this->taskRepository = $taskRepository;
    }

    // #region Create/Update
    /**
     * Создать задачу в базе данных.
     *
     * @param TaskDto $taskDto Данные задачи
     *
     * @return Task Созданная задача
     */
    public function create(TaskDto $taskDto): Task
    {
        return $this->saveTask(null, $taskDto);
    }

    /**
     * Обновить задачу в базе данных.
     *
     * @param int     $taskId  Идентификатор задачи
     * @param TaskDto $taskDto Данные для обновления задач
     *
     * @return Task Обновленная задача
     *
     * @throws EntityNotFoundException   Если задача не найдена
     * @throws \InvalidArgumentException Если задача удалена
     */
    public function update(int $taskId, TaskDto $taskDto): Task
    {
        $task = $this->taskRepository->find($taskId);
        if (!$task) {
            throw new EntityNotFoundException('Задача не найдена с ID: '.$taskId);
        }
        if ($task->isDeleted()) {
            throw new \InvalidArgumentException('Невозможно обновить удаленную задачу');
        }

        $this->saveTask($task, $taskDto);

        return $task;
    }

    /**
     * Сохранить задачу в базе данных.
     *
     * @param Task|null $task    Задача для сохранения
     * @param TaskDto   $taskDto Данные задачи
     *
     * @return Task Сохраненная задача
     */
    private function saveTask(?Task $task, TaskDto $taskDto): Task
    {
        if (null === $task) {
            $task = new Task();
            $this->entityManager->persist($task);
        }

        $task->setName($taskDto->name);
        $task->setDescription($taskDto->description);
        $task->setDeadline($taskDto->deadline);

        $this->entityManager->flush();

        return $task;
    }
    // #endregion

    /**
     * Переключить статус задачи на противоположный.
     *
     * @param int $taskId Идентификатор задачи
     *
     * @return Task Обновленная задача
     *
     * @throws EntityNotFoundException   Если задача не найдена
     * @throws \InvalidArgumentException Если задача удалена
     */
    public function toggleDone(int $taskId): Task
    {
        $task = $this->taskRepository->find($taskId);
        if (!$task) {
            throw new EntityNotFoundException('Задача не найдена с ID: '.$taskId);
        }
        if ($task->isDeleted()) {
            throw new \InvalidArgumentException('Невозможно изменить статус выполнения для удаленной задачи');
        }

        $task->setIsDone(!$task->isDone());
        $this->entityManager->flush();

        return $task;
    }

    /**
     * Безвозвратно удалить задачу (hard delete).
     *
     * @param int $taskId Идентификатор задачи
     *
     * @throws EntityNotFoundException Если задача не найдена
     */
    public function delete(int $taskId): void
    {
        $task = $this->taskRepository->find($taskId);
        if (!$task) {
            throw new EntityNotFoundException('Задача не найдена с ID: '.$taskId);
        }

        $this->entityManager->remove($task);
        $this->entityManager->flush();
    }

    /**
     * Удалить или восстановить задачу в зависимости от флага.
     *
     * @param int  $taskId     Идентификатор задачи
     * @param bool $deleteFlag Флаг удаления (true для удаления, false для восстановления)
     *
     * @return Task Обновленная задача
     *
     * @throws EntityNotFoundException   Если задача не найдена
     * @throws \InvalidArgumentException Если задача уже в нужном состоянии
     */
    public function setDeleted(int $taskId, bool $deleteFlag): Task
    {
        $task = $this->taskRepository->find($taskId);
        if (!$task) {
            throw new EntityNotFoundException('Задача не найдена с ID: '.$taskId);
        }
        if ($task->isDeleted() === $deleteFlag) {
            throw new \InvalidArgumentException($deleteFlag ? 'Задача уже удалена' : 'Задача не удалена');
        }

        $task->setIsDeleted($deleteFlag);
        $this->entityManager->flush();

        return $task;
    }
}
