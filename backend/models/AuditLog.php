<?php

namespace app\models;

use Yii;

/**
 * This is the model class for table "audit_logs".
 *
 * @property int $id
 * @property int|null $actor_id
 * @property string $object_type
 * @property int|null $object_id
 * @property string $action
 * @property string|null $old_value_json
 * @property string|null $new_value_json
 * @property int $created_at
 */
class AuditLog extends \yii\db\ActiveRecord
{


    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return 'audit_logs';
    }

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [['actor_id', 'object_id', 'old_value_json', 'new_value_json'], 'default', 'value' => null],
            [['actor_id', 'object_id', 'created_at'], 'integer'],
            [['object_type', 'action', 'created_at'], 'required'],
            [['old_value_json', 'new_value_json'], 'string'],
            [['object_type', 'action'], 'string', 'max' => 100],
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'actor_id' => 'Actor ID',
            'object_type' => 'Object Type',
            'object_id' => 'Object ID',
            'action' => 'Action',
            'old_value_json' => 'Old Value Json',
            'new_value_json' => 'New Value Json',
            'created_at' => 'Created At',
        ];
    }

}
