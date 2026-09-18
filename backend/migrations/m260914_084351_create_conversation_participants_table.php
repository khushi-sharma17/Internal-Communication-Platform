<?php

use yii\db\Migration;

class m260914_084351_create_conversation_participants_table extends Migration
{
    public function safeUp()
    {
        $this->createTable('{{%conversation_participants}}', [
            'id' => $this->primaryKey(),

            'conversation_id' => $this->integer()->notNull(),
            'user_id' => $this->integer()->notNull(),

            'role' => $this->string(20)->notNull()->defaultValue('member'),

            'joined_at' => $this->integer()->notNull(),

            'muted_until' => $this->integer()->null(),

            'last_read_message_id' => $this->integer()->null(),
        ]);

        $this->addForeignKey(
            'fk-conversation-participants-conversation_id',
            '{{%conversation_participants}}',
            'conversation_id',
            '{{%conversations}}',
            'id',
            'CASCADE',
            'CASCADE'
        );

        $this->addForeignKey(
            'fk-conversation-participants-user_id',
            '{{%conversation_participants}}',
            'user_id',
            '{{%users}}',
            'id',
            'CASCADE',
            'CASCADE'
        );

        $this->createIndex(
            'idx-conversation-participants-conversation_id',
            '{{%conversation_participants}}',
            'conversation_id'
        );

        $this->createIndex(
            'idx-conversation-participants-user_id',
            '{{%conversation_participants}}',
            'user_id'
        );

        $this->createIndex(
            'idx-conversation-participants-unique',
            '{{%conversation_participants}}',
            ['conversation_id', 'user_id'],
            true
        );
    }

    public function safeDown()
    {
        $this->dropTable('{{%conversation_participants}}');
    }
}