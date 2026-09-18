<?php

namespace app\models;

use Yii;

/**
 * This is the model class for table "role_permissions".
 *
 * @property int $id
 * @property int $role_id
 * @property int $permission_id
 * @property int $created_at
 *
 * @property Permission $permission
 * @property Role $role
 */
class RolePermission extends \yii\db\ActiveRecord
{
    public static function tableName()
    {
        return 'role_permissions';
    }

    public function rules()
    {
        return [
            [['role_id', 'permission_id', 'created_at'], 'required'],
            [['role_id', 'permission_id', 'created_at'], 'integer'],
            [['role_id', 'permission_id'], 'unique', 'targetAttribute' => ['role_id', 'permission_id']],
            [['permission_id'], 'exist', 'skipOnError' => true, 'targetClass' => Permission::class, 'targetAttribute' => ['permission_id' => 'id']],
            [['role_id'], 'exist', 'skipOnError' => true, 'targetClass' => Role::class, 'targetAttribute' => ['role_id' => 'id']],
        ];
    }

    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'role_id' => 'Role ID',
            'permission_id' => 'Permission ID',
            'created_at' => 'Created At',
        ];
    }

    public function getPermission()
    {
        return $this->hasOne(Permission::class, ['id' => 'permission_id']);
    }

    public function getRole()
    {
        return $this->hasOne(Role::class, ['id' => 'role_id']);
    }
}