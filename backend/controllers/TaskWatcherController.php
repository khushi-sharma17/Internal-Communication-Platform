<?php

namespace app\controllers;

use Yii;
use yii\rest\ActiveController;

class TaskWatcherController extends ActiveController
{
    public $modelClass = 'app\models\TaskWatcher';

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

    public function beforeAction($action)
    {
        if (!parent::beforeAction($action)) {
            return false;
        }

        // Allow browser CORS preflight requests
        if (Yii::$app->request->isOptions) {
            return true;
        }

        return true;
    }

    public function actionOptions()
    {
        Yii::$app->response->statusCode = 200;
        return '';
    }
}