<?php

namespace app\controllers;

use Yii;
use yii\rest\ActiveController;
use yii\filters\auth\HttpBearerAuth;
use yii\filters\Cors;
use yii\web\ForbiddenHttpException;
use app\components\Rbac;

class UserRoleController extends ActiveController
{
    public $modelClass = 'app\models\UserRole';
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
                    'OPTIONS'
                ],
                'Access-Control-Request-Headers' => [
                    'Authorization',
                    'Content-Type'
                ],
                'Access-Control-Allow-Credentials' => false,
            ],
        ];

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

        // OPTIONS is a CORS preflight request.
        // It must not be blocked by RBAC.
        if ($action->id === 'options') {
            return true;
        }

        $userId = Yii::$app->user->id;

        if (!Rbac::hasPermission($userId, 'manage_roles')) {
            throw new ForbiddenHttpException(
                'You do not have permission to manage user roles.'
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