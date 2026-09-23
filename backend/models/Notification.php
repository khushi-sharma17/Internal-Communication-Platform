<?php

namespace app\models;

use Yii;
use app\models\User;
use app\models\Message;

class Notification extends \yii\db\ActiveRecord
{
    public static function tableName()
    {
        return 'notifications';
    }

    public function rules()
    {
        return [
            [['user_id', 'type', 'content', 'created_at'], 'required'],
            [['user_id', 'message_id', 'is_read', 'created_at'], 'integer'],
            [['type'], 'string', 'max' => 50],
            [['content'], 'string', 'max' => 255],

            [
                ['user_id'],
                'exist',
                'skipOnError' => true,
                'targetClass' => User::class,
                'targetAttribute' => ['user_id' => 'id']
            ],

            [
                ['message_id'],
                'exist',
                'skipOnError' => true,
                'targetClass' => Message::class,
                'targetAttribute' => ['message_id' => 'id']
            ],
        ];
    }

    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'user_id' => 'User ID',
            'type' => 'Type',
            'message_id' => 'Message ID',
            'content' => 'Content',
            'is_read' => 'Is Read',
            'created_at' => 'Created At',
        ];
    }

    public function getUser()
    {
        return $this->hasOne(User::class, ['id' => 'user_id']);
    }

    public function getMessage()
    {
        return $this->hasOne(Message::class, ['id' => 'message_id']);
    }


    public function extraFields()
    {
        return ['user', 'message'];
    }
}