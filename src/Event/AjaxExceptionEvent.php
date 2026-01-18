<?php

namespace App\Event;

use Symfony\Component\HttpFoundation\JsonResponse;
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

    public function getRequest(): \Symfony\Component\HttpFoundation\Request
    {
        return $this->exceptionEvent->getRequest();
    }

    public function isAjaxRequest(): bool
    {
        return $this->getRequest()->isXmlHttpRequest()
               || 'application/json' === $this->getRequest()->headers->get('Accept');
    }

    public function setJsonResponse(array $data, int $statusCode = 500): void
    {
        $response = new JsonResponse($data, $statusCode);
        $this->exceptionEvent->setResponse($response);
    }

    public function setNotFoundResponse(string $message = 'Not Found'): void
    {
        $this->setJsonResponse([
            'success' => false,
            'message' => $message,
        ], 404);
    }

    public function setBadRequestResponse(string $message = 'Bad Request'): void
    {
        $this->setJsonResponse([
            'success' => false,
            'message' => $message,
        ], 400);
    }

    public function setInternalServerErrorResponse(string $message = 'Internal Server Error'): void
    {
        $this->setJsonResponse([
            'success' => false,
            'message' => $message,
        ], 500);
    }
}
