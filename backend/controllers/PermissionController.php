<?php

namespace app\controllers;

use yii\rest\ActiveController;

class PermissionController extends ActiveController
{
    public $modelClass = 'app\models\Permission';

    public $enableCsrfValidation = false;
}