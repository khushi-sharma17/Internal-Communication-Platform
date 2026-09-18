<?php

namespace app\controllers;

use yii\rest\ActiveController;
use yii\web\ForbiddenHttpException;

class ChannelController extends ActiveController
{
    public $modelClass = 'app\models\Channel';

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

        $actions['index']['prepareDataProvider'] = function ($action) {

            $userId = \Yii::$app->user->id;

            return new \yii\data\ActiveDataProvider([
                'query' => \app\models\Channel::find()
                    ->leftJoin(
                        'channel_memberships cm',
                        'cm.channel_id = channels.id
                        AND cm.user_id = :userId
                        AND cm.status = "active"',
                        [':userId' => $userId]
                    )
                    ->andWhere([
                        'or',
                        ['channels.visibility' => 'public'],
                        [
                            'and',
                            ['channels.visibility' => 'private'],
                            ['is not', 'cm.id', null],
                        ],
                    ]),
            ]);
        };

        return $actions;
    }




    public function actionCreate()
    {
        $transaction = \Yii::$app->db->beginTransaction();

        try {
            $channel = new \app\models\Channel();

            $channel->load(\Yii::$app->request->bodyParams, '');

            $channel->created_by = \Yii::$app->user->id;

            if (!$channel->created_at) {
                $channel->created_at = time();
            }

            if (!$channel->save()) {
                \Yii::$app->response->statusCode = 422;
                return ['errors' => $channel->getErrors()];
            }

            // Add the creator as an active channel member
            $membership = new \app\models\ChannelMembership();
            $membership->channel_id = $channel->id;
            $membership->user_id = \Yii::$app->user->id;
            $membership->joined_at = time();
            $membership->status = 'active';

            if (!$membership->save()) {
                throw new \Exception(
                    'Failed to create channel membership: ' .
                    json_encode($membership->getErrors())
                );
            }

            // Team channels get their own team_chat conversation
            if ($channel->type === 'team') {
                $conversation = new \app\models\Conversation();

                $conversation->type = 'team_chat';
                $conversation->team_id = $channel->team_id;
                $conversation->channel_id = $channel->id;
                $conversation->created_by = \Yii::$app->user->id;
                $conversation->created_at = time();
                $conversation->visibility = $channel->visibility;

                if (!$conversation->save()) {
                    throw new \Exception(
                        'Failed to create conversation: ' .
                        json_encode($conversation->getErrors())
                    );
                }

                // Add the creator as a conversation participant
                $participant = new \app\models\ConversationParticipant();
                $participant->conversation_id = $conversation->id;
                $participant->user_id = \Yii::$app->user->id;
                $participant->joined_at = time();
                $participant->role = 'member';

                if (!$participant->save()) {
                    throw new \Exception(
                        'Failed to create conversation participant: ' .
                        json_encode($participant->getErrors())
                    );
                }
            }

            $transaction->commit();

            \Yii::$app->response->statusCode = 201;

            return $channel;

        } catch (\Throwable $e) {

            $transaction->rollBack();

            \Yii::$app->response->statusCode = 422;

            return [
                'message' => $e->getMessage(),
            ];
        }
    }



    public function beforeAction($action)
    {
        if (!parent::beforeAction($action)) {
            return false;
        }

        // Allow CORS preflight requests without authentication/RBAC checks
        if (\Yii::$app->request->isOptions) {
            return true;
        }

        $userId = \Yii::$app->user->id;

        // Management actions require manage_channels permission
        if (in_array($action->id, ['create', 'update', 'delete'], true)) {

            if (!\app\components\Rbac::hasPermission(
                $userId,
                'manage_channels'
            )) {
                throw new ForbiddenHttpException(
                    'You do not have permission to perform this action.'
                );
            }

            return true;
        }

        // Viewing channels requires view_channels permission
        if (!\app\components\Rbac::hasPermission(
            $userId,
            'view_channels'
        )) {
            throw new ForbiddenHttpException(
                'You do not have permission to perform this action.'
            );
        }

        // For individual channel access, check private-channel membership
        if ($action->id === 'view') {

            $channelId = \Yii::$app->request->get('id');

            $channel = \app\models\Channel::findOne($channelId);

            if (!$channel) {
                return true;
            }

            // Private channels require membership
            if ($channel->visibility === 'private') {

                $isMember = \app\models\ChannelMembership::find()
                    ->where([
                        'channel_id' => $channel->id,
                        'user_id' => $userId,
                        'status' => 'active',
                    ])
                    ->exists();

                if (!$isMember) {
                    throw new ForbiddenHttpException(
                        'You are not a member of this private channel.'
                    );
                }
            }
        }

        return true;
    }



    public function prepareDataProvider()
    {
        $userId = \Yii::$app->user->id;

        return new \yii\data\ActiveDataProvider([
            'query' => \app\models\Channel::find()
                ->leftJoin(
                    'channel_memberships cm',
                    'cm.channel_id = channels.id
                    AND cm.user_id = :userId
                    AND cm.status = "active"',
                    [':userId' => $userId]
                )
                ->andWhere([
                    'or',
                    ['channels.visibility' => 'public'],
                    ['and',
                        ['channels.visibility' => 'private'],
                        ['is not', 'cm.id', null],
                    ],
                ]),
        ]);
    }
}