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
        }

        $tasks = $entityManager->getRepository(Task::class)->findAllSorted();

        // SEE: https://github.com/symfony/symfony/discussions/53199
        // TODO: it does get out of debug menu for some reasons
        $response = new Response(
            null, 
            $form->isSubmitted() ? Response::HTTP_SEE_OTHER : 200
        );
        return $this->render('task/index.html.twig', [
            "form" => $form,
            "tasks" => $tasks,
        ], $response);
    }
}
