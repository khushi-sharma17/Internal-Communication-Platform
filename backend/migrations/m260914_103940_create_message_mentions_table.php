<?php

use yii\db\Migration;

class m260914_103940_create_message_mentions_table extends Migration
{
    public function safeUp()
    {
        $this->createTable('{{%message_mentions}}', [
            'id' => $this->primaryKey(),
            'message_id' => $this->integer()->notNull(),
            'user_id' => $this->integer()->notNull(),
            'created_at' => $this->integer()->notNull(),
        ]);

        $this->createIndex(
            'idx-message_mentions-message_id',
            '{{%message_mentions}}',
            'message_id'
        );

        $this->createIndex(
            'idx-message_mentions-user_id',
            '{{%message_mentions}}',
            'user_id'
        );

        $this->createIndex(
            'uq-message_mentions-message-user',
            '{{%message_mentions}}',
            ['message_id', 'user_id'],
            true
        );

        $this->addForeignKey(
            'fk-message_mentions-message_id',
            '{{%message_mentions}}',
            'message_id',
            '{{%messages}}',
            'id',
            'CASCADE',
            'CASCADE'
        );

        $this->addForeignKey(
            'fk-message_mentions-user_id',
            '{{%message_mentions}}',
            'user_id',
            '{{%users}}',
            'id',
            'CASCADE',
            'CASCADE'
        );
    }

    public function safeDown()
    {
        $this->dropForeignKey(
            'fk-message_mentions-user_id',
            '{{%message_mentions}}'
        );

        $this->dropForeignKey(
            'fk-message_mentions-message_id',
            '{{%message_mentions}}'
        );

        $this->dropTable('{{%message_mentions}}');
    }
}