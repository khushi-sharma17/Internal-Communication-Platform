<?php

use yii\db\Migration;

class m260910_121123_create_task_assignments_table extends Migration
{
    public function safeUp()
    {
        $this->createTable('{{%task_assignments}}', [
            'id' => $this->primaryKey(),

            'task_id' => $this->integer()->notNull(),

            // Assignment can be to a user or a team
            'user_id' => $this->integer(),
            'team_id' => $this->integer(),

            'created_at' => $this->integer()->notNull(),
        ]);

        $this->addForeignKey(
            'fk-task_assignments-task_id',
            '{{%task_assignments}}',
            'task_id',
            '{{%tasks}}',
            'id',
            'CASCADE',
            'CASCADE'
        );

        $this->addForeignKey(
            'fk-task_assignments-user_id',
            '{{%task_assignments}}',
            'user_id',
            '{{%users}}',
            'id',
            'CASCADE',
            'CASCADE'
        );

        $this->addForeignKey(
            'fk-task_assignments-team_id',
            '{{%task_assignments}}',
            'team_id',
            '{{%teams}}',
            'id',
            'CASCADE',
            'CASCADE'
        );

        $this->createIndex(
            'idx-task_assignments-task_id',
            '{{%task_assignments}}',
            'task_id'
        );

        $this->createIndex(
            'idx-task_assignments-user_id',
            '{{%task_assignments}}',
            'user_id'
        );

        $this->createIndex(
            'idx-task_assignments-team_id',
            '{{%task_assignments}}',
            'team_id'
        );
    }

    public function safeDown()
    {
        $this->dropTable('{{%task_assignments}}');
    }
}