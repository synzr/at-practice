<?php

namespace App\Controller;

use App\Dto\SetDeletedDto;
use App\Dto\TaskDto;
use App\Form\TaskType;
use App\Repository\TaskRepository;
use App\Service\TaskService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;

final class TaskController extends AbstractController
{
    /**
     * Репозиторий задач.
     */
    private TaskRepository $taskRepository;

    /**
     * Сервис задач.
     */
    private TaskService $taskService;

    public function __construct(
        TaskRepository $taskRepository,
        TaskService $taskService,
    ) {
        $this->taskRepository = $taskRepository;
        $this->taskService = $taskService;
    }

    // #region CRUD
    /**
     * Главная страница.
     */
    #[Route('/', name: 'task_index', methods: ['GET'])]
    public function index(Request $request): Response
    {
        $form = $this->createForm(TaskType::class);

        // NOTE: получаем параметры сортировки и фильтрации
        $sort = [
            'field' => $request->query->get('sort', 'created_at'),
            'order' => $request->query->get('order', 'desc'),
        ];
        $filter = [
            'status' => $request->query->get('status', 'active'),
            'deadline_from' => $request->query->get('deadline_from'),
            'deadline_to' => $request->query->get('deadline_to'),
        ];

        // NOTE: получаем задачи через репозиторий по критериям
        $tasks = $this->taskRepository->findByCriteria($sort, $filter);

        if (
            $request->isXmlHttpRequest() ||
            'application/json' === $request->headers->get('Accept')
        ) {
            // NOTE: возвращаем JSON, если запрос был AJAX
            return $this->json([
                'success' => true,
                'tasks' => $this->renderView('task/_tasks.html.twig', ['tasks' => $tasks]),
            ]);
        }

        // NOTE: возвращаем полную страницу, если запрос был обычным
        return $this->render('task/index.html.twig', [
            'form' => $form->createView(),
            'tasks' => $tasks,
            'sort' => $sort,
            'filter' => $filter,
        ]);
    }

    /**
     * Обработчик формы создания задачи.
     */
    #[Route('/', name: 'task_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $form = $this->createForm(TaskType::class, new TaskDto());
        $form->handleRequest($request);

        // NOTE: возвращаем ошибку, если форма не заполнена или не валидна
        if (!$form->isSubmitted() || !$form->isValid()) {
            return $this->json(['success' => false], 400 /* Bad Request */);
        }

        // NOTE: создаем новую задачу через сервис
        $task = $this->taskService->create($form->getData());

        return $this->json([
            'success' => true,
            'task' => $this->renderView('task/_task.html.twig', ['task' => $task]),
        ], 201 /* Created */);
    }

    #[Route('/{id}', name: 'task_update', methods: ['POST'])]
    public function update(Request $request, int $id): JsonResponse
    {
        $form = $this->createForm(TaskType::class, new TaskDto());
        $form->handleRequest($request);

        if (!$form->isSubmitted() || !$form->isValid()) {
            return $this->json(['success' => false], 400 /* Bad Request */);
        }

        // NOTE: обновляем задачу через сервис
        $task = $this->taskService->update($id, $form->getData());

        return $this->json([
            'success' => true,
            'task' => [
                'id' => $task->getId(),
                'html' => $this->renderView('task/_task.html.twig', ['task' => $task]),
            ],
        ], 202 /* Accepted */);
    }

    /**
     * Удалить задачу безвозвратно.
     */
    #[Route('/{id}', name: 'task_delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $this->taskService->delete($id); // NOTE: удаляем задачу из базы данных

        return $this->json(['success' => true], 200 /* OK */);
    }
    // #endregion

    /**
     * Выставить задачу как удаленную или наоборот.
     */
    #[Route('/{id}/deleted', name: 'task_deleted', methods: ['POST'])]
    public function deleted(
        #[MapRequestPayload] SetDeletedDto $dto,
        int $id,
    ): JsonResponse {
        // NOTE: выставляем задаче флаг удаления
        $task = $this->taskService->setDeleted($id, $dto->flag);

        return $this->json([
            'success' => true,
            'task' => [
                'id' => $task->getId(),
                'html' => $this->renderView('task/_task.html.twig', ['task' => $task]),
            ],
        ], 200 /* OK */);
    }

    /**
     * Переключить флаг выполнения задачи.
     */
    #[Route('/{id}/done', name: 'task_done', methods: ['POST'])]
    public function done(int $id): JsonResponse
    {
        // NOTE: переключаем флаг выполнения задачи
        $task = $this->taskService->toggleDone($id);

        return $this->json([
            'success' => true,
            'task' => [
                'id' => $task->getId(),
                'done' => $task->isDone(),
                'html' => $this->renderView('task/_task.html.twig', ['task' => $task]),
            ],
        ], 200 /* OK */);
    }
}
