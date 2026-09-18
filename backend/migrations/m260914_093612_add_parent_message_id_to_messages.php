<?php

use yii\db\Migration;

class m260914_093612_add_parent_message_id_to_messages extends Migration
{
    public function safeUp()
    {
        $this->addColumn(
            '{{%messages}}',
            'parent_message_id',
            $this->integer()->null()
        );

        $this->addForeignKey(
            'fk-messages-parent_message_id',
            '{{%messages}}',
            'parent_message_id',
            '{{%messages}}',
            'id',
            'CASCADE',
            'SET NULL'
        );

        $this->createIndex(
            'idx-messages-parent_message_id',
            '{{%messages}}',
            'parent_message_id'
        );
    }

    public function safeDown()
    {
        $this->dropForeignKey(
            'fk-messages-parent_message_id',
            '{{%messages}}'
        );

        $this->dropIndex(
            'idx-messages-parent_message_id',
            '{{%messages}}'
        );

        $this->dropColumn(
            '{{%messages}}',
            'parent_message_id'
        );
    }
}