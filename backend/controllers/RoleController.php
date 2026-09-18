<?php

namespace app\controllers;

use Yii;
use yii\rest\ActiveController;
use yii\filters\auth\HttpBearerAuth;
use yii\filters\Cors;
use app\components\Rbac;
use yii\web\ForbiddenHttpException;

class RoleController extends ActiveController
{
    public $modelClass = 'app\models\Role';

    public $enableCsrfValidation = false;

    public function actions()
    {
        $actions = parent::actions();

        // Include permissions when listing roles
        $actions['index']['prepareDataProvider'] = function ($action) {
            return new \yii\data\ActiveDataProvider([
                'query' => \app\models\Role::find()->with('permissions'),
            ]);
        };

        // We will handle role creation ourselves
        unset($actions['create']);

        return $actions;
    }

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

        $userId = Yii::$app->user->id;

        if (!Rbac::hasPermission($userId, 'manage_roles')) {
            throw new ForbiddenHttpException(
                'You do not have permission to manage roles.'
            );
        }

        return true;
    }



    public function actionOptions()
    {
        Yii::$app->response->statusCode = 200;
        return [];
    }

    public function actionCreate()
    {
        $request = Yii::$app->request;
        $data = $request->bodyParams;

        $role = new \app\models\Role();

        $role->name = $data['name'] ?? null;
        $role->description = $data['description'] ?? null;
        $role->created_at = time();

        if (!$role->save()) {
            Yii::$app->response->statusCode = 422;

            return [
                'errors' => $role->getErrors()
            ];
        }

        // Permission IDs sent by the frontend
        $permissionIds = $data['permission_ids'] ?? [];

        foreach ($permissionIds as $permissionId) {
            $rolePermission = new \app\models\RolePermission();

            $rolePermission->role_id = $role->id;
            $rolePermission->permission_id = $permissionId;
            $rolePermission->created_at = time();

            if (!$rolePermission->save()) {
                // Remove the role if permission mapping fails
                $role->delete();

                Yii::$app->response->statusCode = 422;

                return [
                    'errors' => $rolePermission->getErrors()
                ];
            }
        }

        Yii::$app->response->statusCode = 201;

        return \app\models\Role::find()
            ->where(['id' => $role->id])
            ->with('permissions')
            ->one();
    }
}