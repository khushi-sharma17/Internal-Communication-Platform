<?php

namespace app\controllers;

use Yii;
use app\models\User;
use yii\rest\Controller;
use yii\filters\auth\HttpBearerAuth;
use yii\filters\Cors;

class UserController extends Controller
{
    public function behaviors()
    {
        $behaviors = parent::behaviors();

        $behaviors['corsFilter'] = [
            'class' => Cors::class,
            'cors' => [
                'Origin' => ['http://localhost:5173'],
                'Access-Control-Request-Method' => [
                    'GET',
                    'PUT',
                    'OPTIONS',
                ],
                'Access-Control-Request-Headers' => [
                    'Authorization',
                    'Content-Type',
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

    public function actionOptions()
    {
        Yii::$app->response->statusCode = 200;
        return [];
    }

    public function actionIndex()
    {
        return User::find()
            ->with(['organizationUnits', 'roles'])
            ->select([
                'id',
                'name',
                'email',
                'manager_id',
            ])
            ->asArray()
            ->all();
    }

    public function actionUpdate($id)
    {
        $user = User::findOne($id);

        if (!$user) {
            Yii::$app->response->statusCode = 404;

            return [
                'message' => 'User not found.',
            ];
        }

        $data = json_decode(
            Yii::$app->request->getRawBody(),
            true
        );

        if (!is_array($data)) {
            Yii::$app->response->statusCode = 400;

            return [
                'message' => 'Invalid JSON request body.',
            ];
        }

        if (array_key_exists('manager_id', $data)) {
            $managerId = $data['manager_id'];

            if ($managerId === null || $managerId === '') {
                $user->manager_id = null;
            } else {
                $managerId = (int) $managerId;

                if ($managerId === (int) $user->id) {
                    Yii::$app->response->statusCode = 422;

                    return [
                        'message' => 'A user cannot report to themselves.',
                    ];
                }

                $manager = User::findOne($managerId);

                if (!$manager) {
                    Yii::$app->response->statusCode = 422;

                    return [
                        'message' => 'Selected manager does not exist.',
                    ];
                }

                $user->manager_id = $managerId;
            }
        }

        if (!$user->save()) {
            Yii::$app->response->statusCode = 422;

            return [
                'message' => 'Unable to update reporting relationship.',
                'errors' => $user->getErrors(),
            ];
        }

        return [
            'message' => 'Reporting relationship updated successfully.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'manager_id' => $user->manager_id,
            ],
        ];
    }
}