<?php

use yii\db\Migration;

class m260910_120901_create_task_dependencies_table extends Migration
{
    public function safeUp()
    {
        $this->createTable('{{%task_dependencies}}', [
            'id' => $this->primaryKey(),

            'task_id' => $this->integer()->notNull(),

            // The task that must be completed first
            'depends_on_task_id' => $this->integer()->notNull(),

            'created_at' => $this->integer()->notNull(),
        ]);

        $this->addForeignKey(
            'fk-task_dependencies-task_id',
            '{{%task_dependencies}}',
            'task_id',
            '{{%tasks}}',
            'id',
            'CASCADE',
            'CASCADE'
        );

        $this->addForeignKey(
            'fk-task_dependencies-depends_on_task_id',
            '{{%task_dependencies}}',
            'depends_on_task_id',
            '{{%tasks}}',
            'id',
            'CASCADE',
            'CASCADE'
        );

        $this->createIndex(
            'idx-task_dependencies-task_id',
            '{{%task_dependencies}}',
            'task_id'
        );

        $this->createIndex(
            'idx-task_dependencies-depends_on_task_id',
            '{{%task_dependencies}}',
            'depends_on_task_id'
        );

        $this->createIndex(
            'unique-task-dependency',
            '{{%task_dependencies}}',
            ['task_id', 'depends_on_task_id'],
            true
        );
    }

    public function safeDown()
    {
        $this->dropTable('{{%task_dependencies}}');
    }
}