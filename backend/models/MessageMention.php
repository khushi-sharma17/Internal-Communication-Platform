<?php

namespace app\models;

use Yii;
use app\models\Message;
use app\models\User;

/**
 * This is the model class for table "message_mentions".
 *
 * @property int $id
 * @property int $message_id
 * @property int $user_id
 * @property int $created_at
 *
 * @property Message $message
 * @property User $user
 */
class MessageMention extends \yii\db\ActiveRecord
{
    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return 'message_mentions';
    }

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [['message_id', 'user_id', 'created_at'], 'required'],
            [['message_id', 'user_id', 'created_at'], 'integer'],
            [['message_id', 'user_id'], 'unique', 'targetAttribute' => ['message_id', 'user_id']],
            [['message_id'], 'exist', 'skipOnError' => true, 'targetClass' => Message::class, 'targetAttribute' => ['message_id' => 'id']],
            [['user_id'], 'exist', 'skipOnError' => true, 'targetClass' => User::class, 'targetAttribute' => ['user_id' => 'id']],
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'message_id' => 'Message ID',
            'user_id' => 'User ID',
            'created_at' => 'Created At',
        ];
    }

    /**
     * Gets the message associated with this mention.
     */
    public function getMessage()
    {
        return $this->hasOne(Message::class, ['id' => 'message_id']);
    }

    /**
     * Gets the user associated with this mention.
     */
    public function getUser()
    {
        return $this->hasOne(User::class, ['id' => 'user_id']);
    }
}
