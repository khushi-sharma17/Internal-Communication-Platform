<?php

use yii\db\Migration;

class m260914_083353_add_channel_and_visibility_to_conversations extends Migration
{
    public function safeUp()
    {
        $this->addColumn(
            '{{%conversations}}',
            'channel_id',
            $this->integer()->null()
        );

        $this->addColumn(
            '{{%conversations}}',
            'visibility',
            $this->string(20)->notNull()->defaultValue('private')
        );

        $this->addForeignKey(
            'fk-conversations-channel_id',
            '{{%conversations}}',
            'channel_id',
            '{{%channels}}',
            'id',
            'CASCADE',
            'CASCADE'
        );

        $this->createIndex(
            'idx-conversations-channel_id',
            '{{%conversations}}',
            'channel_id'
        );
    }

    public function safeDown()
    {
        $this->dropForeignKey(
            'fk-conversations-channel_id',
            '{{%conversations}}'
        );

        $this->dropIndex(
            'idx-conversations-channel_id',
            '{{%conversations}}'
        );

        $this->dropColumn('{{%conversations}}', 'channel_id');
        $this->dropColumn('{{%conversations}}', 'visibility');
    }
}