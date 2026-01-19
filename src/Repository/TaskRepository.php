<?php

namespace App\Repository;

use App\Entity\Task;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\QueryBuilder;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Task>
 */
class TaskRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Task::class);
    }

    public function findByCriteria(array $sort, array $filter): array
    {
        $q = $this->createQueryBuilder('t');

        // NOTE: валидация параметров сортировки и фильтрации
        [$sort, $filter] = $this->validateCriteria($sort, $filter);

        // NOTE: применения критириев
        $this->applyCriteria($q, $sort, $filter);

        return $q->getQuery()->getResult();
    }

    private function validateCriteria(array $sort, array $filter): array
    {
        // NOTE: валидация параметров сортировки и фильтрации
        if (!in_array($sort['field'], ['id', 'created_at', 'deadline'])) {
            $sort['field'] = 'created_at';
        }
        $sort['order'] = strtolower($sort['order']);
        if (!in_array($sort['order'], ['asc', 'desc'])) {
            $sort['order'] = 'desc';
        }

        // NOTE: валидация параметров фильтрации
        if (!in_array($filter['status'], ['all', 'active', 'completed', 'deleted'])) {
            $filter['status'] = 'active';
        }

        return [$sort, $filter];
    }

    private function applyCriteria(QueryBuilder $q, array $sort, array $filter): QueryBuilder
    {
        // NOTE: применение параметров сортировки
        $q->orderBy('t.'.$sort['field'], $sort['order']);

        // NOTE: применение параметров фильтрации по статусу
        switch ($filter['status']) {
            case 'active':
                $q
                    ->andWhere('t.is_deleted = :is_deleted')
                    ->andWhere('t.is_done = :is_done')
                    ->setParameter('is_deleted', false)
                    ->setParameter('is_done', false);
                break;
            case 'completed':
                $q
                    ->andWhere('t.is_deleted = :is_deleted')
                    ->andWhere('t.is_done = :is_done')
                    ->setParameter('is_deleted', false)
                    ->setParameter('is_done', true);
                break;
            case 'deleted':
                $q
                    ->andWhere('t.is_deleted = :is_deleted')
                    ->setParameter('is_deleted', true);
                break;
            case 'all':
            default:
                // NOTE: показываем все задачи, включая удаленные
                break;
        }

        // NOTE: применение параметров фильтрации по дедлайну
        if ($filter['deadline_from']) {
            $q
                ->andWhere('t.deadline >= :deadline_from')
                ->setParameter('deadline_from', new \DateTime($filter['deadline_from']));
        }
        if ($filter['deadline_to']) {
            $q
                ->andWhere('t.deadline <= :deadline_to')
                ->setParameter('deadline_to', new \DateTime($filter['deadline_to']));
        }

        return $q;
    }
}
