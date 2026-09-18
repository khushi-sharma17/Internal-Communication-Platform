<?php

use yii\db\Migration;

class m260910_114841_create_task_watchers_table extends Migration
{
    public function safeUp()
    {
        $this->createTable('{{%task_watchers}}', [
            'id' => $this->primaryKey(),

            'task_id' => $this->integer()->notNull(),
            'user_id' => $this->integer()->notNull(),

            'created_at' => $this->integer()->notNull(),
        ]);

        $this->addForeignKey(
            'fk-task_watchers-task_id',
            '{{%task_watchers}}',
            'task_id',
            '{{%tasks}}',
            'id',
            'CASCADE',
            'CASCADE'
        );

        $this->addForeignKey(
            'fk-task_watchers-user_id',
            '{{%task_watchers}}',
            'user_id',
            '{{%users}}',
            'id',
            'CASCADE',
            'CASCADE'
        );

        $this->createIndex(
            'idx-task_watchers-task_id',
            '{{%task_watchers}}',
            'task_id'
        );

        $this->createIndex(
            'idx-task_watchers-user_id',
            '{{%task_watchers}}',
            'user_id'
        );

        $this->createIndex(
            'unique-task-watcher',
            '{{%task_watchers}}',
            ['task_id', 'user_id'],
            true
        );
    }

    public function safeDown()
    {
        $this->dropTable('{{%task_watchers}}');
    }
}