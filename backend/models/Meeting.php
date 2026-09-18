<?php

namespace app\models;

use yii\db\ActiveRecord;

class Meeting extends ActiveRecord
{
    public static function tableName()
    {
        return '{{%meetings}}';
    }

    public function rules()
    {
        return [
            [['title', 'created_by', 'start_time', 'end_time'], 'required'],

            [['agenda'], 'string'],

            [
                ['created_by', 'start_time', 'end_time', 'is_recurring',
                 'created_at', 'updated_at'],
                'integer'
            ],

            [['title'], 'string', 'max' => 200],

            [['timezone'], 'string', 'max' => 50],

            [['location'], 'string', 'max' => 255],

            [['meeting_link'], 'string', 'max' => 500],

            [['is_recurring'], 'boolean'],
        ];
    }

    public function getCreator()
    {
        return $this->hasOne(User::class, ['id' => 'created_by']);
    }
}