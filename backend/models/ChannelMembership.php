<?php

namespace app\models;

use yii\db\ActiveRecord;

class ChannelMembership extends ActiveRecord
{
    public static function tableName()
    {
        return 'channel_memberships';
    }

    public function rules()
    {
        return [
            [['channel_id', 'user_id', 'joined_at'], 'required'],
            [['channel_id', 'user_id', 'role_id', 'joined_at'], 'integer'],
            [['status'], 'string', 'max' => 20],

            [['status'], 'default', 'value' => 'active'],
            [['role_id'], 'default', 'value' => null],

            [
                ['channel_id', 'user_id'],
                'unique',
                'targetAttribute' => ['channel_id', 'user_id']
            ],

            [
                ['channel_id'],
                'exist',
                'skipOnError' => true,
                'targetClass' => Channel::class,
                'targetAttribute' => ['channel_id' => 'id']
            ],

            [
                ['user_id'],
                'exist',
                'skipOnError' => true,
                'targetClass' => User::class,
                'targetAttribute' => ['user_id' => 'id']
            ],

            [
                ['role_id'],
                'exist',
                'skipOnError' => true,
                'targetClass' => Role::class,
                'targetAttribute' => ['role_id' => 'id']
            ],
        ];
    }

    public function getChannel()
    {
        return $this->hasOne(Channel::class, ['id' => 'channel_id']);
    }

    public function getUser()
    {
        return $this->hasOne(User::class, ['id' => 'user_id']);
    }

    public function getRole()
    {
        return $this->hasOne(Role::class, ['id' => 'role_id']);
    }
}