<?php

namespace app\models;

use yii\db\ActiveRecord;

class TaskActivity extends ActiveRecord
{
    public static function tableName()
    {
        return '{{%task_activities}}';
    }

    public function rules()
    {
        return [
            [['task_id', 'user_id', 'action', 'created_at'], 'required'],

            [['task_id', 'user_id', 'created_at'], 'integer'],

            [['details'], 'string'],

            [['action'], 'string', 'max' => 50],
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