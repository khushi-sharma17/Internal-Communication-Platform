<?php

namespace app\models;

use Yii;
use app\models\MessageMention;
use app\models\MessageAttachment;
use app\models\MessageReaction;

/**
 * This is the model class for table "messages".
 *
 * @property int $id
 * @property int $conversation_id
 * @property int $sender_id
 * @property string $message
 * @property int $created_at
 * @property int $updated_at
 * @property int|null $deleted_at
 * @property int|null $parent_message_id
 *
 * @property Conversations $conversation
 * @property Users $sender
 */
class Message extends \yii\db\ActiveRecord
{


    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return 'messages';
    }

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [['conversation_id', 'sender_id', 'message'], 'required'],
            [['conversation_id', 'sender_id', 'created_at', 'updated_at', 'deleted_at', 'parent_message_id'], 'integer'],
            [['message'], 'string'],
            [['conversation_id'], 'exist', 'skipOnError' => true, 'targetClass' => Conversation::class, 'targetAttribute' => ['conversation_id' => 'id']],
            [['sender_id'], 'exist', 'skipOnError' => true, 'targetClass' => User::class, 'targetAttribute' => ['sender_id' => 'id']],
        ];
    }


    public function fields()
    {
        $fields = parent::fields();

        $fields['attachments'] = function ($model) {
            return $model->attachments;
        };

        $fields['reactions'] = function ($model) {
            return $model->reactions;
        };

        return $fields;
    }

    /**
     * {@inheritdoc}
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'conversation_id' => 'Conversation ID',
            'sender_id' => 'Sender ID',
            'message' => 'Message',
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
            'deleted_at' => 'Deleted At',
            'parent_message_id' => 'Parent Message ID',
        ];
    }

    /**
     * Gets query for [[Conversation]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getConversation()
    {
        return $this->hasOne(Conversation::class, ['id' => 'conversation_id']);
    }

    /**
     * Gets query for [[Sender]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getSender()
    {
        return $this->hasOne(User::class, ['id' => 'sender_id']);
    }

    /**
     * Gets query for [[ParentMessage]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getParentMessage()
    {
        return $this->hasOne(Message::class, ['id' => 'parent_message_id']);
    }

    /**
     * Gets query for [[Replies]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getReplies()
    {
        return $this->hasMany(Message::class, ['parent_message_id' => 'id']);
    }

    public function getMentions()
    {
        return $this->hasMany(MessageMention::class, ['message_id' => 'id']);
    }

    public function getAttachments()
    {
        return $this->hasMany(MessageAttachment::class, ['message_id' => 'id']);
    }

    public function getReactions()
    {
        return $this->hasMany(MessageReaction::class, ['message_id' => 'id']);
    }
}
