<?php

use yii\db\Migration;

/**
 * Handles the creation of table `{{%tasks}}`.
 */
class m260910_114551_create_tasks_table extends Migration
{
    public function safeUp()
    {
        $this->createTable('{{%tasks}}', [
            'id' => $this->primaryKey(),

            'title' => $this->string(200)->notNull(),
            'description' => $this->text(),

            // User who created the task
            'created_by' => $this->integer()->notNull(),

            // Optional individual owner
            'assigned_to' => $this->integer(),

            'priority' => $this->string(20)->notNull()->defaultValue('medium'),
            'status' => $this->string(30)->notNull()->defaultValue('todo'),

            'due_date' => $this->integer(),

            'created_at' => $this->integer()->notNull(),
            'updated_at' => $this->integer()->notNull(),
        ]);

        $this->addForeignKey(
            'fk-tasks-created_by',
            '{{%tasks}}',
            'created_by',
            '{{%users}}',
            'id',
            'CASCADE',
            'CASCADE'
        );

        $this->addForeignKey(
            'fk-tasks-assigned_to',
            '{{%tasks}}',
            'assigned_to',
            '{{%users}}',
            'id',
            'SET NULL',
            'CASCADE'
        );

        $this->createIndex(
            'idx-tasks-created_by',
            '{{%tasks}}',
            'created_by'
        );

        $this->createIndex(
            'idx-tasks-assigned_to',
            '{{%tasks}}',
            'assigned_to'
        );

        $this->createIndex(
            'idx-tasks-status',
            '{{%tasks}}',
            'status'
        );
    }

    public function safeDown()
    {
        $this->dropTable('{{%tasks}}');
    }
}