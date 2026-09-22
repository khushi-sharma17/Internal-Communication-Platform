<?php

namespace app\controllers;

use app\models\TaskActivity;
use app\models\TaskDependency;
use Yii;
use yii\rest\ActiveController;

class TaskDependencyController extends ActiveController
{
    public $modelClass = TaskDependency::class;

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

        // Allow CORS preflight requests without authentication
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



    public function actions()
    {
        $actions = parent::actions();

        unset($actions['delete']);

        return $actions;
    }

    public function actionDelete($id)
    {
        $dependency = TaskDependency::findOne($id);

        if (!$dependency) {
            throw new \yii\web\NotFoundHttpException('Dependency not found.');
        }

        $taskId = $dependency->task_id;
        $dependsOnTaskId = $dependency->depends_on_task_id;

        if (!$dependency->delete()) {
            throw new \yii\web\ServerErrorHttpException(
                'Failed to delete dependency.'
            );
        }

        $activity = new TaskActivity();
        $activity->task_id = $taskId;
        $activity->user_id = Yii::$app->user->id;
        $activity->action = 'dependency_removed';
        $activity->details =
            'Dependency removed: Task ' . $taskId .
            ' no longer depends on Task ' . $dependsOnTaskId;
        $activity->created_at = time();
        $activity->save(false);

        Yii::$app->response->statusCode = 204;

        return null;
    }

    public function afterAction($action, $result)
    {
        if ($action->id === 'create' && $result instanceof TaskDependency) {
            $activity = new TaskActivity();
            $activity->task_id = $result->task_id;
            $activity->user_id = Yii::$app->user->id;
            $activity->action = 'dependency_added';
            $activity->details =
                'Dependency added: Task ' . $result->task_id .
                ' depends on Task ' . $result->depends_on_task_id;
            $activity->created_at = time();
            $activity->save(false);
        }

        return parent::afterAction($action, $result);
    }
}