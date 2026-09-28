<?php

namespace app\models;

use Yii;
use app\models\User;
use app\models\Meeting;

/**
 * This is the model class for table "meeting_notes".
 *
 * @property int $id
 * @property int $meeting_id
 * @property int $created_by
 * @property string $content
 * @property string|null $ai_summary
 * @property string|null $ai_decisions
 * @property string|null $ai_action_items
 * @property int $created_at
 * @property int $updated_at
 *
 * @property Users $createdBy
 * @property Meetings $meeting
 */
class MeetingNote extends \yii\db\ActiveRecord
{


    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return 'meeting_notes';
    }

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [['ai_summary', 'ai_decisions', 'ai_action_items'], 'default', 'value' => null],
            [['meeting_id', 'created_by', 'content', 'created_at', 'updated_at'], 'required'],
            [['meeting_id', 'created_by', 'created_at', 'updated_at'], 'integer'],
            [['content', 'ai_summary', 'ai_decisions', 'ai_action_items'], 'string'],
            [['created_by'], 'exist', 'skipOnError' => true, 'targetClass' => User::class, 'targetAttribute' => ['created_by' => 'id']],
            [['meeting_id'], 'exist', 'skipOnError' => true, 'targetClass' => Meeting::class, 'targetAttribute' => ['meeting_id' => 'id']],
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'meeting_id' => 'Meeting ID',
            'created_by' => 'Created By',
            'content' => 'Content',
            'ai_summary' => 'Ai Summary',
            'ai_decisions' => 'Ai Decisions',
            'ai_action_items' => 'Ai Action Items',
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
        ];
    }

    /**
     * Gets query for [[CreatedBy]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getCreatedBy()
    {
        return $this->hasOne(User::class, ['id' => 'created_by']);
    }

    /**
     * Gets query for [[Meeting]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getMeeting()
    {
        return $this->hasOne(Meeting::class, ['id' => 'meeting_id']);
    }

}
