<?php

namespace app\components;

use app\models\Task;
use app\models\TaskAssignment;
use app\models\TaskWatcher;
use app\models\TeamMembership;

class AccessControl
{
    public static function canViewTask(Task $task, int $userId): bool
    {
        // Task creator
        if ((int) $task->created_by === $userId) {
            return true;
        }

        // Direct assignee
        if ((int) $task->assigned_to === $userId) {
            return true;
        }

        // Watcher
        if (
            TaskWatcher::find()
                ->where([
                    'task_id' => $task->id,
                    'user_id' => $userId,
                ])
                ->exists()
        ) {
            return true;
        }

        // Individual task assignment
        if (
            TaskAssignment::find()
                ->where([
                    'task_id' => $task->id,
                    'user_id' => $userId,
                ])
                ->exists()
        ) {
            return true;
        }

        // Reporting-chain manager
        $taskCreator = \app\models\User::findOne($task->created_by);

        if ($taskCreator) {
            $managerId = $taskCreator->manager_id;

            while ($managerId !== null) {
                if ((int) $managerId === $userId) {
                    return true;
                }

                $manager = \app\models\User::findOne($managerId);

                if (!$manager) {
                    break;
                }

                $managerId = $manager->manager_id;
            }
        }

        // Team assignment
        $assignedTeamIds = TaskAssignment::find()
            ->select('team_id')
            ->where([
                'task_id' => $task->id,
            ])
            ->andWhere(['not', ['team_id' => null]])
            ->column();

        if (!empty($assignedTeamIds)) {
            return TeamMembership::find()
                ->where([
                    'user_id' => $userId,
                    'status' => 'active',
                ])
                ->andWhere(['team_id' => $assignedTeamIds])
                ->exists();
        }

        return false;
    }
}