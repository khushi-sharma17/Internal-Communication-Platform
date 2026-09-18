<?php

namespace app\controllers;

use app\models\Task;
use app\models\TaskActivity;
use Yii;
use yii\rest\ActiveController;
use yii\web\ForbiddenHttpException;

class TaskController extends ActiveController
{
    public $modelClass = Task::class;

    public $enableCsrfValidation = false;

    private $oldStatus;
    private $oldPriority;
    private $oldDueDate;

    public function behaviors()
    {
        $behaviors = parent::behaviors();

        $behaviors['authenticator'] = [
            'class' => \yii\filters\auth\HttpBearerAuth::class,
        ];

        return $behaviors;
    }



    public function actions()
    {
        $actions = parent::actions();
        unset($actions['view']);
        unset($actions['index']);
        return $actions;
    }




    public function beforeAction($action)
    {
        if (!parent::beforeAction($action)) {
            return false;
        }

        Yii::error('TASK ACTION: ' . $action->id);

        $userId = Yii::$app->user->id;

        if (!\app\components\Rbac::hasPermission($userId, 'view_tasks')) {
            throw new ForbiddenHttpException(
                'You do not have permission to view tasks.'
            );
        }


        // Task visibility check for viewing a single task
        if (Yii::$app->request->get('id') !== null) {
            $taskId = Yii::$app->request->get('id');
            $task = Task::findOne($taskId);

            if (!$task) {
                return true;
            }

            if (!$this->canViewTask($task, (int)$userId)) {
                throw new ForbiddenHttpException(
                    'You do not have access to this task.'
                );
            }
        }


        // Keep the rest of your existing beforeAction code below this point.
        if (in_array($action->id, ['update', 'patch'])) {
            $request = Yii::$app->request;
            $taskId = Yii::$app->request->get('id');

            $task = Task::findOne($taskId);

            if (!$task) {
                return false;
            }

            // Store old values before update
            $this->oldStatus = $task->status;
            $this->oldPriority = $task->priority;
            $this->oldDueDate = $task->due_date;

            $newStatus = $request->bodyParams['status'] ?? null;

            if ($newStatus !== null) {
                $allowedStatuses = [
                    'todo',
                    'in progress',
                    'blocked',
                    'review',
                    'completed',
                ];

                $allowedTransitions = [
                    'todo' => ['in progress'],
                    'in progress' => ['blocked', 'review'],
                    'blocked' => ['in progress'],
                    'review' => ['completed', 'in progress'],
                    'completed' => ['todo'],
                ];

                $currentStatus = $task->status;

                if (
                    $newStatus !== $currentStatus &&
                    !in_array(
                        $newStatus,
                        $allowedTransitions[$currentStatus] ?? [],
                        true
                    )
                ) {
                    Yii::$app->response->statusCode = 422;
                    Yii::$app->response->data = [
                        'error' => 'Invalid status transition.',
                        'from' => $currentStatus,
                        'to' => $newStatus,
                    ];

                    return false;
                }

                if (!in_array($newStatus, $allowedStatuses, true)) {
                    Yii::$app->response->statusCode = 422;
                    Yii::$app->response->data = [
                        'error' => 'Invalid task status.',
                    ];

                    return false;
                }
            }
        }

        return parent::beforeAction($action);
    }



    private function canViewTask(Task $task, int $userId): bool
    {
        // Task creator
        if ((int)$task->created_by === $userId) {
            return true;
        }

        // Direct assignee
        if ((int)$task->assigned_to === $userId) {
            return true;
        }

        // Watcher
        $isWatcher = \app\models\TaskWatcher::find()
            ->where([
                'task_id' => $task->id,
                'user_id' => $userId,
            ])
            ->exists();

        if ($isWatcher) {
            return true;
        }

        // Individual task assignment
        $isAssignedUser = \app\models\TaskAssignment::find()
            ->where([
                'task_id' => $task->id,
                'user_id' => $userId,
            ])
            ->exists();

        if ($isAssignedUser) {
            return true;
        }


        // Reporting-chain manager
        $taskCreator = \app\models\User::findOne($task->created_by);

        if ($taskCreator) {
            $managerId = $taskCreator->manager_id;

            while ($managerId !== null) {
                if ((int)$managerId === $userId) {
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
        $assignedTeamIds = \app\models\TaskAssignment::find()
            ->select('team_id')
            ->where([
                'task_id' => $task->id,
            ])
            ->andWhere(['not', ['team_id' => null]])
            ->column();

        if (!empty($assignedTeamIds)) {
            $isTeamMember = \app\models\TeamMembership::find()
                ->where([
                    'user_id' => $userId,
                    'status' => 'active',
                ])
                ->andWhere(['team_id' => $assignedTeamIds])
                ->exists();

            if ($isTeamMember) {
                return true;
            }
        }

        return false;
    }



    public function actionIndex()
    {
        $userId = (int) Yii::$app->user->id;

        $tasks = Task::find()->all();

        $visibleTasks = [];

        foreach ($tasks as $task) {
            if ($this->canViewTask($task, $userId)) {
                $visibleTasks[] = $task;
            }
        }

        return $visibleTasks;
    }



    public function actionView($id)
    {
        $task = Task::findOne($id);

        if (!$task) {
            throw new \yii\web\NotFoundHttpException('Task not found.');
        }

        $userId = (int) Yii::$app->user->id;

        if (!$this->canViewTask($task, $userId)) {
            throw new ForbiddenHttpException(
                'You do not have access to this task.'
            );
        }

        return $task;
    }



    public function afterAction($action, $result)
    {
        if (
            in_array($action->id, ['update', 'patch']) &&
            $result instanceof Task
        ) {
            // Status change
            if (
                $this->oldStatus !== null &&
                $result->status !== $this->oldStatus
            ) {
                $activity = new TaskActivity();

                $activity->task_id = $result->id;
                $activity->user_id = Yii::$app->user->id;
                $activity->action = 'status_change';
                $activity->details =
                    'Status changed from ' .
                    $this->oldStatus .
                    ' to ' .
                    $result->status;
                $activity->created_at = time();

                $activity->save(false);
            }

            // Priority change
            if (
                $this->oldPriority !== null &&
                $result->priority !== $this->oldPriority
            ) {
                $activity = new TaskActivity();

                $activity->task_id = $result->id;
                $activity->user_id = Yii::$app->user->id;
                $activity->action = 'priority_change';
                $activity->details =
                    'Priority changed from ' .
                    $this->oldPriority .
                    ' to ' .
                    $result->priority;
                $activity->created_at = time();

                $activity->save(false);
            }

            // Due date change
            if ($result->due_date != $this->oldDueDate) {
                $activity = new TaskActivity();

                $activity->task_id = $result->id;
                $activity->user_id = Yii::$app->user->id;
                $activity->action = 'due_date_change';
                $activity->details =
                    'Due date changed from ' .
                    ($this->oldDueDate ?? 'none') .
                    ' to ' .
                    ($result->due_date ?? 'none');
                $activity->created_at = time();

                $activity->save(false);
            }
        }

        return parent::afterAction($action, $result);
    }
}