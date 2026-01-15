<?php

namespace App\Controller;

use App\Entity\Task;
use App\Form\TaskType;
use App\Repository\TaskRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\Request;

final class TaskController extends AbstractController
{
    /**
     * Репозиторий задач
     */
    private TaskRepository $taskRepository;

    public function __construct(TaskRepository $taskRepository) {
        $this->taskRepository = $taskRepository;
    }

    /**
     * Главная страница
     */
    #[Route('/', name: 'task_index', methods: ['GET'])]
    public function index(): Response
    {
        $form = $this->createForm(TaskType::class);
        $tasks = $this->taskRepository->findBy([], ['created_at' => 'DESC']);
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
            $this->taskRepository->create($task);

            return $this->json([
                'success' => true,
                'task' => $this->renderView('task/_task.html.twig', ['task' => $task]),
            ], 201 /* Created */);
        }

        return $this->json(['success' => false], 400 /* Bad Request */);
    }
}
