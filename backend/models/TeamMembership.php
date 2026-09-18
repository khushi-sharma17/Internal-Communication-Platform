<?php

namespace app\models;

use Yii;

/**
 * This is the model class for table "team_memberships".
 *
 * @property int $id
 * @property int $team_id
 * @property int $user_id
 * @property int|null $role_id
 * @property int|null $reports_to_user_id
 * @property string $status
 * @property int $joined_at
 *
 * @property Team $team
 * @property User $user
 * @property Role $role
 * @property User $reportsToUser
 */
class TeamMembership extends \yii\db\ActiveRecord
{
    public static function tableName()
    {
        return 'team_memberships';
    }

    public function rules()
    {
        return [
            [['team_id', 'user_id', 'joined_at'], 'required'],

            [['team_id', 'user_id', 'role_id', 'reports_to_user_id', 'joined_at'], 'integer'],

            [['team_id', 'user_id'], 'unique', 'targetAttribute' => ['team_id', 'user_id']],

            [['status'], 'string', 'max' => 20],

            [['status'], 'default', 'value' => 'active'],

            [
                ['team_id'],
                'exist',
                'skipOnError' => true,
                'targetClass' => Team::class,
                'targetAttribute' => ['team_id' => 'id']
            ],

            [
                ['user_id'],
                'exist',
                'skipOnError' => true,
                'targetClass' => User::class,
                'targetAttribute' => ['user_id' => 'id']
            ],

            [
                ['role_id'],
                'exist',
                'skipOnError' => true,
                'targetClass' => Role::class,
                'targetAttribute' => ['role_id' => 'id']
            ],

            [
                ['reports_to_user_id'],
                'exist',
                'skipOnError' => true,
                'targetClass' => User::class,
                'targetAttribute' => ['reports_to_user_id' => 'id']
            ],
        ];
    }

    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'team_id' => 'Team ID',
            'user_id' => 'User ID',
            'role_id' => 'Role ID',
            'reports_to_user_id' => 'Reports To User ID',
            'status' => 'Status',
            'joined_at' => 'Joined At',
        ];
    }

    public function getTeam()
    {
        return $this->hasOne(
            Team::class,
            ['id' => 'team_id']
        );
    }

    public function getUser()
    {
        return $this->hasOne(
            User::class,
            ['id' => 'user_id']
        );
    }

    public function getRole()
    {
        return $this->hasOne(
            Role::class,
            ['id' => 'role_id']
        );
    }

    public function getReportsToUser()
    {
        return $this->hasOne(
            User::class,
            ['id' => 'reports_to_user_id']
        );
    }
}