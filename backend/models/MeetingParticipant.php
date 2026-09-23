<?php

namespace app\models;

use Yii;
use app\models\Meeting;
use app\models\User;

/**
 * This is the model class for table "meeting_participants".
 *
 * @property int $id
 * @property int $meeting_id
 * @property int $user_id
 * @property string $response
 * @property int $attended
 * @property int $created_at
 * @property int $updated_at
 *
 * @property Meetings $meeting
 * @property Users $user
 */
class MeetingParticipant extends \yii\db\ActiveRecord
{


    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return 'meeting_participants';
    }

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [['response'], 'default', 'value' => 'invited'],
            [['attended'], 'default', 'value' => 0],
            [['meeting_id', 'user_id', 'created_at', 'updated_at'], 'required'],
            [['meeting_id', 'user_id', 'attended', 'created_at', 'updated_at'], 'integer'],
            [['response'], 'string', 'max' => 20],
            [['meeting_id', 'user_id'], 'unique', 'targetAttribute' => ['meeting_id', 'user_id']],
            [['meeting_id'], 'exist', 'skipOnError' => true, 'targetClass' => Meeting::class, 'targetAttribute' => ['meeting_id' => 'id']],
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
            'meeting_id' => 'Meeting ID',
            'user_id' => 'User ID',
            'response' => 'Response',
            'attended' => 'Attended',
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
        ];
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

    /**
     * Gets query for [[User]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getUser()
    {
        return $this->hasOne(User::class, ['id' => 'user_id']);
    }


    public function extraFields()
    {
        return ['meeting', 'user'];
    }

}
