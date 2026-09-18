<?php

namespace app\controllers;

use yii\rest\ActiveController;
use yii\web\ForbiddenHttpException;

class TeamMembershipController extends ActiveController
{
    public $modelClass = 'app\models\TeamMembership';

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

        // Allow CORS preflight requests
        if (\Yii::$app->request->isOptions) {
            return true;
        }

        $userId = \Yii::$app->user->id;

        $permission = 'view_channels';

        if (in_array($action->id, ['create', 'update', 'delete'], true)) {
            $permission = 'manage_channel_members';
        }

        if (!\app\components\Rbac::hasPermission($userId, $permission)) {
            throw new ForbiddenHttpException(
                'You do not have permission to perform this action.'
            );
        }

        return true;
    }
}