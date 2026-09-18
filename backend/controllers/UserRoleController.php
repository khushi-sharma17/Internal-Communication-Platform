<?php

namespace app\controllers;

use yii\rest\ActiveController;

class UserRoleController extends ActiveController
{
    public $modelClass = 'app\models\UserRole';

    public $enableCsrfValidation = false;
}