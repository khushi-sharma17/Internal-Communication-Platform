<?php

namespace app\controllers;

use app\models\TaskActivity;
use yii\rest\ActiveController;

class TaskAssignmentController extends ActiveController
{
    public $modelClass = 'app\models\TaskAssignment';

    public $enableCsrfValidation = false;

    public function behaviors()
    {
        $behaviors = parent::behaviors();

        $behaviors['authenticator'] = [
            'class' => \yii\filters\auth\HttpBearerAuth::class,
        ];

        return $behaviors;
    }

    public function afterAction($action, $result)
    {
        if ($action->id === 'create' && $result instanceof \app\models\TaskAssignment) {
            $details = [];

            if ($result->team_id !== null) {
                $details[] = 'Team assigned: ' . $result->team_id;
            }

            if ($result->user_id !== null) {
                $details[] = 'User assigned: ' . $result->user_id;
            }

            $activity = new TaskActivity();
            $activity->task_id = $result->task_id;
            $activity->user_id = \Yii::$app->user->id;
            $activity->action = 'assignment';
            $activity->details = implode(', ', $details);
            $activity->created_at = time();
            $activity->save(false);
        }

        return parent::afterAction($action, $result);
    }
}