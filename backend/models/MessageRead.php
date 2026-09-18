<?php

namespace app\models;

use Yii;
use app\models\Message;
use app\models\User;

class MessageRead extends \yii\db\ActiveRecord
{
    public static function tableName()
    {
        return 'message_reads';
    }

    public function rules()
    {
        return [
            [['message_id', 'user_id', 'read_at'], 'required'],
            [['message_id', 'user_id', 'read_at'], 'integer'],

            [
                ['message_id', 'user_id'],
                'unique',
                'targetAttribute' => ['message_id', 'user_id']
            ],

            [
                ['message_id'],
                'exist',
                'skipOnError' => true,
                'targetClass' => Message::class,
                'targetAttribute' => ['message_id' => 'id']
            ],

            [
                ['user_id'],
                'exist',
                'skipOnError' => true,
                'targetClass' => User::class,
                'targetAttribute' => ['user_id' => 'id']
            ],
        ];
    }

    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'message_id' => 'Message ID',
            'user_id' => 'User ID',
            'read_at' => 'Read At',
        ];
    }

    public function getMessage()
    {
        return $this->hasOne(Message::class, ['id' => 'message_id']);
    }

    public function getUser()
    {
        return $this->hasOne(User::class, ['id' => 'user_id']);
    }
}