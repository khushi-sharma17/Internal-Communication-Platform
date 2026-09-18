<?php

namespace app\models;

use Yii;

/**
 * This is the model class for table "teams".
 *
 * @property int $id
 * @property int $organization_unit_id
 * @property string $name
 * @property string|null $description
 * @property string $visibility
 * @property int|null $owner_id
 * @property int|null $default_channel_id
 * @property string $status
 * @property int $created_at
 *
 * @property OrganizationUnit $organizationUnit
 * @property User $owner
 * @property TeamMembership[] $teamMemberships
 */
class Team extends \yii\db\ActiveRecord
{
    public static function tableName()
    {
        return 'teams';
    }

    public function rules()
    {
        return [
            [['organization_unit_id', 'name', 'created_at'], 'required'],

            [['organization_unit_id', 'owner_id', 'default_channel_id', 'created_at'], 'integer'],

            [['description'], 'string'],

            [['name'], 'string', 'max' => 100],

            [['visibility', 'status'], 'string', 'max' => 20],

            [['visibility'], 'default', 'value' => 'private'],

            [['status'], 'default', 'value' => 'active'],

            [
                ['organization_unit_id'],
                'exist',
                'skipOnError' => true,
                'targetClass' => OrganizationUnit::class,
                'targetAttribute' => ['organization_unit_id' => 'id']
            ],

            [
                ['owner_id'],
                'exist',
                'skipOnError' => true,
                'targetClass' => User::class,
                'targetAttribute' => ['owner_id' => 'id']
            ],
        ];
    }

    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'organization_unit_id' => 'Organization Unit ID',
            'name' => 'Name',
            'description' => 'Description',
            'visibility' => 'Visibility',
            'owner_id' => 'Owner ID',
            'default_channel_id' => 'Default Channel ID',
            'status' => 'Status',
            'created_at' => 'Created At',
        ];
    }

    public function getOrganizationUnit()
    {
        return $this->hasOne(
            OrganizationUnit::class,
            ['id' => 'organization_unit_id']
        );
    }

    public function getOwner()
    {
        return $this->hasOne(
            User::class,
            ['id' => 'owner_id']
        );
    }

    public function getTeamMemberships()
    {
        return $this->hasMany(
            TeamMembership::class,
            ['team_id' => 'id']
        );
    }

    public function getChannels()
    {
        return $this->hasMany(Channel::class, ['team_id' => 'id']);
    }

    public function getMembers()
    {
        return $this->hasMany(User::class, ['id' => 'user_id'])
            ->viaTable('team_memberships', ['team_id' => 'id']);
    }
}