<?php

namespace app\models;

/**
 * This is the model class for table "channels".
 *
 * @property int $id
 * @property int $team_id
 * @property string $name
 * @property string|null $description
 * @property string $type
 * @property int $created_at
 * @property string $visibility
 * @property int|null $created_by
 * @property int|null $archived_at
 *
 * @property User $createdBy
 * @property Team $team
 */
class Channel extends \yii\db\ActiveRecord
{
    public static function tableName()
    {
        return 'channels';
    }

    public function rules()
    {
        return [
            [['team_id', 'name', 'created_at'], 'required'],

            [['team_id', 'created_at', 'created_by', 'archived_at'], 'integer'],

            [['description'], 'string'],

            [['name'], 'string', 'max' => 100],

            [['type'], 'string', 'max' => 30],

            [['visibility'], 'string', 'max' => 20],

            [['type'], 'default', 'value' => 'team'],

            [['visibility'], 'default', 'value' => 'private'],

            [['created_by', 'archived_at'], 'default', 'value' => null],

            [['team_id', 'name'], 'unique', 'targetAttribute' => ['team_id', 'name']],

            [
                ['created_by'],
                'exist',
                'skipOnError' => true,
                'targetClass' => User::class,
                'targetAttribute' => ['created_by' => 'id']
            ],

            [
                ['team_id'],
                'exist',
                'skipOnError' => true,
                'targetClass' => Team::class,
                'targetAttribute' => ['team_id' => 'id']
            ],
        ];
    }

    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'team_id' => 'Team ID',
            'name' => 'Name',
            'description' => 'Description',
            'type' => 'Type',
            'created_at' => 'Created At',
            'visibility' => 'Visibility',
            'created_by' => 'Created By',
            'archived_at' => 'Archived At',
        ];
    }

    public function getCreatedBy()
    {
        return $this->hasOne(
            User::class,
            ['id' => 'created_by']
        );
    }

    public function getTeam()
    {
        return $this->hasOne(
            Team::class,
            ['id' => 'team_id']
        );
    }

    public function getChannelMemberships()
    {
        return $this->hasMany(ChannelMembership::class, ['channel_id' => 'id']);
    }
}