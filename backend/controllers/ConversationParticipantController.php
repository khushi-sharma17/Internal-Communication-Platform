<?php

namespace app\controllers;

use yii\rest\ActiveController;
use yii\filters\Cors;

class ConversationParticipantController extends ActiveController
{
    public $modelClass = 'app\models\ConversationParticipant';

    public $enableCsrfValidation = false;

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
                    'PUT',
                    'PATCH',
                    'DELETE',
                    'OPTIONS',
                ],
                'Access-Control-Request-Headers' => [
                    'Authorization',
                    'Content-Type',
                ],
                'Access-Control-Allow-Credentials' => false,
                'Access-Control-Max-Age' => 86400,
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

        // Disable Yii's default index action
        // so we can properly filter by conversation_id.
        unset($actions['index']);

        return $actions;
    }

    public function actionIndex()
    {
        $conversationId = \Yii::$app->request->get('conversation_id');

        if (!$conversationId) {
            \Yii::$app->response->statusCode = 422;

            return [
                'message' => 'conversation_id is required.'
            ];
        }

        return \app\models\ConversationParticipant::find()
            ->where([
                'conversation_id' => $conversationId,
            ])
            ->all();
    }
}