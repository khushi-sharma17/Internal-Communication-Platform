<?php

namespace app\controllers;

use app\models\Meeting;
use app\components\AuditLogger;
use yii\filters\auth\HttpBearerAuth;
use yii\rest\ActiveController;

class MeetingController extends ActiveController
{
    public $modelClass = Meeting::class;

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
        unset($actions['create']);
        unset($actions['update']);

        // unset($actions['create']);

        $actions['index']['prepareDataProvider'] = function () {
            return new \yii\data\ActiveDataProvider([
                'query' => Meeting::find(),
            ]);
        };

        return $actions;
    }

    public function actionCreate()
    {
        $model = new Meeting();

        $model->load(\Yii::$app->request->bodyParams, '');

        $model->created_by = \Yii::$app->user->id;

        // Set timestamps
        $model->created_at = time();
        $model->updated_at = time();

        // Convert boolean JSON value to integer for MySQL
        $model->is_recurring = $model->is_recurring ? 1 : 0;

        if ($model->save()) {
            AuditLogger::log(
                'meeting',
                (int) $model->id,
                'created',
                null,
                [
                    'title' => $model->title,
                    'created_by' => $model->created_by,
                    'is_recurring' => $model->is_recurring,
                ]
            );

            \Yii::$app->response->statusCode = 201;
            return $model;
        }

        \Yii::$app->response->statusCode = 422;
        return $model->getErrors();
    }



    public function actionUpdate($id)
    {
        $model = Meeting::findOne($id);

        if ($model === null) {
            throw new \yii\web\NotFoundHttpException('Meeting not found.');
        }

        $model->load(\Yii::$app->request->bodyParams, '');

        // Update timestamp
        $model->updated_at = time();

        // Convert boolean JSON value to integer for MySQL
        $model->is_recurring = $model->is_recurring ? 1 : 0;

        if ($model->save()) {
            AuditLogger::log(
                'meeting',
                (int) $model->id,
                'updated',
                null,
                [
                    'title' => $model->title,
                    'created_by' => $model->created_by,
                    'is_recurring' => $model->is_recurring,
                    'updated_at' => $model->updated_at,
                ]
            );

            return $model;
        }

        \Yii::$app->response->statusCode = 422;
        return $model->getErrors();
    }
}