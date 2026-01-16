<?php

namespace App\Dto;

class TaskDto
{
    public string $name;
    public ?string $description = null;
    public ?\DateTime $deadline = null;

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): void
    {
        $this->name = $name;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): void
    {
        $this->description = $description;
    }

    public function getDeadline(): ?\DateTime
    {
        return $this->deadline;
    }

    public function setDeadline(?\DateTime $deadline): void
    {
        $this->deadline = $deadline;
    }
}
