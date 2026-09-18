<?php

namespace app\models;

use Yii;

/**
 * This is the model class for table "user_organization_units".
 *
 * @property int $id
 * @property int $user_id
 * @property int $organization_unit_id
 * @property int $created_at
 *
 * @property OrganizationUnit $organizationUnit
 * @property User $user
 */
class UserOrganizationUnit extends \yii\db\ActiveRecord
{
    public static function tableName()
    {
        return 'user_organization_units';
    }

    public function rules()
    {
        return [
            [['user_id', 'organization_unit_id', 'created_at'], 'required'],
            [['user_id', 'organization_unit_id', 'created_at'], 'integer'],
            [['user_id', 'organization_unit_id'], 'unique', 'targetAttribute' => ['user_id', 'organization_unit_id']],
            [['organization_unit_id'], 'exist', 'skipOnError' => true, 'targetClass' => OrganizationUnit::class, 'targetAttribute' => ['organization_unit_id' => 'id']],
            [['user_id'], 'exist', 'skipOnError' => true, 'targetClass' => User::class, 'targetAttribute' => ['user_id' => 'id']],
        ];
    }

    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'user_id' => 'User ID',
            'organization_unit_id' => 'Organization Unit ID',
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

    public function getUser()
    {
        return $this->hasOne(
            User::class,
            ['id' => 'user_id']
        );
    }
}