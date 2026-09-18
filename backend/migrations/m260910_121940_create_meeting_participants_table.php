<?php

use yii\db\Migration;

class m260910_121940_create_meeting_participants_table extends Migration
{
    public function safeUp()
    {
        $this->createTable('{{%meeting_participants}}', [
            'id' => $this->primaryKey(),

            'meeting_id' => $this->integer()->notNull(),
            'user_id' => $this->integer()->notNull(),

            // invited, accepted, declined, tentative
            'response' => $this->string(20)->notNull()->defaultValue('invited'),

            // Whether the user actually attended
            'attended' => $this->boolean()->notNull()->defaultValue(false),

            'created_at' => $this->integer()->notNull(),
            'updated_at' => $this->integer()->notNull(),
        ]);

        $this->addForeignKey(
            'fk-meeting_participants-meeting_id',
            '{{%meeting_participants}}',
            'meeting_id',
            '{{%meetings}}',
            'id',
            'CASCADE',
            'CASCADE'
        );

        $this->addForeignKey(
            'fk-meeting_participants-user_id',
            '{{%meeting_participants}}',
            'user_id',
            '{{%users}}',
            'id',
            'CASCADE',
            'CASCADE'
        );

        $this->createIndex(
            'idx-meeting_participants-meeting_id',
            '{{%meeting_participants}}',
            'meeting_id'
        );

        $this->createIndex(
            'idx-meeting_participants-user_id',
            '{{%meeting_participants}}',
            'user_id'
        );

        $this->createIndex(
            'unique-meeting-participant',
            '{{%meeting_participants}}',
            ['meeting_id', 'user_id'],
            true
        );
    }

    public function safeDown()
    {
        $this->dropTable('{{%meeting_participants}}');
    }
}