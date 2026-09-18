<?php

namespace app\models;

use Yii;
use app\models\Message;
use app\models\User;

/**
 * This is the model class for table "message_reactions".
 *
 * @property int $id
 * @property int $message_id
 * @property int $user_id
 * @property string $reaction
 * @property int $created_at
 *
 * @property Messages $message
 */

class MessageReaction extends \yii\db\ActiveRecord
{


    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return 'message_reactions';
    }

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [['message_id', 'user_id', 'reaction', 'created_at'], 'required'],
            [['message_id', 'user_id', 'created_at'], 'integer'],
            [['reaction'], 'string', 'max' => 50],
            [
                ['message_id', 'user_id', 'reaction'],
                'unique',
                'targetAttribute' => ['message_id', 'user_id', 'reaction']
            ],
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
            'reaction' => 'Reaction',
            'created_at' => 'Created At',
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
