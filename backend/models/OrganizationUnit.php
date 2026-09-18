<?php

namespace app\models;

use Yii;
use yii\behaviors\TimestampBehavior;

/**
 * This is the model class for table "organization_units".
 *
 * @property int $id
 * @property int|null $parent_id
 * @property string $name
 * @property string $type
 * @property int $created_at
 *
 * @property OrganizationUnit|null $parent
 * @property OrganizationUnit[] $children
 * @property UserOrganizationUnit[] $userOrganizationUnits
 * @property User[] $users
 * @property Team[] $teams
 */
class OrganizationUnit extends \yii\db\ActiveRecord
{
    public static function tableName()
    {
        return 'organization_units';
    }


    public function behaviors()
    {
        return [
            [
                'class' => TimestampBehavior::class,
                'createdAtAttribute' => 'created_at',
                'updatedAtAttribute' => 'updated_at',
                'value' => time(),
            ],
        ];
    }


    public function rules()
    {
        return [
            [['parent_id', 'manager_id', 'created_at', 'updated_at'], 'integer'],

            [['name', 'type'], 'required'],

            [['name'], 'string', 'max' => 150],

            [['type', 'status'], 'string', 'max' => 50],

            [['status'], 'default', 'value' => 'active'],

            [['parent_id'], 'exist',
                'skipOnError' => true,
                'targetClass' => OrganizationUnit::class,
                'targetAttribute' => ['parent_id' => 'id']
            ],

            [['manager_id'], 'exist',
                'skipOnError' => true,
                'targetClass' => User::class,
                'targetAttribute' => ['manager_id' => 'id']
            ],
        ];
    }

    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'parent_id' => 'Parent ID',
            'name' => 'Name',
            'type' => 'Type',
            'created_at' => 'Created At',
        ];
    }

    public function getParent()
    {
        return $this->hasOne(
            OrganizationUnit::class,
            ['id' => 'parent_id']
        );
    }


    public function getManager()
    {
        return $this->hasOne(User::class, ['id' => 'manager_id']);
    }


    public function getChildren()
    {
        return $this->hasMany(
            OrganizationUnit::class,
            ['parent_id' => 'id']
        );
    }

    public function getUserOrganizationUnits()
    {
        return $this->hasMany(
            UserOrganizationUnit::class,
            ['organization_unit_id' => 'id']
        );
    }

    public function getUsers()
    {
        return $this->hasMany(
            User::class,
            ['id' => 'user_id']
        )->viaTable(
            'user_organization_units',
            ['organization_unit_id' => 'id']
        );
    }

    public function getTeams()
    {
        return $this->hasMany(
            Team::class,
            ['organization_unit_id' => 'id']
        );
    }
}