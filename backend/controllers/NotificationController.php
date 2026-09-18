<?php

namespace app\controllers;

use Yii;
use app\models\Notification;
use yii\rest\Controller;
use yii\filters\auth\HttpBearerAuth;
use yii\filters\Cors;

class NotificationController extends Controller
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
                    'PATCH',
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

    public function actionIndex()
    {
        $userId = Yii::$app->user->id;

        return Notification::find()
            ->where(['user_id' => $userId])
            ->orderBy(['created_at' => SORT_DESC])
            ->all();
    }

    public function actionCreate()
    {
        $userId = Yii::$app->user->id;
        $data = Yii::$app->request->bodyParams;

        $notification = new Notification();

        $notification->user_id = $userId;
        $notification->type = $data['type'] ?? null;
        $notification->message_id = $data['message_id'] ?? null;
        $notification->content = $data['content'] ?? null;
        $notification->is_read = 0;
        $notification->created_at = time();

        if (!$notification->validate()) {
            Yii::$app->response->statusCode = 422;

            return [
                'error' => 'Invalid notification',
                'details' => $notification->errors,
            ];
        }

        if (!$notification->save()) {
            Yii::$app->response->statusCode = 422;

            return [
                'error' => 'Unable to create notification',
                'details' => $notification->errors,
            ];
        }

        return $notification;
    }

    public function actionMarkRead($id)
    {
        $userId = Yii::$app->user->id;

        $notification = Notification::findOne([
            'id' => $id,
            'user_id' => $userId,
        ]);

        if (!$notification) {
            Yii::$app->response->statusCode = 404;

            return [
                'error' => 'Notification not found'
            ];
        }

        $notification->is_read = 1;

        if (!$notification->save()) {
            Yii::$app->response->statusCode = 422;

            return [
                'error' => 'Unable to mark notification as read',
                'details' => $notification->errors,
            ];
        }

        return $notification;
    }
}