<?php

namespace app\controllers;

use app\components\AuditLogger;
use yii\rest\ActiveController;

use yii\web\ForbiddenHttpException;


class TeamMembershipController extends ActiveController
{
    public $modelClass = 'app\models\TeamMembership';

    public $enableCsrfValidation = false;
    private $oldMembershipStatus;

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

        if (in_array($action->id, ['update', 'patch'], true)) {
            $membershipId = \Yii::$app->request->get('id');
            $membership = \app\models\TeamMembership::findOne($membershipId);

            if ($membership) {
                $this->oldMembershipStatus = $membership->status;
            }
        }

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



    public function afterAction($action, $result)
    {
        if (
            $action->id === 'create' &&
            $result instanceof \app\models\TeamMembership &&
            !$result->getIsNewRecord() &&
            (int) $result->id > 0
        ) {
            AuditLogger::log(
                'team_membership',
                (int) $result->id,
                'created',
                null,
                [
                    'team_id' => $result->team_id,
                    'user_id' => $result->user_id,
                    'status' => $result->status,
                ]
            );
        }

        if (
            in_array($action->id, ['update', 'patch'], true) &&
            $result instanceof \app\models\TeamMembership &&
            $this->oldMembershipStatus !== $result->status
        ) {
            AuditLogger::log(
                'team_membership',
                (int) $result->id,
                'status_changed',
                [
                    'status' => $this->oldMembershipStatus,
                ],
                [
                    'status' => $result->status,
                ]
            );
        }

        return parent::afterAction($action, $result);
    }
}