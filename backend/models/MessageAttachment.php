<?php

namespace app\models;

use Yii;
use app\models\Message;

/**
 * This is the model class for table "message_attachments".
 *
 * @property int $id
 * @property int $message_id
 * @property string $file_name
 * @property string $file_path
 * @property string|null $file_type
 * @property int|null $file_size
 * @property int $created_at
 *
 * @property Message $message
 */
class MessageAttachment extends \yii\db\ActiveRecord
{


    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return 'message_attachments';
    }

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [['file_type', 'file_size'], 'default', 'value' => null],
            [['message_id', 'file_name', 'file_path', 'created_at'], 'required'],
            [['message_id', 'file_size', 'created_at'], 'integer'],
            [['file_name'], 'string', 'max' => 255],
            [['file_path'], 'string', 'max' => 500],
            [['file_type'], 'string', 'max' => 100],
            [['message_id'], 'exist', 'skipOnError' => true, 'targetClass' => Message::class, 'targetAttribute' => ['message_id' => 'id']],
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
            'file_name' => 'File Name',
            'file_path' => 'File Path',
            'file_type' => 'File Type',
            'file_size' => 'File Size',
            'created_at' => 'Created At',
        ];
    }

    /**
     * Gets query for [[Message]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getMessage()
    {
        return $this->hasOne(Message::class, ['id' => 'message_id']);
    }

}
