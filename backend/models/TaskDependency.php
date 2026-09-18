<?php

namespace app\models;

use Yii;

/**
 * This is the model class for table "task_dependencies".
 *
 * @property int $id
 * @property int $task_id
 * @property int $depends_on_task_id
 * @property int $created_at
 *
 * @property Tasks $dependsOnTask
 * @property Tasks $task
 */
class TaskDependency extends \yii\db\ActiveRecord
{


    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return 'task_dependencies';
    }

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [['task_id', 'depends_on_task_id', 'created_at'], 'required'],
            [['task_id', 'depends_on_task_id', 'created_at'], 'integer'],
            [['task_id', 'depends_on_task_id'], 'unique', 'targetAttribute' => ['task_id', 'depends_on_task_id']],

            ['depends_on_task_id', 'compare', 'compareAttribute' => 'task_id', 'operator' => '!=', 'message' => 'A task cannot depend on itself.'],

            [['depends_on_task_id'], 'exist', 'skipOnError' => true, 'targetClass' => Task::class, 'targetAttribute' => ['depends_on_task_id' => 'id']],
            [['task_id'], 'exist', 'skipOnError' => true, 'targetClass' => Task::class, 'targetAttribute' => ['task_id' => 'id']],
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'task_id' => 'Task ID',
            'depends_on_task_id' => 'Depends On Task ID',
            'created_at' => 'Created At',
        ];
    }

    /**
     * Gets query for [[DependsOnTask]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getDependsOnTask()
    {
        return $this->hasOne(Task::class, ['id' => 'depends_on_task_id']);
    }

    /**
     * Gets query for [[Task]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getTask()
    {
        return $this->hasOne(Task::class, ['id' => 'task_id']);
    }

}
