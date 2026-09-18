<?php

namespace app\controllers;

use Yii;
use yii\data\ActiveDataProvider;
use yii\rest\ActiveController;
use yii\web\UploadedFile;
use yii\filters\Cors;

class MessageController extends ActiveController
{
    public $modelClass = 'app\models\Message';

    public $enableCsrfValidation = false;

    public function behaviors()
    {
        $behaviors = parent::behaviors();

        $behaviors['corsFilter'] = [
            'class' => \yii\filters\Cors::class,
            'cors' => [
                'Origin' => ['http://localhost:5173'],
                'Access-Control-Request-Method' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
                'Access-Control-Request-Headers' => ['Authorization', 'Content-Type'],
                'Access-Control-Allow-Credentials' => false,
            ],
        ];

        $behaviors['authenticator'] = [
            'class' => \yii\filters\auth\HttpBearerAuth::class,
            'except' => ['options'],
        ];

        return $behaviors;
    }

    public function actions()
    {
        $actions = parent::actions();

        unset($actions['index']);
        unset($actions['create']);
        unset($actions['update']);

        return $actions;
    }

    public function prepareDataProvider()
    {
        $query = \app\models\Message::find();

        $conversationId = Yii::$app->request->get('conversation_id');

        if ($conversationId !== null) {
            $query->andWhere(['conversation_id' => $conversationId]);
        }

        return new ActiveDataProvider([
            'query' => $query,
        ]);
    }



    public function actionOptions()
    {
        Yii::$app->response->statusCode = 200;
        return [];
    }



    public function actionIndex()
    {
        $conversationId = Yii::$app->request->get('conversation_id');

        if ($conversationId === null) {
            throw new \yii\web\BadRequestHttpException(
                'conversation_id is required.'
            );
        }

        $userId = Yii::$app->user->id;

        // Find the conversation
        $conversation = \app\models\Conversation::findOne($conversationId);

        if (!$conversation) {
            throw new \yii\web\NotFoundHttpException(
                'Conversation not found.'
            );
        }

        // Check conversation participant
        $isParticipant = \app\models\ConversationParticipant::find()
            ->where([
                'conversation_id' => $conversationId,
                'user_id' => $userId,
            ])
            ->exists();

        if (!$isParticipant) {
            throw new \yii\web\ForbiddenHttpException(
                'You are not a participant in this conversation.'
            );
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
                throw new \yii\web\ForbiddenHttpException(
                    'You are not a member of this channel.'
                );
            }
        }

        // Task Chat authorization
        if (
            $conversation->type === 'task_chat'
            && $conversation->task_id !== null
        ) {
            $task = \app\models\Task::findOne($conversation->task_id);

            if (!$task) {
                throw new \yii\web\NotFoundHttpException(
                    'Task not found.'
                );
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
                throw new \yii\web\ForbiddenHttpException(
                    'You are not authorized to access this task chat.'
                );
            }
        }

        // Return only active messages
        return \app\models\Message::find()
            ->where([
                'conversation_id' => $conversationId,
            ])
            ->andWhere(['deleted_at' => null])
            ->all();
    }




    public function actionSoftDelete($id)
    {
        $message = \app\models\Message::findOne($id);

        if (!$message) {
            throw new \yii\web\NotFoundHttpException(
                'Message not found.'
            );
        }

        $userId = Yii::$app->user->id;

        // Only the sender can delete the message
        if ((int)$message->sender_id !== (int)$userId) {
            throw new \yii\web\ForbiddenHttpException(
                'You can only delete your own messages.'
            );
        }

        $conversation = $message->conversation;

        if (!$conversation) {
            throw new \yii\web\NotFoundHttpException(
                'Conversation not found.'
            );
        }

        // Check conversation participant
        $isParticipant = \app\models\ConversationParticipant::find()
            ->where([
                'conversation_id' => $message->conversation_id,
                'user_id' => $userId,
            ])
            ->exists();

        if (!$isParticipant) {
            throw new \yii\web\ForbiddenHttpException(
                'You are not a participant in this conversation.'
            );
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
                throw new \yii\web\ForbiddenHttpException(
                    'You are not a member of this channel.'
                );
            }
        }

        // Task Chat authorization
        if (
            $conversation->type === 'task_chat'
            && $conversation->task_id !== null
        ) {
            $task = \app\models\Task::findOne($conversation->task_id);

            if (!$task) {
                throw new \yii\web\NotFoundHttpException(
                    'Task not found.'
                );
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
                throw new \yii\web\ForbiddenHttpException(
                    'You are not authorized to delete messages in this task chat.'
                );
            }
        }

        $message->deleted_at = time();
        $message->updated_at = time();

        if ($message->save(false)) {
            return $message;
        }

        throw new \yii\web\UnprocessableEntityHttpException(
            'Unable to delete message.'
        );
    }




    public function actionReplies($id)
    {
        $message = \app\models\Message::findOne($id);

        if (!$message) {
            throw new \yii\web\NotFoundHttpException(
                'Message not found.'
            );
        }

        $userId = Yii::$app->user->id;

        $conversation = $message->conversation;

        if (!$conversation) {
            throw new \yii\web\NotFoundHttpException(
                'Conversation not found.'
            );
        }

        // Check conversation participant
        $isParticipant = \app\models\ConversationParticipant::find()
            ->where([
                'conversation_id' => $message->conversation_id,
                'user_id' => $userId,
            ])
            ->exists();

        if (!$isParticipant) {
            throw new \yii\web\ForbiddenHttpException(
                'You are not a participant in this conversation.'
            );
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
                throw new \yii\web\ForbiddenHttpException(
                    'You are not a member of this channel.'
                );
            }
        }

        // Task Chat authorization
        if (
            $conversation->type === 'task_chat'
            && $conversation->task_id !== null
        ) {
            $task = \app\models\Task::findOne($conversation->task_id);

            if (!$task) {
                throw new \yii\web\NotFoundHttpException(
                    'Task not found.'
                );
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
                throw new \yii\web\ForbiddenHttpException(
                    'You are not authorized to view replies in this task chat.'
                );
            }
        }

        return $message->replies;
    }




    public function actionCreate()
    {
        $model = new \app\models\Message();

        $model->load(Yii::$app->request->bodyParams, '');

        $userId = Yii::$app->user->id;

        $isParticipant = \app\models\ConversationParticipant::find()
            ->where([
                'conversation_id' => $model->conversation_id,
                'user_id' => $userId,
            ])
            ->exists();

        if (!$isParticipant) {
            throw new \yii\web\ForbiddenHttpException(
                'You are not a participant in this conversation.'
            );
        }

        $conversation = \app\models\Conversation::findOne(
            $model->conversation_id
        );

        if (!$conversation) {
            throw new \yii\web\NotFoundHttpException(
                'Conversation not found.'
            );
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
                throw new \yii\web\ForbiddenHttpException(
                    'You are not a member of this channel.'
                );
            }
        }

        // Task Chat authorization
        if (
            $conversation->type === 'task_chat'
            && $conversation->task_id !== null
        ) {
            $task = \app\models\Task::findOne($conversation->task_id);

            if (!$task) {
                throw new \yii\web\NotFoundHttpException(
                    'Task not found.'
                );
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
                throw new \yii\web\ForbiddenHttpException(
                    'You are not authorized to send messages in this task chat.'
                );
            }
        }

        $model->sender_id = $userId;
        $model->created_at = time();
        $model->updated_at = time();

        if ($model->save()) {

            $participants = \app\models\ConversationParticipant::find()
                ->where([
                    'conversation_id' => $model->conversation_id,
                ])
                ->andWhere([
                    '!=',
                    'user_id',
                    $userId,
                ])
                ->all();

            foreach ($participants as $participant) {

                $notification = new \app\models\Notification();

                $notification->user_id = $participant->user_id;
                $notification->type = 'message';
                $notification->message_id = $model->id;
                $notification->content = 'You have a new message';
                $notification->is_read = 0;
                $notification->created_at = time();

                $notification->save();
            }

            return $model;
        }

        throw new \yii\web\UnprocessableEntityHttpException(
            $model->getErrors()
        );
    }

    public function actionUpdate($id)
    {
        $message = \app\models\Message::findOne($id);

        if (!$message) {
            throw new \yii\web\NotFoundHttpException(
                'Message not found.'
            );
        }

        $userId = Yii::$app->user->id;

        // Only the sender can edit the message
        if ((int)$message->sender_id !== (int)$userId) {
            throw new \yii\web\ForbiddenHttpException(
                'You can only edit your own messages.'
            );
        }

        $conversation = $message->conversation;

        if (!$conversation) {
            throw new \yii\web\NotFoundHttpException(
                'Conversation not found.'
            );
        }

        // Check conversation participant
        $isParticipant = \app\models\ConversationParticipant::find()
            ->where([
                'conversation_id' => $message->conversation_id,
                'user_id' => $userId,
            ])
            ->exists();

        if (!$isParticipant) {
            throw new \yii\web\ForbiddenHttpException(
                'You are not a participant in this conversation.'
            );
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
                throw new \yii\web\ForbiddenHttpException(
                    'You are not a member of this channel.'
                );
            }
        }

        // Task Chat authorization
        if (
            $conversation->type === 'task_chat'
            && $conversation->task_id !== null
        ) {
            $task = \app\models\Task::findOne($conversation->task_id);

            if (!$task) {
                throw new \yii\web\NotFoundHttpException(
                    'Task not found.'
                );
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
                throw new \yii\web\ForbiddenHttpException(
                    'You are not authorized to edit messages in this task chat.'
                );
            }
        }

        $message->message = Yii::$app->request->getBodyParam('message');
        $message->updated_at = time();

        if ($message->save()) {
            return $message;
        }

        throw new \yii\web\UnprocessableEntityHttpException(
            $message->getErrors()
        );
    }




    public function actionMention($id)
    {
        $message = \app\models\Message::findOne($id);

        if (!$message) {
            throw new \yii\web\NotFoundHttpException(
                'Message not found.'
            );
        }

        $userId = Yii::$app->user->id;

        $conversation = $message->conversation;

        if (!$conversation) {
            throw new \yii\web\NotFoundHttpException(
                'Conversation not found.'
            );
        }

        // Check whether the current user can access this conversation
        $isParticipant = \app\models\ConversationParticipant::find()
            ->where([
                'conversation_id' => $message->conversation_id,
                'user_id' => $userId,
            ])
            ->exists();

        if (!$isParticipant) {
            throw new \yii\web\ForbiddenHttpException(
                'You are not a participant in this conversation.'
            );
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
                throw new \yii\web\ForbiddenHttpException(
                    'You are not a member of this channel.'
                );
            }
        }

        // Task Chat authorization
        if (
            $conversation->type === 'task_chat'
            && $conversation->task_id !== null
        ) {
            $task = \app\models\Task::findOne($conversation->task_id);

            if (!$task) {
                throw new \yii\web\NotFoundHttpException(
                    'Task not found.'
                );
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
                throw new \yii\web\ForbiddenHttpException(
                    'You are not authorized to mention users in this task chat.'
                );
            }
        }

        $mentionedUserId = Yii::$app->request->getBodyParam('user_id');

        if (!$mentionedUserId) {
            throw new \yii\web\BadRequestHttpException(
                'user_id is required.'
            );
        }

        if ((int)$mentionedUserId === (int)$userId) {
            throw new \yii\web\BadRequestHttpException(
                'You cannot mention yourself.'
            );
        }

        // Check that the mentioned user exists
        $mentionedUser = \app\models\User::findOne($mentionedUserId);

        if (!$mentionedUser) {
            throw new \yii\web\NotFoundHttpException(
                'Mentioned user not found.'
            );
        }

        // Prevent duplicate mentions
        $existingMention = \app\models\MessageMention::find()
            ->where([
                'message_id' => $message->id,
                'user_id' => $mentionedUserId,
            ])
            ->one();

        if ($existingMention) {
            return $existingMention;
        }

        $mention = new \app\models\MessageMention();

        $mention->message_id = $message->id;
        $mention->user_id = $mentionedUserId;
        $mention->created_at = time();

        if ($mention->save()) {

            $notification = new \app\models\Notification();

            $notification->user_id = $mentionedUserId;
            $notification->type = 'mention';
            $notification->message_id = $message->id;
            $notification->content = 'You were mentioned in a message';
            $notification->is_read = 0;
            $notification->created_at = time();

            $notification->save();

            return $mention;
        }

        throw new \yii\web\UnprocessableEntityHttpException(
            $mention->getErrors()
        );
    }




    public function actionMentions($id)
    {
        $message = \app\models\Message::findOne($id);

        if (!$message) {
            throw new \yii\web\NotFoundHttpException(
                'Message not found.'
            );
        }

        $userId = Yii::$app->user->id;

        $conversation = $message->conversation;

        if (!$conversation) {
            throw new \yii\web\NotFoundHttpException(
                'Conversation not found.'
            );
        }

        // Check conversation participant
        $isParticipant = \app\models\ConversationParticipant::find()
            ->where([
                'conversation_id' => $message->conversation_id,
                'user_id' => $userId,
            ])
            ->exists();

        if (!$isParticipant) {
            throw new \yii\web\ForbiddenHttpException(
                'You are not a participant in this conversation.'
            );
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
                throw new \yii\web\ForbiddenHttpException(
                    'You are not a member of this channel.'
                );
            }
        }

        // Task Chat authorization
        if (
            $conversation->type === 'task_chat'
            && $conversation->task_id !== null
        ) {
            $task = \app\models\Task::findOne($conversation->task_id);

            if (!$task) {
                throw new \yii\web\NotFoundHttpException(
                    'Task not found.'
                );
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
                throw new \yii\web\ForbiddenHttpException(
                    'You are not authorized to view mentions in this task chat.'
                );
            }
        }

        return $message->mentions;
    }

    public function actionDeleteMention($id, $mentionId)
    {
        $message = \app\models\Message::findOne($id);

        if (!$message) {
            throw new \yii\web\NotFoundHttpException(
                'Message not found.'
            );
        }

        $userId = Yii::$app->user->id;

        $conversation = $message->conversation;

        if (!$conversation) {
            throw new \yii\web\NotFoundHttpException(
                'Conversation not found.'
            );
        }

        // Check conversation participant
        $isParticipant = \app\models\ConversationParticipant::find()
            ->where([
                'conversation_id' => $message->conversation_id,
                'user_id' => $userId,
            ])
            ->exists();

        if (!$isParticipant) {
            throw new \yii\web\ForbiddenHttpException(
                'You are not a participant in this conversation.'
            );
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
                throw new \yii\web\ForbiddenHttpException(
                    'You are not a member of this channel.'
                );
            }
        }

        // Task Chat authorization
        if (
            $conversation->type === 'task_chat'
            && $conversation->task_id !== null
        ) {
            $task = \app\models\Task::findOne($conversation->task_id);

            if (!$task) {
                throw new \yii\web\NotFoundHttpException(
                    'Task not found.'
                );
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
                throw new \yii\web\ForbiddenHttpException(
                    'You are not authorized to delete mentions in this task chat.'
                );
            }
        }

        $mention = \app\models\MessageMention::findOne([
            'id' => $mentionId,
            'message_id' => $message->id,
        ]);

        if (!$mention) {
            throw new \yii\web\NotFoundHttpException(
                'Mention not found.'
            );
        }

        if (!$mention->delete()) {
            throw new \yii\web\UnprocessableEntityHttpException(
                'Unable to delete mention.'
            );
        }

        return [
            'message' => 'Mention deleted successfully.'
        ];
    }


    public function actionUploadAttachment($id)
    {
        $message = \app\models\Message::findOne($id);

        if (!$message) {
            throw new \yii\web\NotFoundHttpException('Message not found.');
        }

        $userId = Yii::$app->user->id;

        $isParticipant = \app\models\ConversationParticipant::find()
            ->where([
                'conversation_id' => $message->conversation_id,
                'user_id' => $userId,
            ])
            ->exists();

        if (!$isParticipant) {
            throw new \yii\web\ForbiddenHttpException(
                'You are not a participant in this conversation.'
            );
        }


        // Team Chat authorization
        if (
            $message->conversation->type === 'team_chat'
            && $message->conversation->channel_id !== null
        ) {
            $isChannelMember = \app\models\ChannelMembership::find()
                ->where([
                    'channel_id' => $message->conversation->channel_id,
                    'user_id' => $userId,
                    'status' => 'active',
                ])
                ->exists();

            if (!$isChannelMember) {
                throw new \yii\web\ForbiddenHttpException(
                    'You are not a member of this channel.'
                );
            }
        }

        // Task Chat authorization
        if (
            $message->conversation->type === 'task_chat'
            && $message->conversation->task_id !== null
        ) {
            $task = \app\models\Task::findOne(
                $message->conversation->task_id
            );

            if (!$task) {
                throw new \yii\web\NotFoundHttpException(
                    'Task not found.'
                );
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
                throw new \yii\web\ForbiddenHttpException(
                    'You are not authorized to upload files to this task chat.'
                );
            }
        }


        $file = UploadedFile::getInstanceByName('file');

        if (!$file) {
            throw new \yii\web\BadRequestHttpException(
                'File is required.'
            );
        }

        $uploadDir = Yii::getAlias('@runtime/uploads');

        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0775, true);
        }

        $fileName = uniqid() . '_' . $file->name;
        $filePath = $uploadDir . '/' . $fileName;

        if (!$file->saveAs($filePath)) {
            throw new \yii\web\UnprocessableEntityHttpException(
                'Unable to upload file.'
            );
        }

        $attachment = new \app\models\MessageAttachment();
        $attachment->message_id = $message->id;
        $attachment->file_name = $file->name;
        $attachment->file_path = $filePath;
        $attachment->file_type = $file->type;
        $attachment->file_size = $file->size;
        $attachment->created_at = time();

        if ($attachment->save()) {
            return $attachment;
        }

        throw new \yii\web\UnprocessableEntityHttpException(
            $attachment->getErrors()
        );
    }


    public function actionDownloadAttachment($id)
    {
        $attachment = \app\models\MessageAttachment::findOne($id);

        if (!$attachment) {
            throw new \yii\web\NotFoundHttpException(
                'Attachment not found.'
            );
        }

        $message = \app\models\Message::findOne($attachment->message_id);

        if (!$message) {
            throw new \yii\web\NotFoundHttpException(
                'Message not found.'
            );
        }

        $userId = Yii::$app->user->id;

        $isParticipant = \app\models\ConversationParticipant::find()
            ->where([
                'conversation_id' => $message->conversation_id,
                'user_id' => $userId,
            ])
            ->exists();

        if (!$isParticipant) {
            throw new \yii\web\ForbiddenHttpException(
                'You are not a participant in this conversation.'
            );
        }

        
        // Team Chat authorization
        if (
            $message->conversation->type === 'team_chat'
            && $message->conversation->channel_id !== null
        ) {
            $isChannelMember = \app\models\ChannelMembership::find()
                ->where([
                    'channel_id' => $message->conversation->channel_id,
                    'user_id' => $userId,
                    'status' => 'active',
                ])
                ->exists();

            if (!$isChannelMember) {
                throw new \yii\web\ForbiddenHttpException(
                    'You are not a member of this channel.'
                );
            }
        }

        // Task Chat authorization
        if (
            $message->conversation->type === 'task_chat'
            && $message->conversation->task_id !== null
        ) {
            $task = \app\models\Task::findOne(
                $message->conversation->task_id
            );

            if (!$task) {
                throw new \yii\web\NotFoundHttpException(
                    'Task not found.'
                );
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
                throw new \yii\web\ForbiddenHttpException(
                    'You are not authorized to download files from this task chat.'
                );
            }
        }


        if (!is_file($attachment->file_path)) {
            throw new \yii\web\NotFoundHttpException(
                'File not found.'
            );
        }

        return Yii::$app->response->sendFile(
            $attachment->file_path,
            $attachment->file_name,
            [
                'mimeType' => $attachment->file_type,
            ]
        );
    }

}
