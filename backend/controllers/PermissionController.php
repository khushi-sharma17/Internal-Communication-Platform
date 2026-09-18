<?php

namespace app\controllers;

use yii\rest\ActiveController;

class PermissionController extends ActiveController
{
    public $modelClass = 'app\models\Permission';

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

    public function actionMine()
    {
        $userId = \Yii::$app->user->id;

        $permissions = \app\models\Permission::find()
            ->joinWith('roles')
            ->joinWith('roles.userRoles')
            ->where(['user_roles.user_id' => $userId])
            ->all();

        return $permissions;
    }
}