<?php

namespace App\Dto;

class TaskDto
{
    public string $name = '';

    public ?string $description = null;

    public ?\DateTime $deadline = null;
}
