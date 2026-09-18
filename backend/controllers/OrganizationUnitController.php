<?php

namespace app\controllers;

use yii\rest\ActiveController;

class OrganizationUnitController extends ActiveController
{
    public $modelClass = 'app\models\OrganizationUnit';

    public $enableCsrfValidation = false;
}