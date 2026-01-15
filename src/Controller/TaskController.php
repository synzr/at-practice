<?php

namespace App\Controller;

use App\Entity\Task;
use App\Form\TaskType;
use App\Repository\TaskRepository;
use App\Service\TaskService;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

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

    /**
     * Главная страница
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
    #[Route('/create', name: 'task_create', methods: ['POST'])]
    public function create(Request $request)
    {
        $form = $this->createForm(TaskType::class, new Task());
        $form->handleRequest($request);

        // NOTE: сохраняем задачу, если форма заполнена и валидна
        if ($form->isSubmitted() && $form->isValid()) {
            $task = $form->getData();
            $this->taskService->createTask($task);

            return $this->json([
                'success' => true,
                'task' => $this->renderView('task/_task.html.twig', ['task' => $task]),
            ], 201 /* Created */);
        }

        return $this->json(['success' => false], 400 /* Bad Request */);
    }
}
