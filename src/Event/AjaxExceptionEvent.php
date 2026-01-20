<?php

namespace App\Event;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;

class AjaxExceptionEvent
{
    private ExceptionEvent $exceptionEvent;

    public function __construct(ExceptionEvent $exceptionEvent)
    {
        $this->exceptionEvent = $exceptionEvent;
    }

    public function getExceptionEvent(): ExceptionEvent
    {
        return $this->exceptionEvent;
    }

    public function getException(): \Throwable
    {
        return $this->exceptionEvent->getThrowable();
    }

    public function getRequest(): Request
    {
        return $this->exceptionEvent->getRequest();
    }

    public function isAjaxRequest(): bool
    {
        return $this->getRequest()->isXmlHttpRequest()
               || 'application/json' === $this->getRequest()->headers->get('Accept');
    }

    /**
     * @param array<string, mixed> $data
     */
    public function setJsonResponse(array $data, int $statusCode = 500): void
    {
        $response = new JsonResponse($data, $statusCode);
        $this->exceptionEvent->setResponse($response);
    }

    public function setNotFoundResponse(string $message = 'Не найдено'): void
    {
        $this->setJsonResponse([
            'success' => false,
            'message' => $message,
        ], 404);
    }

    public function setBadRequestResponse(string $message = 'Неверный запрос'): void
    {
        $this->setJsonResponse([
            'success' => false,
            'message' => $message,
        ], 400);
    }

    public function setInternalServerErrorResponse(string $message = 'Внутренняя ошибка сервера'): void
    {
        $this->setJsonResponse([
            'success' => false,
            'message' => $message,
        ], 500);
    }
}
