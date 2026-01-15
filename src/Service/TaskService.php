<?php

namespace App\Service;

use App\Entity\Task;
use Doctrine\ORM\EntityManagerInterface;

class TaskService
{
    /**
     * Манеджер сущностей
     */
    private EntityManagerInterface $entityManager;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    /**
     * Создать задачу в базе данных.
     * @param Task $task Задача
     */
    public function createTask(Task $task): void
    {
        $this->entityManager->persist($task);
        $this->entityManager->flush();
    }
}
