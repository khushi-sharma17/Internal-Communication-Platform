<?php

use yii\db\Migration;

class m260914_043232_update_channels_table_for_milestone_2 extends Migration
{
    public function safeUp()
    {
        $this->addColumn('{{%channels}}', 'visibility', $this->string(20)->notNull()->defaultValue('private'));
        $this->addColumn('{{%channels}}', 'created_by', $this->integer()->null());
        $this->addColumn('{{%channels}}', 'archived_at', $this->integer()->null());

        $this->createIndex(
            'idx-channels-created_by',
            '{{%channels}}',
            'created_by'
        );

        $this->addForeignKey(
            'fk-channels-created_by',
            '{{%channels}}',
            'created_by',
            '{{%users}}',
            'id',
            'SET NULL',
            'CASCADE'
        );
    }

    public function safeDown()
    {
        $this->dropForeignKey(
            'fk-channels-created_by',
            '{{%channels}}'
        );

        $this->dropIndex(
            'idx-channels-created_by',
            '{{%channels}}'
        );

        $this->dropColumn('{{%channels}}', 'archived_at');
        $this->dropColumn('{{%channels}}', 'created_by');
        $this->dropColumn('{{%channels}}', 'visibility');
    }
}