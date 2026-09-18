<?php

namespace app\controllers;

use Yii;
use yii\rest\ActiveController;
use yii\filters\auth\HttpBearerAuth;
use yii\filters\Cors;

class RoleController extends ActiveController
{
    public $modelClass = 'app\models\Role';

    public function actions()
    {
        $actions = parent::actions();

        $actions['index']['prepareDataProvider'] = function ($action) {
            return new \yii\data\ActiveDataProvider([
                'query' => \app\models\Role::find()->with('permissions'),
            ]);
        };

        return $actions;
    }


    
    public $enableCsrfValidation = false;

    public function behaviors()
    {
        $behaviors = parent::behaviors();

        $behaviors['corsFilter'] = [
            'class' => Cors::class,
            'cors' => [
                'Origin' => ['http://localhost:5173'],
                'Access-Control-Request-Method' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
                'Access-Control-Request-Headers' => ['Authorization', 'Content-Type'],
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
}