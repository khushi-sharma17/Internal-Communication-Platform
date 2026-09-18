<?php

namespace app\controllers;

use yii\rest\ActiveController;

class UserOrganizationUnitController extends ActiveController
{
    public $modelClass = 'app\models\UserOrganizationUnit';

    public $enableCsrfValidation = false;
}