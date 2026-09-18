<?php

namespace app\models;

use Yii;

/**
 * This is the model class for table "user_roles".
 *
 * @property int $id
 * @property int $user_id
 * @property int $role_id
 * @property int $created_at
 *
 * @property Role $role
 * @property User $user
 */
class UserRole extends \yii\db\ActiveRecord
{
    public static function tableName()
    {
        return 'user_roles';
    }

    public function rules()
    {
        return [
            [['user_id', 'role_id', 'created_at'], 'required'],
            [['user_id', 'role_id', 'created_at'], 'integer'],
            [['user_id', 'role_id'], 'unique', 'targetAttribute' => ['user_id', 'role_id']],
            [['role_id'], 'exist', 'skipOnError' => true, 'targetClass' => Role::class, 'targetAttribute' => ['role_id' => 'id']],
            [['user_id'], 'exist', 'skipOnError' => true, 'targetClass' => User::class, 'targetAttribute' => ['user_id' => 'id']],
        ];
    }

    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'user_id' => 'User ID',
            'role_id' => 'Role ID',
            'created_at' => 'Created At',
        ];
    }

    public function getRole()
    {
        return $this->hasOne(Role::class, ['id' => 'role_id']);
    }

    public function getUser()
    {
        return $this->hasOne(User::class, ['id' => 'user_id']);
    }
}