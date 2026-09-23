<?php

namespace app\controllers;

use app\models\MeetingParticipant;
use yii\filters\auth\HttpBearerAuth;
use yii\rest\ActiveController;
use app\models\Notification;

class MeetingParticipantController extends ActiveController
{
    public $modelClass = MeetingParticipant::class;

    public function behaviors()
    {
        $behaviors = parent::behaviors();

        $behaviors['authenticator'] = [
            'class' => HttpBearerAuth::class,
            'except' => ['options'],
        ];

        return $behaviors;
    }

    public function actions()
    {
        $actions = parent::actions();

        $actions['index']['prepareDataProvider'] = function () {
            return new \yii\data\ActiveDataProvider([
                'query' => MeetingParticipant::find(),
            ]);
        };

        unset($actions['create']);
        unset($actions['update']);

        return $actions;
    }




    public function actionCreate()
    {
        $model = new MeetingParticipant();

        $model->load(\Yii::$app->request->bodyParams, '');

        // Set timestamps
        $model->created_at = time();
        $model->updated_at = time();

        // Convert boolean JSON value to integer for MySQL
        $model->attended = $model->attended ? 1 : 0;

        if ($model->save()) {

            // Create notification for the invited participant
            $notification = new Notification();

            $notification->user_id = $model->user_id;
            $notification->type = 'meeting';
            $notification->message_id = null;

            $meeting = $model->meeting;

            $notification->content =
                'You have been invited to "' . $meeting->title . '"';

            $notification->is_read = 0;
            $notification->created_at = time();

            $notification->save();

            \Yii::$app->response->statusCode = 201;

            return $model;
        }

        \Yii::$app->response->statusCode = 422;

        return $model->getErrors();
    }


    

    public function actionUpdate($id)
    {
        $model = MeetingParticipant::findOne($id);

        if ($model === null) {
            throw new \yii\web\NotFoundHttpException(
                'Meeting participant not found.'
            );
        }

        $currentUserId = \Yii::$app->user->id;

        // Allow the participant to update their own response.
        $isOwnParticipant = (int) $model->user_id === (int) $currentUserId;

        // Allow the meeting creator to manage participant responses.
        $isMeetingCreator = (int) $model->meeting->created_by === (int) $currentUserId;

        if (!$isOwnParticipant && !$isMeetingCreator) {
            throw new \yii\web\ForbiddenHttpException(
                'You are not allowed to update this participant.'
            );
        }

        $model->load(\Yii::$app->request->bodyParams, '');

        // Convert boolean JSON value to integer for MySQL
        $model->attended = $model->attended ? 1 : 0;

        // Update timestamp
        $model->updated_at = time();

        if ($model->save()) {
            return $model;
        }

        \Yii::$app->response->statusCode = 422;
        return $model->getErrors();
    }
}