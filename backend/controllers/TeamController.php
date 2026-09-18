<?php

namespace app\controllers;

use yii\rest\ActiveController;
use yii\web\ForbiddenHttpException;

class TeamController extends ActiveController
{
    public $modelClass = 'app\models\Team';

    public $enableCsrfValidation = false;


    public function actions()
    {
        $actions = parent::actions();

        // Use our custom create action instead of Yii's default CreateAction
        unset($actions['create']);

        return $actions;
    }


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

        // Allow CORS preflight requests without authentication/RBAC checks
        if (\Yii::$app->request->isOptions) {
            return true;
        }

        $userId = \Yii::$app->user->id;

        // ... keep everything else exactly as it is

        $permission = 'view_channels';

        // Management actions
        if (in_array($action->id, ['create', 'update', 'delete'], true)) {
            $permission = 'manage_channels';
        }

        // Check RBAC permission
        if (!\app\components\Rbac::hasPermission($userId, $permission)) {
            throw new ForbiddenHttpException(
                'You do not have permission to perform this action.'
            );
        }

        // Private team access
        if (in_array($action->id, ['view', 'members'], true)) {

            $teamId = \Yii::$app->request->get('id');

            $team = \app\models\Team::findOne($teamId);

            if (!$team) {
                return true;
            }

            if ($team->visibility === 'private') {

                $isMember = \app\models\TeamMembership::find()
                    ->where([
                        'team_id' => $team->id,
                        'user_id' => $userId,
                        'status' => 'active',
                    ])
                    ->exists();

                if (!$isMember) {
                    throw new ForbiddenHttpException(
                        'You are not a member of this private team.'
                    );
                }
            }
        }

        return true;
    }


    public function actionCreate()
    {
        $team = new \app\models\Team();

        $request = \Yii::$app->request;
        $team->load($request->bodyParams, '');

        // Set the authenticated user as the team owner
        $team->owner_id = \Yii::$app->user->id;

        // Set creation timestamp
        $team->created_at = time();

        if (!$team->save()) {
            \Yii::$app->response->statusCode = 422;

            return [
                'errors' => $team->getErrors(),
            ];
        }

        // Automatically make the creator an active team member
        $membership = new \app\models\TeamMembership();

        $membership->team_id = $team->id;
        $membership->user_id = \Yii::$app->user->id;
        $membership->joined_at = time();
        $membership->status = 'active';

        if (!$membership->save()) {
            // Remove the team if membership creation fails
            $team->delete();

            \Yii::$app->response->statusCode = 422;

            return [
                'errors' => $membership->getErrors(),
            ];
        }

        \Yii::$app->response->statusCode = 201;

        return $team;
    }


    public function actionMembers($id)
    {
        $team = \app\models\Team::findOne($id);

        if (!$team) {
            throw new \yii\web\NotFoundHttpException('Team not found.');
        }

        $memberships = \app\models\TeamMembership::find()
            ->where([
                'team_id' => $team->id,
                'status' => 'active',
            ])
            ->with('user')
            ->all();

        return array_map(function ($membership) {
            $user = $membership->user;

            return [
                'membership_id' => $membership->id,
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'status' => $user->status,
                'manager_id' => $user->manager_id,
                'avatar_path' => $user->avatar_path,
                'role_id' => $membership->role_id,
                'reports_to_user_id' => $membership->reports_to_user_id,
            ];
        }, $memberships);
    }



    public function actionChannels($id)
    {
        $team = \app\models\Team::findOne($id);

        if (!$team) {
            throw new \yii\web\NotFoundHttpException('Team not found.');
        }

        return \app\models\Channel::find()
            ->where(['team_id' => $team->id])
            ->all();
    }
}