<?php

namespace app\controllers;

use Yii;
use app\models\MessageReaction;
use app\models\Message;
use app\models\ConversationParticipant;
use yii\rest\Controller;
use yii\filters\auth\HttpBearerAuth;
use yii\filters\Cors;

class MessageReactionController extends Controller
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
                    'DELETE',
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
    $reaction = $data['reaction'] ?? null;

    if (!$messageId || !$reaction) {
        Yii::$app->response->statusCode = 400;

        return [
            'error' => 'message_id and reaction are required'
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

    // Check conversation participant
    $participant = ConversationParticipant::find()
        ->where([
            'conversation_id' => $message->conversation_id,
            'user_id' => $userId,
        ])
        ->exists();

    if (!$participant) {
        Yii::$app->response->statusCode = 403;

        return [
            'error' => 'You are not allowed to react to this message'
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
                'error' => 'You are not authorized to react in this task chat'
            ];
        }
    }

    // Check if this exact reaction already exists
    $existingReaction = MessageReaction::find()
        ->where([
            'message_id' => $messageId,
            'user_id' => $userId,
            'reaction' => $reaction,
        ])
        ->one();

    // Don't create the same reaction twice
    if ($existingReaction) {
        return $existingReaction;
    }

    // Create a new reaction
    $model = new MessageReaction();

    $model->message_id = $messageId;
    $model->user_id = $userId;
    $model->reaction = $reaction;
    $model->created_at = time();

    if (!$model->save()) {
        Yii::$app->response->statusCode = 422;

        return [
            'error' => 'Unable to add reaction',
            'details' => $model->errors,
        ];
    }

    return $model;
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

    // Check conversation participant
    $participant = ConversationParticipant::find()
        ->where([
            'conversation_id' => $message->conversation_id,
            'user_id' => $userId,
        ])
        ->exists();

    if (!$participant) {
        Yii::$app->response->statusCode = 403;

        return [
            'error' => 'You are not allowed to view reactions'
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
                'error' => 'You are not authorized to view reactions in this task chat'
            ];
        }
    }

    return MessageReaction::find()
        ->where([
            'message_id' => $messageId,
        ])
        ->all();
}



    public function actionDelete($id)
{
    $userId = Yii::$app->user->id;

    $reaction = MessageReaction::findOne($id);

    if (!$reaction) {
        Yii::$app->response->statusCode = 404;

        return [
            'error' => 'Reaction not found'
        ];
    }

    // Only the user who created the reaction can remove it
    if ((int)$reaction->user_id !== (int)$userId) {
        Yii::$app->response->statusCode = 403;

        return [
            'error' => 'You can only remove your own reaction'
        ];
    }

    $message = Message::findOne($reaction->message_id);

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

    // Check conversation participant
    $participant = ConversationParticipant::find()
        ->where([
            'conversation_id' => $message->conversation_id,
            'user_id' => $userId,
        ])
        ->exists();

    if (!$participant) {
        Yii::$app->response->statusCode = 403;

        return [
            'error' => 'You are not allowed to remove this reaction'
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
                'error' => 'You are not authorized to remove reactions in this task chat'
            ];
        }
    }

    $reaction->delete();

    return [
        'message' => 'Reaction removed successfully'
    ];
}
}