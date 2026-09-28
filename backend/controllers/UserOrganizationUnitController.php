<?php

namespace app\controllers;

use Yii;
use yii\rest\ActiveController;
use yii\filters\auth\HttpBearerAuth;
use yii\web\ForbiddenHttpException;
use app\components\Rbac;

class UserOrganizationUnitController extends ActiveController
{
    public $modelClass = 'app\models\UserOrganizationUnit';

    public $enableCsrfValidation = false;

    public function behaviors()
    {
        $behaviors = parent::behaviors();

        $behaviors['authenticator'] = [
            'class' => HttpBearerAuth::class,
            'except' => ['options'],
        ];

        return $behaviors;
    }

    public function beforeAction($action)
    {
        if (!parent::beforeAction($action)) {
            return false;
        }

        if ($action->id === 'options') {
            return true;
        }

        if (
            in_array(
                $action->id,
                ['create', 'update', 'delete'],
                true
            ) &&
            !Rbac::hasPermission(
                Yii::$app->user->id,
                'manage_users'
            )
        ) {
            throw new ForbiddenHttpException(
                'You do not have permission to manage user organization assignments.'
            );
        }

        return true;
    }

    public function actionOptions()
    {
        Yii::$app->response->statusCode = 200;
        return [];
    }
}