<?php

namespace app\models;

use Yii;

/**
 * This is the model class for table "roles".
 *
 * @property int $id
 * @property string $name
 * @property string|null $description
 * @property int $created_at
 *
 * @property Permission[] $permissions
 * @property RolePermission[] $rolePermissions
 * @property User[] $users
 * @property UserRole[] $userRoles
 */
class Role extends \yii\db\ActiveRecord
{
    public static function tableName()
    {
        return 'roles';
    }

    public function rules()
    {
        return [
            [['name', 'created_at'], 'required'],
            [['description'], 'string'],
            [['created_at'], 'integer'],
            [['name'], 'string', 'max' => 100],
            [['name'], 'unique'],
        ];
    }

    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'name' => 'Name',
            'description' => 'Description',
            'created_at' => 'Created At',
        ];
    }

    public function getPermissions()
    {
        return $this->hasMany(
            Permission::class,
            ['id' => 'permission_id']
        )->viaTable(
            'role_permissions',
            ['role_id' => 'id']
        );
    }

    public function getRolePermissions()
    {
        return $this->hasMany(
            RolePermission::class,
            ['role_id' => 'id']
        );
    }

    public function getUsers()
    {
        return $this->hasMany(
            User::class,
            ['id' => 'user_id']
        )->viaTable(
            'user_roles',
            ['role_id' => 'id']
        );
    }

    public function getUserRoles()
    {
        return $this->hasMany(
            UserRole::class,
            ['role_id' => 'id']
        );
    }


    public function fields()
    {
        return [
            'id',
            'name',
            'description',
            'created_at',
            'permissions',
        ];
    }
}