<?php

namespace app\models;

use Yii;

/**
 * This is the model class for table "permissions".
 *
 * @property int $id
 * @property string $name
 * @property string|null $description
 * @property int $created_at
 *
 * @property RolePermission[] $rolePermissions
 * @property Role[] $roles
 */
class Permission extends \yii\db\ActiveRecord
{
    public static function tableName()
    {
        return 'permissions';
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

    public function getRolePermissions()
    {
        return $this->hasMany(
            RolePermission::class,
            ['permission_id' => 'id']
        );
    }

    public function getRoles()
    {
        return $this->hasMany(
            Role::class,
            ['id' => 'role_id']
        )->viaTable(
            'role_permissions',
            ['permission_id' => 'id']
        );
    }
}