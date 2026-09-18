<?php

namespace app\models;

use yii\db\ActiveRecord;

class Task extends ActiveRecord
{
    public static function tableName()
    {
        return '{{%tasks}}';
    }

    public function rules()
    {
        return [
            [['title', 'created_by'], 'required'],

            [['description'], 'string'],

            [['created_by', 'assigned_to', 'due_date', 'created_at', 'updated_at'], 'integer'],
            [['created_at', 'updated_at'], 'default', 'value' => time()],

            [['title'], 'string', 'max' => 200],

            [['priority'], 'string', 'max' => 20],

            [['status'], 'string', 'max' => 30],
        ];
    }

    public function getCreator()
    {
        return $this->hasOne(User::class, ['id' => 'created_by']);
    }

    public function getAssignee()
    {
        return $this->hasOne(User::class, ['id' => 'assigned_to']);
    }

    public function getWatchers()
    {
        return $this->hasMany(User::class, ['id' => 'user_id'])->viaTable('{{%task_watchers}}', ['task_id' => 'id']);
    }


    public function getAssignments()
    {
        return $this->hasMany(TaskAssignment::class, ['task_id' => 'id']);
    }

    public function getDependencies()
    {
        return $this->hasMany(TaskDependency::class, ['task_id' => 'id']);
    }

    public function getActivities()
    {
        return $this->hasMany(TaskActivity::class, ['task_id' => 'id']);
    }
}