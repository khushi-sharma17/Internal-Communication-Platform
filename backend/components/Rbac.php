<?php

namespace app\components;

use app\models\User;

class Rbac
{
    public static function hasPermission($userId, $permissionName)
    {
        $user = User::findOne($userId);

        if (!$user) {
            return false;
        }

        return $user->getRoles()
            ->joinWith('permissions')
            ->where(['permissions.name' => $permissionName])
            ->exists();
    }
}