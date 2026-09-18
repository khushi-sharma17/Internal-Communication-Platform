<?php

namespace app\controllers;

use yii\rest\ActiveController;
use yii\web\ForbiddenHttpException;

class ChannelMembershipController extends ActiveController
{
    public $modelClass = 'app\models\ChannelMembership';
    public $enableCsrfValidation = false;


    public function actions()
    {
        $actions = parent::actions();

        unset($actions['create']);

        return $actions;
    }


    public function behaviors()
    {
        $behaviors = parent::behaviors();

        $behaviors['authenticator'] = [
            'class' => \yii\filters\auth\HttpBearerAuth::class,
        ];

        return $behaviors;
    }

    public function beforeAction($action)
    {
        if (!parent::beforeAction($action)) {
            return false;
        }

        $userId = \Yii::$app->user->id;

        $permission = 'view_channels';

        if (in_array($action->id, ['create', 'update', 'delete'], true)) {
            $permission = 'manage_channel_members';
        }

        if (!\app\components\Rbac::hasPermission($userId, $permission)) {
            throw new ForbiddenHttpException(
                'You do not have permission to perform this action.'
            );
        }

        return true;
    }


    public function actionCreate()
    {
        $membership = new \app\models\ChannelMembership();

        $membership->load(\Yii::$app->request->bodyParams, '');

        if (!$membership->save()) {
            \Yii::$app->response->statusCode = 422;

            return [
                'errors' => $membership->getErrors(),
            ];
        }

        // If this channel has a team_chat conversation,
        // also add the user to that conversation.
        $conversation = \app\models\Conversation::find()
            ->where([
                'channel_id' => $membership->channel_id,
                'type' => 'team_chat',
            ])
            ->one();

        if ($conversation) {
            $participant = \app\models\ConversationParticipant::findOne([
                'conversation_id' => $conversation->id,
                'user_id' => $membership->user_id,
            ]);

            if (!$participant) {
                $participant = new \app\models\ConversationParticipant();
                $participant->conversation_id = $conversation->id;
                $participant->user_id = $membership->user_id;
                $participant->joined_at = time();
                $participant->role = 'member';

                if (!$participant->save()) {
                    $membership->delete();

                    \Yii::$app->response->statusCode = 422;

                    return [
                        'errors' => $participant->getErrors(),
                    ];
                }
            }
        }

        \Yii::$app->response->statusCode = 201;

        return $membership;
    }
}