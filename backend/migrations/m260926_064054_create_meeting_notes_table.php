<?php

use yii\db\Migration;

class m260926_064054_create_meeting_notes_table extends Migration
{
    public function safeUp()
    {
        $this->createTable('{{%meeting_notes}}', [
            'id' => $this->primaryKey(),
            'meeting_id' => $this->integer()->notNull(),
            'created_by' => $this->integer()->notNull(),
            'content' => $this->text()->notNull(),
            'ai_summary' => $this->text()->null(),
            'ai_decisions' => $this->text()->null(),
            'ai_action_items' => $this->text()->null(),
            'created_at' => $this->integer()->notNull(),
            'updated_at' => $this->integer()->notNull(),
        ]);

        $this->createIndex(
            'idx-meeting_notes-meeting_id',
            '{{%meeting_notes}}',
            'meeting_id'
        );

        $this->createIndex(
            'idx-meeting_notes-created_by',
            '{{%meeting_notes}}',
            'created_by'
        );

        $this->addForeignKey(
            'fk-meeting_notes-meeting_id',
            '{{%meeting_notes}}',
            'meeting_id',
            '{{%meetings}}',
            'id',
            'CASCADE',
            'CASCADE'
        );

        $this->addForeignKey(
            'fk-meeting_notes-created_by',
            '{{%meeting_notes}}',
            'created_by',
            '{{%users}}',
            'id',
            'RESTRICT',
            'CASCADE'
        );
    }

    public function safeDown()
    {
        $this->dropForeignKey(
            'fk-meeting_notes-created_by',
            '{{%meeting_notes}}'
        );

        $this->dropForeignKey(
            'fk-meeting_notes-meeting_id',
            '{{%meeting_notes}}'
        );

        $this->dropTable('{{%meeting_notes}}');
    }
}