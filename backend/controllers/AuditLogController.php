<?php

namespace app\controllers;

use app\models\AuditLog;
use yii\filters\auth\HttpBearerAuth;
use yii\filters\Cors;
use yii\filters\VerbFilter;
use yii\rest\ActiveController;
use Yii;

class AuditLogController extends ActiveController
{
    public $modelClass = AuditLog::class;

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
            ],
        ];

        $behaviors['authenticator'] = [
            'class' => HttpBearerAuth::class,
            'except' => ['options'],
        ];

        $behaviors['verbs'] = [
            'class' => VerbFilter::class,
            'actions' => [
                'index' => ['GET'],
                'view' => ['GET'],
            ],
        ];

        return $behaviors;
    }

    public function actions()
    {
        $actions = parent::actions();

        unset(
            $actions['index'],
            $actions['create'],
            $actions['update'],
            $actions['delete']
        );

        return $actions;
    }



    public function actionIndex()
    {
        return AuditLog::find()
            ->orderBy(['id' => SORT_DESC])
            ->limit(5)
            ->all();
    }



    public function actionOptions()
    {
        Yii::$app->response->statusCode = 200;
        return [];
    }
}