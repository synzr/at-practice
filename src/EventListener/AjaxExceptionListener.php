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

        // NOTE: обрабатываем только AJAX-запросы
        if (!$ajaxEvent->isAjaxRequest()) {
            return;
        }

        $exception = $ajaxEvent->getException();

        // NOTE: обрабатываем конкретные типы исключений
        if ($exception instanceof EntityNotFoundException) {
            $ajaxEvent->setNotFoundResponse('Не найдено');

            return;
        }

        if (
            $exception instanceof BadRequestException
            || $exception instanceof \InvalidArgumentException
        ) {
            $ajaxEvent->setBadRequestResponse($exception->getMessage());

            return;
        }

        if ($exception instanceof AccessDeniedException) {
            $ajaxEvent->setJsonResponse([
                'success' => false,
                'message' => 'Доступ запрещен',
            ], 403);

            return;
        }

        // NOTE: обрабатываем HTTP-исключения
        if ($exception instanceof HttpExceptionInterface) {
            $ajaxEvent->setJsonResponse([
                'success' => false,
                'message' => $exception->getMessage(),
            ], $exception->getStatusCode());

            return;
        }

        // NOTE: обрабатываем все остальные исключения
        $ajaxEvent->setInternalServerErrorResponse('Внутренняя ошибка сервера');
    }
}
