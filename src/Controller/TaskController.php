<?php

namespace App\Controller;

use App\Dto\SetDeletedDto;
use App\Dto\TaskDto;
use App\Entity\Task;
use App\Form\TaskType;
use App\Repository\TaskRepository;
use App\Service\TaskService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Form\FormInterface;
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
            $request->isXmlHttpRequest()
            || 'application/json' === $request->headers->get('Accept')
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

        if (!$form->isSubmitted() || !$form->isValid()) {
            return $this->sendUnprocessableEntityResponse($form);
        }

        // NOTE: создаем новую задачу через сервис
        $task = $this->taskService->create($form->getData());

        return $this->sendPartialTaskResponse($task, 201 /* Created */, false);
    }

    /**
     * Обновление задачи.
     */
    #[Route('/{id}', name: 'task_update', methods: ['POST'])]
    public function update(Request $request, int $id): JsonResponse
    {
        $form = $this->createForm(TaskType::class, new TaskDto());
        $form->handleRequest($request);

        if (!$form->isSubmitted() || !$form->isValid()) {
            return $this->sendUnprocessableEntityResponse($form);
        }

        // NOTE: обновляем задачу через сервис
        $task = $this->taskService->update($id, $form->getData());

        return $this->sendPartialTaskResponse($task, 202 /* Accepted */, true);
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

        return $this->sendPartialTaskResponse($task, 202 /* Accepted */);
    }

    /**
     * Переключить флаг выполнения задачи.
     */
    #[Route('/{id}/done', name: 'task_done', methods: ['POST'])]
    public function done(int $id): JsonResponse
    {
        // NOTE: переключаем флаг выполнения задачи
        $task = $this->taskService->toggleDone($id);

        return $this->sendPartialTaskResponse($task, 202 /* Accepted */, true, true);
    }

    // #region Вспомогательные методы
    /**
     * Отправка ответа с ошибками формы.
     *
     * @param FormInterface<TaskDto> $form Форма
     *
     * @return JsonResponse Ответ
     */
    private function sendUnprocessableEntityResponse(FormInterface $form): JsonResponse
    {
        $errors = [];

        foreach ($form->getErrors(true) as $error) {
            $errors[] = $error->getMessage();
        }

        return $this->json([
            'success' => false,
            'errors' => $errors,
        ], 422 /* Unprocessable Entity */);
    }

    /**
     * Отправка частичного ответа c задачой.
     *
     * @param Task $task        Задача
     * @param int  $statusCode  Код статуса ответа
     * @param bool $includeId   Включать ли ID задачи в ответ?
     * @param bool $includeDone Включать ли флаг выполнения задачи в ответ?
     *
     * @return JsonResponse Ответ
     */
    private function sendPartialTaskResponse(
        Task $task,
        int $statusCode,
        bool $includeId = true,
        bool $includeDone = false,
    ): JsonResponse {
        $data = $this->renderView('task/_task.html.twig', ['task' => $task]);
        if ($includeId) {
            $data = ['id' => $task->getId(), 'html' => $data];
        }
        if ($includeDone) {
            $data['done'] = $task->isDone();
        }

        return $this->json(['success' => true, 'task' => $data], $statusCode);
    }
    // #endregion
}
