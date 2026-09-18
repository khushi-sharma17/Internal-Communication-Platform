<?php

namespace app\controllers;

use yii\rest\ActiveController;

class RolePermissionController extends ActiveController
{
    public $modelClass = 'app\models\RolePermission';

    public $enableCsrfValidation = false;
}