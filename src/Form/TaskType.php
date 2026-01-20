<?php

namespace App\Form;

use App\Dto\TaskDto;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\DateType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @extends AbstractType<TaskDto>
 */
class TaskType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('name', TextType::class, [
                'label' => 'Название',
                'constraints' => [
                    new Assert\NotBlank(null, 'Пожалуйста, введите название задачи'),
                    new Assert\Length(null, 3, 70, null, null, null, null, 'Пожалуйста, введите название задачи от 3-х символов', 'Пожалуйста, введите название задачи до 70 символов'),
                ],
            ])
            ->add('description', TextareaType::class, [
                'required' => false,
                'label' => 'Описание',
                'constraints' => [
                    new Assert\Length(null, null, 140, null, null, null, null, null, 'Пожалуйста, введите описание задачи до 140 символов'),
                ],
            ])
            ->add('deadline', DateType::class, [
                'label' => 'Дедлайн',
                'required' => false,
                'constraints' => [
                    new Assert\NotBlank(null, 'Пожалуйста, введите дедлайн задачи'),
                ],
            ]);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => TaskDto::class,
        ]);
    }
}
