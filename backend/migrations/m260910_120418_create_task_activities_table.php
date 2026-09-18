<?php

use yii\db\Migration;

class m260910_120418_create_task_activities_table extends Migration
{
    public function safeUp()
    {
        $this->createTable('{{%task_activities}}', [
            'id' => $this->primaryKey(),

            'task_id' => $this->integer()->notNull(),
            'user_id' => $this->integer()->notNull(),

            'action' => $this->string(50)->notNull(),
            'details' => $this->text(),

            'created_at' => $this->integer()->notNull(),
        ]);

        $this->addForeignKey(
            'fk-task_activities-task_id',
            '{{%task_activities}}',
            'task_id',
            '{{%tasks}}',
            'id',
            'CASCADE',
            'CASCADE'
        );

        $this->addForeignKey(
            'fk-task_activities-user_id',
            '{{%task_activities}}',
            'user_id',
            '{{%users}}',
            'id',
            'CASCADE',
            'CASCADE'
        );

        $this->createIndex(
            'idx-task_activities-task_id',
            '{{%task_activities}}',
            'task_id'
        );

        $this->createIndex(
            'idx-task_activities-user_id',
            '{{%task_activities}}',
            'user_id'
        );
    }

    public function safeDown()
    {
        $this->dropTable('{{%task_activities}}');
    }
}