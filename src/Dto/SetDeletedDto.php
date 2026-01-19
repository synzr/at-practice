<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

class SetDeletedDto
{
    #[Assert\NotNull]
    #[Assert\Type('bool')]
    public ?bool $flag = null;

    public function getFlag(): ?bool
    {
        return $this->flag;
    }

    public function setFlag(?bool $flag): void
    {
        $this->flag = $flag;
    }
}
