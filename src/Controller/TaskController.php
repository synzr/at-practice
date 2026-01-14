<?php

namespace App\Controller;

use App\Entity\Task;
use App\Form\TaskType;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\Request;

final class TaskController extends AbstractController
{
    #[Route('/', name: 'app_task')]
    public function index(
        Request $request,
        EntityManagerInterface $entityManager
    ): Response
    {
        $task = new Task();
        $form = $this->createForm(TaskType::class, $task);

        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            $task = $form->getData();

            $entityManager->persist($task);
            $entityManager->flush();

            return $this->redirectToRoute('app_task');
        }

        $tasks = $entityManager->getRepository(Task::class)->findAllSorted();

        return $this->render('task/index.html.twig', [
            "form" => $form,
            "tasks" => $tasks,
        ]);
    }
}
