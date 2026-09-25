<?php

namespace app\controllers;

use app\models\User;
use Yii;
use yii\rest\Controller;

class AuthController extends Controller
{
    public $enableCsrfValidation = false;



    public function behaviors()
    {
        $behaviors = parent::behaviors();

        $behaviors['corsFilter'] = [
            'class' => \yii\filters\Cors::class,
            'cors' => [
                'Origin' => ['http://localhost:5173'],
                'Access-Control-Request-Method' => ['POST', 'OPTIONS'],
                'Access-Control-Request-Headers' => ['Content-Type', 'Authorization'],
                'Access-Control-Allow-Credentials' => true,
            ],
        ];

        return $behaviors;
    }

    public function beforeAction($action)
    {
        if (\Yii::$app->request->isOptions) {
            \Yii::$app->response->statusCode = 200;
            return false;
        }

        return parent::beforeAction($action);
    }



    public function actionSignup()
    {
        $data = json_decode(Yii::$app->request->getRawBody(), true);

        if (!is_array($data)) {
            Yii::$app->response->statusCode = 400;

            return [
                'message' => 'Invalid JSON request body.',
            ];
        }

        $name = trim($data['name'] ?? '');
        $email = trim($data['email'] ?? '');
        $password = $data['password'] ?? '';

        if ($name === '' || $email === '' || $password === '') {
            Yii::$app->response->statusCode = 422;

            return [
                'message' => 'Name, email, and password are required.',
            ];
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Yii::$app->response->statusCode = 422;

            return [
                'message' => 'Please provide a valid email address.',
            ];
        }

        if (strlen($password) < 8) {
            Yii::$app->response->statusCode = 422;

            return [
                'message' => 'Password must be at least 8 characters long.',
            ];
        }

        if (User::find()->where(['email' => $email])->exists()) {
            Yii::$app->response->statusCode = 409;

            return [
                'message' => 'An account with this email already exists.',
            ];
        }

        $user = new User();
        $user->name = $name;
        $user->email = $email;
        $user->password_hash = Yii::$app->security->generatePasswordHash($password);
        $user->status = 'active';
        $user->created_at = time();
        $user->updated_at = time();

        if (!$user->save()) {
            Yii::$app->response->statusCode = 422;

            return [
                'message' => 'Unable to create account.',
                'errors' => $user->getErrors(),
            ];
        }

        Yii::$app->response->statusCode = 201;

        return [
            'message' => 'Account created successfully.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
        ];
    }

    public function actionLogin()
    {
        $data = json_decode(Yii::$app->request->getRawBody(), true);

        if (!is_array($data)) {
            Yii::$app->response->statusCode = 400;

            return [
                'message' => 'Invalid JSON request body.',
            ];
        }

        $email = trim($data['email'] ?? '');
        $password = $data['password'] ?? '';

        if ($email === '' || $password === '') {
            Yii::$app->response->statusCode = 422;

            return [
                'message' => 'Email and password are required.',
            ];
        }

        $user = User::findOne(['email' => $email]);

        if (
            !$user ||
            !Yii::$app->security->validatePassword(
                $password,
                $user->password_hash
            )
        ) {
            Yii::$app->response->statusCode = 401;

            return [
                'message' => 'Invalid email or password.',
            ];
        }

        $user->auth_token = Yii::$app->security->generateRandomString(64);
        $user->last_seen_at = time();
        $user->updated_at = time();

        if (!$user->save(false)) {
            Yii::$app->response->statusCode = 500;

            return [
                'message' => 'Unable to complete login.',
            ];
        }

        return [
            'message' => 'Login successful.',
            'token' => $user->auth_token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
        ];
    }

    public function actionLogout()
    {
        $user = Yii::$app->user->identity;

        if ($user) {
            $user->auth_token = null;
            $user->updated_at = time();
            $user->save(false);
        }

        return [
            'message' => 'Logout successful.',
        ];
    }
}