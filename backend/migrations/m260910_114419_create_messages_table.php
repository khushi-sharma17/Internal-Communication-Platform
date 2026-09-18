<?php

use yii\db\Migration;

/**
 * Handles the creation of table `{{%messages}}`.
 */
class m260910_114419_create_messages_table extends Migration
{
    public function safeUp()
    {
        $this->createTable('{{%messages}}', [
            'id' => $this->primaryKey(),

            'conversation_id' => $this->integer()->notNull(),
            'sender_id' => $this->integer()->notNull(),

            'message' => $this->text()->notNull(),

            'created_at' => $this->integer()->notNull(),
            'updated_at' => $this->integer()->notNull(),
        ]);

        $this->addForeignKey(
            'fk-messages-conversation_id',
            '{{%messages}}',
            'conversation_id',
            '{{%conversations}}',
            'id',
            'CASCADE',
            'CASCADE'
        );

        $this->addForeignKey(
            'fk-messages-sender_id',
            '{{%messages}}',
            'sender_id',
            '{{%users}}',
            'id',
            'CASCADE',
            'CASCADE'
        );

        $this->createIndex(
            'idx-messages-conversation_id',
            '{{%messages}}',
            'conversation_id'
        );

        $this->createIndex(
            'idx-messages-sender_id',
            '{{%messages}}',
            'sender_id'
        );
    }

    public function safeDown()
    {
        $this->dropTable('{{%messages}}');
    }
}