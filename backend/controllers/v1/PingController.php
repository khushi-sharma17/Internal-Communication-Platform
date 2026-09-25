<?php

namespace app\controllers\v1;

use yii\rest\Controller;

class PingController extends Controller
{
    public function actionIndex()
    {
        return [
            'message' => 'API v1 is working.',
            'version' => 'v1',
        ];
    }
}