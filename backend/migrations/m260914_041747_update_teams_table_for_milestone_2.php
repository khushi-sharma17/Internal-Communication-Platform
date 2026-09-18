<?php

use yii\db\Migration;

class m260914_041747_update_teams_table_for_milestone_2 extends Migration
{
    public function safeUp()
    {
        $this->addColumn('{{%teams}}', 'visibility', $this->string(20)->notNull()->defaultValue('private'));
        $this->addColumn('{{%teams}}', 'owner_id', $this->integer()->null());
        $this->addColumn('{{%teams}}', 'default_channel_id', $this->integer()->null());
        $this->addColumn('{{%teams}}', 'status', $this->string(20)->notNull()->defaultValue('active'));

        $this->createIndex(
            'idx-teams-owner_id',
            '{{%teams}}',
            'owner_id'
        );

        $this->addForeignKey(
            'fk-teams-owner_id',
            '{{%teams}}',
            'owner_id',
            '{{%users}}',
            'id',
            'SET NULL',
            'CASCADE'
        );
    }

    public function safeDown()
    {
        $this->dropForeignKey('fk-teams-owner_id', '{{%teams}}');
        $this->dropIndex('idx-teams-owner_id', '{{%teams}}');

        $this->dropColumn('{{%teams}}', 'status');
        $this->dropColumn('{{%teams}}', 'default_channel_id');
        $this->dropColumn('{{%teams}}', 'owner_id');
        $this->dropColumn('{{%teams}}', 'visibility');
    }
}