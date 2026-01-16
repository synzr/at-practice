<?php

namespace App\Controller;

use App\Dto\TaskDto;
use App\Dto\DeleteOrRestoreDto;
use App\Entity\Task;
use App\Form\TaskType;
use App\Repository\TaskRepository;
use App\Service\TaskService;
use Doctrine\ORM\EntityNotFoundException;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;

final class TaskController extends AbstractController
{
    /**
     * Репозиторий задач
     */
    private TaskRepository $taskRepository;

    /**
     * Сервис задач
     */
    private TaskService $taskService;

    public function __construct(
        TaskRepository $taskRepository,
        TaskService $taskService
    ) {
        $this->taskRepository = $taskRepository;
        $this->taskService = $taskService;
    }

    // #region CRUD
    /**
     * Главная страница (Read)
     */
    #[Route('/', name: 'task_index', methods: ['GET'])]
    public function index(Request $request): Response
    {
        $form = $this->createForm(TaskType::class);

        // NOTE: получаем параметры сортировки
        $sort = $request->query->get('sort', 'created_at');
        $order = strtoupper($request->query->get('order', 'DESC'));

        // NOTE: получаем задачи по параметрам
        $tasks = $this->taskRepository->findSorted($sort, $order);

        return $this->render('task/index.html.twig', [
            'form' => $form->createView(),
            'tasks' => $tasks,
        ]);
    }

    /**
     * Обработчик формы создания задачи
     */
    #[Route('/', name: 'task_create', methods: ['POST'])]
    public function create(Request $request)
    {
        $form = $this->createForm(TaskType::class, new TaskDto());
        $form->handleRequest($request);

        // NOTE: возвращаем ошибку, если форма не заполнена или не валидна
        if (!$form->isSubmitted() || !$form->isValid()) {
            return $this->json(['success' => false], 400 /* Bad Request */);
        }

        // NOTE: создаем новую задачу через сервис
        $task = $this->taskService->createTask($form->getData());

        return $this->json([
            'success' => true,
            'task' => $this->renderView('task/_task.html.twig', ['task' => $task]),
        ], 201 /* Created */);
    }

    #[Route('/{id}', name: 'task_update', methods: ['POST'])]
    public function update(Request $request, int $id)
    {
        $form = $this->createForm(TaskType::class, new TaskDto());
        $form->handleRequest($request);

        if (!$form->isSubmitted() || !$form->isValid()) {
            return $this->json(['success' => false], 400 /* Bad Request */);
        }

        try {
            // NOTE: обновляем задачу через сервис
            $this->taskService->updateTask($id, $form->getData());

            // NOTE: получаем обновленную задачу из базы данных
            $task = $this->taskRepository->find($id);

            return $this->json([
                'success' => true,
                'task' => [
                    'id' => $task->getId(),
                    'html' => $this->renderView('task/_task.html.twig', ['task' => $task]),
                ],
            ], 202 /* Accepted */);
        } catch (EntityNotFoundException $e) {
            return $this->json([
                'success' => false,
                'message' => 'Task not found'
            ], 404 /* Not Found */);
        } catch (\InvalidArgumentException $e) {
            return $this->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400 /* Bad Request */);
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => 'Failed to update task'
            ], 500 /* Internal Server Error */);
        }
    }

    /**
     * Удалить задачу безвозвратно
     */
    #[Route('/{id}', name: 'task_delete', methods: ['DELETE'])]
    public function delete(int $id)
    {
        try {
            $this->taskService->fullDeleteTask($id);
            return $this->json(['success' => true], 200 /* OK */);
        } catch (EntityNotFoundException $e) {
            return $this->json([
                'success' => false,
                'message' => 'Task not found'
            ], 404 /* Not Found */);
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => 'Failed to delete task'
            ], 500 /* Internal Server Error */);
        }
    }
    // #endregion

    /**
     * Удалить (по флагу) или восстановить задачу
     */
    #[Route('/{id}/delete-or-restore', name: 'task_delete_or_restore', methods: ['POST'])]
    public function deleteOrRestore(#[MapRequestPayload] DeleteOrRestoreDto $dto, int $id)
    {
        try {
            $this->taskService->deleteOrRestoreTask($id, $dto->flag);

            // Получаем обновленную задачу из базы данных
            $task = $this->taskRepository->find($id);

            return $this->json([
                'success' => true,
                'task' => [
                    'id' => $task->getId(),
                    'html' => $this->renderView('task/_task.html.twig', ['task' => $task]),
                ],
            ], 200 /* OK */);
        } catch (EntityNotFoundException $e) {
            return $this->json([
                'success' => false,
                'message' => 'Task not found'
            ], 404 /* Not Found */);
        } catch (\InvalidArgumentException $e) {
            return $this->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400 /* Bad Request */);
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => 'Failed to update task'
            ], 500 /* Internal Server Error */);
        }
    }

    /**
     * Пометить задачу как выполненную или наобратно
     */
    #[Route('/{id}/done', name: 'task_done', methods: ['POST'])]
    public function done(int $id)
    {
        try {
            $task = $this->taskService->flipDone($id);
            return $this->json([
                'success' => true,
                'task' => [
                    'id' => $task->getId(),
                    'html' => $this->renderView('task/_task.html.twig', ['task' => $task]),
                ],
            ], 200 /* OK */);
        } catch (EntityNotFoundException $e) {
            return $this->json([
                'success' => false,
                'message' => 'Task not found'
            ], 404 /* Not Found */);
        } catch (\InvalidArgumentException $e) {
            return $this->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400 /* Bad Request */);
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => 'Failed to update task'
            ], 500 /* Internal Server Error */);
        }
    }
}
