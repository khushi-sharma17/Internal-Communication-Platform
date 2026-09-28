<?php

namespace app\controllers;

use Yii;
use app\models\TaskActivity;
use yii\rest\ActiveController;

class TaskActivityController extends ActiveController
{
    public $modelClass = 'app\models\TaskActivity';

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


    public function actionOptions()
    {
        Yii::$app->response->statusCode = 200;
        return '';
    }


    public function beforeAction($action)
    {
        if (!parent::beforeAction($action)) {
            return false;
        }

        // Allow CORS preflight requests without authentication
        if (Yii::$app->request->isOptions) {
            return true;
        }

        return true;
    }


    public function actions()
    {
        $actions = parent::actions();

        // Replace Yii's default REST actions
        unset($actions['create']);
        unset($actions['index']);

        return $actions;
    }

    public function actionIndex()
    {
        $query = TaskActivity::find();

        $taskId = Yii::$app->request->get('task_id');

        if ($taskId !== null) {
            $query->andWhere(['task_id' => $taskId]);
        }

        return $query->all();
    }

    public function actionCreate()
    {
        $model = new TaskActivity();

        $model->load(Yii::$app->request->bodyParams, '');

        // NEVER trust user_id from the request
        $model->user_id = Yii::$app->user->id;

        if (!$model->save()) {
            Yii::$app->response->statusCode = 422;

            return $model->getErrors();
        }

        Yii::$app->response->statusCode = 201;

        return $model;
    }


    public function actionClear($taskId)
    {
        $task = \app\models\Task::findOne($taskId);

        if (!$task) {
            throw new \yii\web\NotFoundHttpException(
                'Task not found.'
            );
        }

        $userId = (int) Yii::$app->user->id;

        // Only the task creator can clear its activity history.
        if ((int) $task->created_by !== $userId) {
            throw new \yii\web\ForbiddenHttpException(
                'Only the task creator can clear activity history.'
            );
        }

        TaskActivity::deleteAll([
            'task_id' => $taskId,
        ]);

        Yii::$app->response->statusCode = 204;

        return '';
    }
}