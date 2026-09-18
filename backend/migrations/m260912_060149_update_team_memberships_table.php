<?php

use yii\db\Migration;

class m260912_060149_update_team_memberships_table extends Migration
{
    public function safeUp()
    {
        $this->addColumn(
            '{{%team_memberships}}',
            'team_id',
            $this->integer()->notNull()
        );

        $this->addColumn(
            '{{%team_memberships}}',
            'user_id',
            $this->integer()->notNull()
        );

        $this->addColumn(
            '{{%team_memberships}}',
            'joined_at',
            $this->integer()->notNull()
        );

        $this->addForeignKey(
            'fk-team_memberships-team_id',
            '{{%team_memberships}}',
            'team_id',
            '{{%teams}}',
            'id',
            'CASCADE',
            'CASCADE'
        );

        $this->addForeignKey(
            'fk-team_memberships-user_id',
            '{{%team_memberships}}',
            'user_id',
            '{{%users}}',
            'id',
            'CASCADE',
            'CASCADE'
        );

        $this->createIndex(
            'idx-team_memberships-team-user',
            '{{%team_memberships}}',
            ['team_id', 'user_id'],
            true
        );
    }

    public function safeDown()
    {
        $this->dropForeignKey(
            'fk-team_memberships-team_id',
            '{{%team_memberships}}'
        );

        $this->dropForeignKey(
            'fk-team_memberships-user_id',
            '{{%team_memberships}}'
        );

        $this->dropIndex(
            'idx-team_memberships-team-user',
            '{{%team_memberships}}'
        );

        $this->dropColumn('{{%team_memberships}}', 'joined_at');
        $this->dropColumn('{{%team_memberships}}', 'user_id');
        $this->dropColumn('{{%team_memberships}}', 'team_id');
    }
}