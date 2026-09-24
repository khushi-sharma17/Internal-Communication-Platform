<?php

namespace app\controllers;

use app\components\AuditLogger;
use app\models\RolePermission;
use yii\filters\auth\HttpBearerAuth;
use yii\rest\ActiveController;

class RolePermissionController extends ActiveController
{
    public $modelClass = 'app\models\RolePermission';
    public $enableCsrfValidation = false;
    private $oldRolePermission;

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

        if ($action->id === 'delete') {
            $id = \Yii::$app->request->get('id');
            $permission = RolePermission::findOne($id);

            if ($permission) {
                $this->oldRolePermission = [
                    'role_id' => $permission->role_id,
                    'permission_id' => $permission->permission_id,
                ];
            }
        }

        return true;
    }



    public function afterAction($action, $result)
    {
        if (
            $action->id === 'create' &&
            $result instanceof RolePermission &&
            !$result->getIsNewRecord() &&
            (int) $result->id > 0
        ) {
            AuditLogger::log(
                'role_permission',
                (int) $result->id,
                'permission_added',
                null,
                [
                    'role_id' => $result->role_id,
                    'permission_id' => $result->permission_id,
                ]
            );
        }

        if (
            $action->id === 'delete' &&
            is_array($this->oldRolePermission)
        ) {
            AuditLogger::log(
                'role_permission',
                null,
                'permission_removed',
                $this->oldRolePermission,
                null
            );
        }

        return parent::afterAction($action, $result);
    }
}