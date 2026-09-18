<?php

namespace app\models;

use Yii;

/**
 * This is the model class for table "conversation_participants".
 *
 * @property int $id
 * @property int $conversation_id
 * @property int $user_id
 * @property string $role
 * @property int $joined_at
 * @property int|null $muted_until
 * @property int|null $last_read_message_id
 *
 * @property Conversations $conversation
 * @property Users $user
 */
class ConversationParticipant extends \yii\db\ActiveRecord
{


    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return 'conversation_participants';
    }

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [['muted_until', 'last_read_message_id'], 'default', 'value' => null],
            [['role'], 'default', 'value' => 'member'],
            [['conversation_id', 'user_id', 'joined_at'], 'required'],
            [['conversation_id', 'user_id', 'joined_at', 'muted_until', 'last_read_message_id'], 'integer'],
            [['role'], 'string', 'max' => 20],
            [['conversation_id', 'user_id'], 'unique', 'targetAttribute' => ['conversation_id', 'user_id']],
            [['conversation_id'], 'exist', 'skipOnError' => true, 'targetClass' => Conversation::class, 'targetAttribute' => ['conversation_id' => 'id']],
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
            'conversation_id' => 'Conversation ID',
            'user_id' => 'User ID',
            'role' => 'Role',
            'joined_at' => 'Joined At',
            'muted_until' => 'Muted Until',
            'last_read_message_id' => 'Last Read Message ID',
        ];
    }

    /**
     * Gets query for [[Conversation]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getConversation()
    {
        return $this->hasOne(Conversations::class, ['id' => 'conversation_id']);
    }

    /**
     * Gets query for [[User]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getUser()
    {
        return $this->hasOne(Users::class, ['id' => 'user_id']);
    }

}
