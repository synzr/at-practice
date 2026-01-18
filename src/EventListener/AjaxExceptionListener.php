<?php

namespace App\EventListener;

use App\Event\AjaxExceptionEvent;
use Doctrine\ORM\EntityNotFoundException;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\HttpFoundation\Exception\BadRequestException;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

#[AsEventListener(event: 'kernel.exception', method: 'onKernelException')]
class AjaxExceptionListener
{
    public function onKernelException(ExceptionEvent $event): void
    {
        $ajaxEvent = new AjaxExceptionEvent($event);

        // Only handle AJAX requests
        if (!$ajaxEvent->isAjaxRequest()) {
            return;
        }

        $exception = $ajaxEvent->getException();

        // Handle specific exception types
        if ($exception instanceof EntityNotFoundException) {
            $ajaxEvent->setNotFoundResponse('Task not found');

            return;
        }

        if ($exception instanceof BadRequestException || $exception instanceof \InvalidArgumentException) {
            $ajaxEvent->setBadRequestResponse($exception->getMessage());

            return;
        }

        if ($exception instanceof AccessDeniedException) {
            $ajaxEvent->setJsonResponse([
                'success' => false,
                'message' => 'Access denied',
            ], 403);

            return;
        }

        // Handle HTTP exceptions
        if ($exception instanceof HttpExceptionInterface) {
            $ajaxEvent->setJsonResponse([
                'success' => false,
                'message' => $exception->getMessage(),
            ], $exception->getStatusCode());

            return;
        }

        // Handle all other exceptions
        $ajaxEvent->setInternalServerErrorResponse('Failed to process request');
    }
}
