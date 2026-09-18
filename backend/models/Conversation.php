<?php

namespace app\models;

use Yii;
use app\models\Channel;
use app\models\User;
use app\models\Message;
use app\models\Team;
use app\models\Task;

/**
 * This is the model class for table "conversations".
 *
 * @property int $id
 * @property string $type
 * @property int|null $team_id
 * @property int|null $task_id
 * @property int $created_by
 * @property int $created_at
 * @property int|null $channel_id
 * @property string $visibility
 *
 * @property Channels $channel
 * @property Users $createdBy
 * @property Messages[] $messages
 * @property Teams $team
 */
class Conversation extends \yii\db\ActiveRecord
{


    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return 'conversations';
    }

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [['team_id', 'task_id', 'channel_id'], 'default', 'value' => null],
            [['visibility'], 'default', 'value' => 'private'],
            [['type', 'created_by', 'created_at'], 'required'],
            [['team_id', 'task_id', 'created_by', 'created_at', 'channel_id'], 'integer'],
            [['type'], 'string', 'max' => 30],
            [['visibility'], 'string', 'max' => 20],
            [['channel_id'], 'exist', 'skipOnError' => true, 'targetClass' => Channel::class, 'targetAttribute' => ['channel_id' => 'id']],
            [['created_by'], 'exist', 'skipOnError' => true, 'targetClass' => User::class, 'targetAttribute' => ['created_by' => 'id']],
            [['team_id'], 'exist', 'skipOnError' => true, 'targetClass' => Team::class, 'targetAttribute' => ['team_id' => 'id']],
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'type' => 'Type',
            'team_id' => 'Team ID',
            'task_id' => 'Task ID',
            'created_by' => 'Created By',
            'created_at' => 'Created At',
            'channel_id' => 'Channel ID',
            'visibility' => 'Visibility',
        ];
    }

    /**
     * Gets query for [[Channel]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getChannel()
    {
        return $this->hasOne(Channel::class, ['id' => 'channel_id']);
    }

    public function getCreatedBy()
    {
        return $this->hasOne(User::class, ['id' => 'created_by']);
    }

    public function getMessages()
    {
        return $this->hasMany(Message::class, ['conversation_id' => 'id']);
    }

    public function getTeam()
    {
        return $this->hasOne(Team::class, ['id' => 'team_id']);
    }

    public function getTask()
    {
        return $this->hasOne(Task::class, ['id' => 'task_id']);
    }
}
