<?php

namespace app\controllers;

use Yii;
use app\models\Message;
use app\models\MessageRead;
use app\models\ConversationParticipant;
use yii\rest\Controller;
use yii\filters\auth\HttpBearerAuth;
use yii\filters\Cors;

class MessageReadController extends Controller
{
    public function behaviors()
    {
        $behaviors = parent::behaviors();

        $behaviors['corsFilter'] = [
            'class' => Cors::class,
            'cors' => [
                'Origin' => ['http://localhost:5173'],
                'Access-Control-Request-Method' => [
                    'GET',
                    'POST',
                    'OPTIONS',
                ],
                'Access-Control-Request-Headers' => [
                    'Authorization',
                    'Content-Type',
                ],
                'Access-Control-Allow-Credentials' => false,
            ],
        ];

        $behaviors['authenticator'] = [
            'class' => HttpBearerAuth::class,
            'except' => ['options'],
        ];

        return $behaviors;
    }

    public function actionOptions()
    {
        Yii::$app->response->statusCode = 200;

        return [];
    }

    public function actionCreate()
    {
        $userId = Yii::$app->user->id;
        $data = Yii::$app->request->bodyParams;

        $messageId = $data['message_id'] ?? null;

        if (!$messageId) {
            Yii::$app->response->statusCode = 400;

            return [
                'error' => 'message_id is required'
            ];
        }

        $message = Message::findOne($messageId);

        if (!$message) {
            Yii::$app->response->statusCode = 404;

            return [
                'error' => 'Message not found'
            ];
        }

        $conversation = $message->conversation;

        if (!$conversation) {
            Yii::$app->response->statusCode = 404;

            return [
                'error' => 'Conversation not found'
            ];
        }

        // Check if the user belongs to the conversation
        $participant = ConversationParticipant::find()
            ->where([
                'conversation_id' => $message->conversation_id,
                'user_id' => $userId,
            ])
            ->exists();

        if (!$participant) {
            Yii::$app->response->statusCode = 403;

            return [
                'error' => 'You are not allowed to mark this message as read'
            ];
        }

        // Team Chat authorization
        if (
            $conversation->type === 'team_chat'
            && $conversation->channel_id !== null
        ) {
            $isChannelMember = \app\models\ChannelMembership::find()
                ->where([
                    'channel_id' => $conversation->channel_id,
                    'user_id' => $userId,
                    'status' => 'active',
                ])
                ->exists();

            if (!$isChannelMember) {
                Yii::$app->response->statusCode = 403;

                return [
                    'error' => 'You are not a member of this channel'
                ];
            }
        }

        // Task Chat authorization
        if (
            $conversation->type === 'task_chat'
            && $conversation->task_id !== null
        ) {
            $task = \app\models\Task::findOne($conversation->task_id);

            if (!$task) {
                Yii::$app->response->statusCode = 404;

                return [
                    'error' => 'Task not found'
                ];
            }

            $isTaskAuthorized =
                (int)$task->created_by === (int)$userId
                || (int)$task->assigned_to === (int)$userId
                || \app\models\TaskWatcher::find()
                    ->where([
                        'task_id' => $task->id,
                        'user_id' => $userId,
                    ])
                    ->exists();

            if (!$isTaskAuthorized) {
                Yii::$app->response->statusCode = 403;

                return [
                    'error' => 'You are not authorized to mark this task message as read'
                ];
            }
        }

        // Check if the message is already marked as read
        $messageRead = MessageRead::find()
            ->where([
                'message_id' => $messageId,
                'user_id' => $userId,
            ])
            ->one();

        if ($messageRead) {
            // Update the read time
            $messageRead->read_at = time();
            $messageRead->save();

            return $messageRead;
        }

        // Create a new read receipt
        $messageRead = new MessageRead();

        $messageRead->message_id = $messageId;
        $messageRead->user_id = $userId;
        $messageRead->read_at = time();

        if (!$messageRead->save()) {
            Yii::$app->response->statusCode = 422;

            return [
                'error' => 'Unable to mark message as read',
                'details' => $messageRead->errors,
            ];
        }

        return $messageRead;
    }



    
    public function actionIndex($messageId)
    {
        $userId = Yii::$app->user->id;

        $message = Message::findOne($messageId);

        if (!$message) {
            Yii::$app->response->statusCode = 404;

            return [
                'error' => 'Message not found'
            ];
        }

        $conversation = $message->conversation;

        if (!$conversation) {
            Yii::$app->response->statusCode = 404;

            return [
                'error' => 'Conversation not found'
            ];
        }

        // Check if the user belongs to the conversation
        $participant = ConversationParticipant::find()
            ->where([
                'conversation_id' => $message->conversation_id,
                'user_id' => $userId,
            ])
            ->exists();

        if (!$participant) {
            Yii::$app->response->statusCode = 403;

            return [
                'error' => 'You are not allowed to view read receipts for this message'
            ];
        }

        // Team Chat authorization
        if (
            $conversation->type === 'team_chat'
            && $conversation->channel_id !== null
        ) {
            $isChannelMember = \app\models\ChannelMembership::find()
                ->where([
                    'channel_id' => $conversation->channel_id,
                    'user_id' => $userId,
                    'status' => 'active',
                ])
                ->exists();

            if (!$isChannelMember) {
                Yii::$app->response->statusCode = 403;

                return [
                    'error' => 'You are not a member of this channel'
                ];
            }
        }

        // Task Chat authorization
        if (
            $conversation->type === 'task_chat'
            && $conversation->task_id !== null
        ) {
            $task = \app\models\Task::findOne($conversation->task_id);

            if (!$task) {
                Yii::$app->response->statusCode = 404;

                return [
                    'error' => 'Task not found'
                ];
            }

            $isTaskAuthorized =
                (int)$task->created_by === (int)$userId
                || (int)$task->assigned_to === (int)$userId
                || \app\models\TaskWatcher::find()
                    ->where([
                        'task_id' => $task->id,
                        'user_id' => $userId,
                    ])
                    ->exists();

            if (!$isTaskAuthorized) {
                Yii::$app->response->statusCode = 403;

                return [
                    'error' => 'You are not authorized to view read receipts in this task chat'
                ];
            }
        }

        return MessageRead::find()
            ->where([
                'message_id' => $messageId,
            ])
            ->all();
    }
}