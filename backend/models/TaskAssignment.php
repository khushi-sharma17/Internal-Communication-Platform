<?php

namespace app\models;

use yii\db\ActiveRecord;

class TaskAssignment extends ActiveRecord
{
    public static function tableName()
    {
        return '{{%task_assignments}}';
    }

    public function rules()
    {
        return [
            [['task_id', 'created_at'], 'required'],

            [['task_id', 'user_id', 'team_id', 'created_at'], 'integer'],
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

    public function getTeam()
    {
        return $this->hasOne(Team::class, ['id' => 'team_id']);
    }
}