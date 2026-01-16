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
     * Менеджер сущностей
     */
    private EntityManagerInterface $entityManager;

    /**
     * Репозиторий задач
     */
    private TaskRepository $taskRepository;

    public function __construct(
        EntityManagerInterface $entityManager,
        TaskRepository $taskRepository
    )
    {
        $this->entityManager = $entityManager;
        $this->taskRepository = $taskRepository;
    }

    /**
     * Создать задачу в базе данных.
     * @param TaskDto $taskDto Данные задачи
     * @return Task Созданная задача
     */
    public function createTask(TaskDto $taskDto): Task
    {
        $task = new Task();
        $task->setName($taskDto->name);
        $task->setDescription($taskDto->description);
        $task->setDeadline($taskDto->deadline);

        $this->entityManager->persist($task);
        $this->entityManager->flush();

        return $task;
    }

    /**
     * Обновить задачу в базе данных.
     * @param int $taskId Идентификатор задачи
     * @param TaskDto $taskDto Данные для обновления задачи
     * @throws EntityNotFoundException Если задача не найдена
     */
    public function updateTask(int $taskId, TaskDto $taskDto): void
    {
        $task = $this->taskRepository->find($taskId);

        if (!$task) {
            throw new EntityNotFoundException('Task not found with ID: ' . $taskId);
        }

        $task->setName($taskDto->name);
        $task->setDescription($taskDto->description);
        $task->setDeadline($taskDto->deadline);

        $this->entityManager->flush();
    }

    /**
     * Переключить статус задачи на противоположный
     * @param int $taskId Идентификатор задачи
     * @return Task Обновленная задача
     * @throws EntityNotFoundException Если задача не найдена
     */
    public function flipDone(int $taskId): Task
    {
        $task = $this->taskRepository->find($taskId);

        if (!$task) {
            throw new EntityNotFoundException('Task not found with ID: ' . $taskId);
        }

        $task->setIsDone(!$task->isDone());
        $this->entityManager->flush();

        return $task;
    }

    /**
     * Безвозвратно удалить задачу (hard delete)
     * @param int $taskId Идентификатор задачи
     * @throws EntityNotFoundException Если задача не найдена
     */
    public function fullDeleteTask(int $taskId): void
    {
        $task = $this->taskRepository->find($taskId);

        if (!$task) {
            throw new EntityNotFoundException('Task not found with ID: ' . $taskId);
        }

        $this->entityManager->remove($task);
        $this->entityManager->flush();
    }

    /**
     * Удалить или восстановить задачу в зависимости от флага
     * @param int $taskId Идентификатор задачи
     * @param bool $deleteFlag Флаг удаления (true для удаления, false для восстановления)
     * @throws EntityNotFoundException Если задача не найдена
     */
    public function deleteOrRestoreTask(int $taskId, bool $deleteFlag): void
    {
        $task = $this->taskRepository->find($taskId);

        if (!$task) {
            throw new EntityNotFoundException('Task not found with ID: ' . $taskId);
        }

        $task->setIsDeleted($deleteFlag);
        $this->entityManager->flush();
    }
}
