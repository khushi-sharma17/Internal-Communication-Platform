<?php

namespace app\controllers;

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
        ];

        return $behaviors;
    }
}
