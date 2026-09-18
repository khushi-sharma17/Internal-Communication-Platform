<?php

use yii\db\Migration;

/**
 * Handles the creation of table `{{%conversations}}`.
 */
class m260910_114253_create_conversations_table extends Migration
{
    public function safeUp()
    {
        $this->createTable('{{%conversations}}', [
            'id' => $this->primaryKey(),

            // team, task, or direct 1-to-1 conversation
            'type' => $this->string(30)->notNull(),

            // Optional references depending on conversation type
            'team_id' => $this->integer(),
            'task_id' => $this->integer(),

            'created_by' => $this->integer()->notNull(),
            'created_at' => $this->integer()->notNull(),
        ]);

        $this->addForeignKey(
            'fk-conversations-team_id',
            '{{%conversations}}',
            'team_id',
            '{{%teams}}',
            'id',
            'CASCADE',
            'CASCADE'
        );

        $this->addForeignKey(
            'fk-conversations-created_by',
            '{{%conversations}}',
            'created_by',
            '{{%users}}',
            'id',
            'CASCADE',
            'CASCADE'
        );

        $this->createIndex(
            'idx-conversations-type',
            '{{%conversations}}',
            'type'
        );

        $this->createIndex(
            'idx-conversations-team_id',
            '{{%conversations}}',
            'team_id'
        );
    }

    public function safeDown()
    {
        $this->dropTable('{{%conversations}}');
    }
}