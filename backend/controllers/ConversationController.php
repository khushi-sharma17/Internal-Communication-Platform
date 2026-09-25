<?php

namespace app\controllers;

use yii\rest\ActiveController;
use yii\web\ForbiddenHttpException;

class ConversationController extends ActiveController
{
    public $modelClass = 'app\models\Conversation';

    public $enableCsrfValidation = false;

    public function behaviors()
    {
        $behaviors = parent::behaviors();

        $behaviors['authenticator'] = [
            'class' => \yii\filters\auth\HttpBearerAuth::class,
            'except' => ['options'],
        ];

        return $behaviors;
    }

    public function actions()
    {
        $actions = parent::actions();

        unset($actions['create']);

        return $actions;
    }



    public function beforeAction($action)
    {
        if (\Yii::$app->request->isOptions) {
            \Yii::$app->response->statusCode = 200;
            return false;
        }

        return parent::beforeAction($action);
    }



    public function actionCreate()
    {
        $userId = \Yii::$app->user->id;

        $otherUserId = \Yii::$app->request->bodyParams['user_id'] ?? null;

        if (!$otherUserId) {
            \Yii::$app->response->statusCode = 422;

            return [
                'message' => 'user_id is required.'
            ];
        }

        if ((int)$otherUserId === (int)$userId) {
            \Yii::$app->response->statusCode = 422;

            return [
                'message' => 'You cannot create a conversation with yourself.'
            ];
        }

        // Check whether a one-to-one conversation already exists
        $conversation = \app\models\Conversation::find()
            ->alias('c')
            ->innerJoin(
                'conversation_participants cp1',
                'cp1.conversation_id = c.id AND cp1.user_id = :user1',
                [':user1' => $userId]
            )
            ->innerJoin(
                'conversation_participants cp2',
                'cp2.conversation_id = c.id AND cp2.user_id = :user2',
                [':user2' => $otherUserId]
            )
            ->where([
                'c.type' => 'one_to_one',
            ])
            ->one();

        // If it already exists, return it
        if ($conversation) {
            \Yii::$app->response->statusCode = 200;

            return $conversation;
        }

        $transaction = \Yii::$app->db->beginTransaction();

        try {
            $conversation = new \app\models\Conversation();

            $conversation->type = 'one_to_one';
            $conversation->created_by = $userId;
            $conversation->created_at = time();
            $conversation->visibility = 'private';

            if (!$conversation->save()) {
                throw new \Exception(
                    json_encode($conversation->getErrors())
                );
            }

            // Add current user
            $participant1 = new \app\models\ConversationParticipant();
            $participant1->conversation_id = $conversation->id;
            $participant1->user_id = $userId;
            $participant1->joined_at = time();
            $participant1->role = 'member';

            if (!$participant1->save()) {
                throw new \Exception(
                    json_encode($participant1->getErrors())
                );
            }

            // Add other user
            $participant2 = new \app\models\ConversationParticipant();
            $participant2->conversation_id = $conversation->id;
            $participant2->user_id = $otherUserId;
            $participant2->joined_at = time();
            $participant2->role = 'member';

            if (!$participant2->save()) {
                throw new \Exception(
                    json_encode($participant2->getErrors())
                );
            }

            $transaction->commit();

            \Yii::$app->response->statusCode = 201;

            return $conversation;

        } catch (\Throwable $e) {
            $transaction->rollBack();

            \Yii::$app->response->statusCode = 422;

            return [
                'message' => $e->getMessage()
            ];
        }
    }





    public function actionCreateTaskChat()
    {
        $userId = \Yii::$app->user->id;
        $taskId = \Yii::$app->request->bodyParams['task_id'] ?? null;

        if (!$taskId) {
            \Yii::$app->response->statusCode = 422;
            return [
                'message' => 'task_id is required.'
            ];
        }

        $task = \app\models\Task::findOne($taskId);

        if (!$task) {
            \Yii::$app->response->statusCode = 404;
            return [
                'message' => 'Task not found.'
            ];
        }

        // Check whether a task conversation already exists
        $conversation = \app\models\Conversation::find()
            ->where([
                'type' => 'task_chat',
                'task_id' => $taskId,
            ])
            ->one();

        if ($conversation) {
            \Yii::$app->response->statusCode = 200;
            return $conversation;
        }

        $transaction = \Yii::$app->db->beginTransaction();

        try {
            $conversation = new \app\models\Conversation();
            $conversation->type = 'task_chat';
            $conversation->task_id = $taskId;
            $conversation->created_by = $userId;
            $conversation->created_at = time();
            $conversation->visibility = 'private';

            if (!$conversation->save()) {
                throw new \Exception(
                    json_encode($conversation->getErrors())
                );
            }

            // Add task creator
            $participant = new \app\models\ConversationParticipant();
            $participant->conversation_id = $conversation->id;
            $participant->user_id = $task->created_by;
            $participant->joined_at = time();
            $participant->role = 'member';

            if (!$participant->save()) {
                throw new \Exception(
                    json_encode($participant->getErrors())
                );
            }

            // Add assigned user if different from creator
            if ($task->assigned_to && (int)$task->assigned_to !== (int)$task->created_by) {
                $participant = new \app\models\ConversationParticipant();
                $participant->conversation_id = $conversation->id;
                $participant->user_id = $task->assigned_to;
                $participant->joined_at = time();
                $participant->role = 'member';

                if (!$participant->save()) {
                    throw new \Exception(
                        json_encode($participant->getErrors())
                    );
                }
            }

            // Add current user if not already included
            if (
                (int)$userId !== (int)$task->created_by &&
                (int)$userId !== (int)$task->assigned_to
            ) {
                $participant = new \app\models\ConversationParticipant();
                $participant->conversation_id = $conversation->id;
                $participant->user_id = $userId;
                $participant->joined_at = time();
                $participant->role = 'member';

                if (!$participant->save()) {
                    throw new \Exception(
                        json_encode($participant->getErrors())
                    );
                }
            }

            $transaction->commit();

            \Yii::$app->response->statusCode = 201;

            return $conversation;

        } catch (\Throwable $e) {
            $transaction->rollBack();

            \Yii::$app->response->statusCode = 422;

            return [
                'message' => $e->getMessage()
            ];
        }
    }
}