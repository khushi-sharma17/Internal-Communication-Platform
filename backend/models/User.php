<?php

namespace app\models;

use Yii;

/**
 * This is the model class for table "users".
 *
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string $password_hash
 * @property int $created_at
 * @property int $updated_at
 *
 * @property OrganizationUnit[] $organizationUnits
 * @property Role[] $roles
 * @property UserOrganizationUnit[] $userOrganizationUnits
 * @property UserRole[] $userRoles
 */
class User extends \yii\db\ActiveRecord implements \yii\web\IdentityInterface
{
    public static function tableName()
    {
        return 'users';
    }

    public function rules()
    {
        return [
            [['name', 'email', 'password_hash'], 'required'],
            ['name', 'string', 'max' => 100],
            ['email', 'email'],
            ['email', 'string', 'max' => 150],
            ['password_hash', 'string'],
            [['manager_id'], 'integer'],
            [['manager_id'], 'exist', 'skipOnError' => true, 'targetClass' => User::class, 'targetAttribute' => ['manager_id' => 'id']],
        ];
    }

    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'name' => 'Name',
            'email' => 'Email',
            'password_hash' => 'Password Hash',
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
        ];
    }

    public function getOrganizationUnits()
    {
        return $this->hasMany(
            OrganizationUnit::class,
            ['id' => 'organization_unit_id']
        )->viaTable(
            'user_organization_units',
            ['user_id' => 'id']
        );
    }

    public function getRoles()
    {
        return $this->hasMany(
            Role::class,
            ['id' => 'role_id']
        )->viaTable(
            'user_roles',
            ['user_id' => 'id']
        );
    }

    public function getUserOrganizationUnits()
    {
        return $this->hasMany(
            UserOrganizationUnit::class,
            ['user_id' => 'id']
        );
    }

    public function getUserRoles()
    {
        return $this->hasMany(
            UserRole::class,
            ['user_id' => 'id']
        );
    }

    public function getWatchedTasks()
    {
        return $this->hasMany(Task::class, ['id' => 'task_id'])
            ->viaTable('{{%task_watchers}}', ['user_id' => 'id']);
    }

    public function getManager()
    {
        return $this->hasOne(User::class, ['id' => 'manager_id']);
    }

    public function getSubordinates()
    {
        return $this->hasMany(User::class, ['manager_id' => 'id']);
    }

    public static function findIdentity($id)
    {
        return static::findOne($id);
    }

    public static function findIdentityByAccessToken($token, $type = null)
    {
        return static::findOne(['auth_token' => $token]);
    }

    public function getId()
    {
        return $this->id;
    }

    public function getAuthKey()
    {
        return null;
    }

    public function validateAuthKey($authKey)
    {
        return false;
    }

    public function getChannelMemberships()
    {
        return $this->hasMany(ChannelMembership::class, ['user_id' => 'id']);
    }


    public function fields()
    {
        return [
            'id',
            'name',
            'email',
            'status',
            'avatar_path',
            'last_seen_at',
            'manager_id',
            'created_at',
            'updated_at',
        ];
    }
}
