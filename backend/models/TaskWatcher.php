<?php

namespace app\models;

use yii\db\ActiveRecord;

class TaskWatcher extends ActiveRecord
{
    public static function tableName()
    {
        return '{{%task_watchers}}';
    }

    public function rules()
    {
        return [
            [['task_id', 'user_id'], 'required'],
            [['task_id', 'user_id', 'created_at'], 'integer'],

            ['created_at', 'default', 'value' => time()],

            [['task_id', 'user_id'], 'unique',
                'targetAttribute' => ['task_id', 'user_id'],
                'message' => 'This user is already watching this task.'
            ],
        ];
    }

    public function getTask()
    {
        return $this->hasOne(Task::class, ['id' => 'task_id']);
    }

    public function getUser()
    {
        return $this->hasOne(User::class, ['id' => 'user_id']);
    }
}