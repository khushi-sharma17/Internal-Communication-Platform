<?php

use yii\db\Migration;

class m260914_042844_update_team_memberships_table_for_milestone_2 extends Migration
{
    public function safeUp()
    {
        $this->addColumn('{{%team_memberships}}', 'role_id', $this->integer()->null());
        $this->addColumn('{{%team_memberships}}', 'reports_to_user_id', $this->integer()->null());
        $this->addColumn('{{%team_memberships}}', 'status', $this->string(20)->notNull()->defaultValue('active'));

        $this->createIndex(
            'idx-team_memberships-role_id',
            '{{%team_memberships}}',
            'role_id'
        );

        $this->createIndex(
            'idx-team_memberships-reports_to_user_id',
            '{{%team_memberships}}',
            'reports_to_user_id'
        );

        $this->addForeignKey(
            'fk-team_memberships-role_id',
            '{{%team_memberships}}',
            'role_id',
            '{{%roles}}',
            'id',
            'SET NULL',
            'CASCADE'
        );

        $this->addForeignKey(
            'fk-team_memberships-reports_to_user_id',
            '{{%team_memberships}}',
            'reports_to_user_id',
            '{{%users}}',
            'id',
            'SET NULL',
            'CASCADE'
        );
    }

    public function safeDown()
    {
        $this->dropForeignKey(
            'fk-team_memberships-reports_to_user_id',
            '{{%team_memberships}}'
        );

        $this->dropForeignKey(
            'fk-team_memberships-role_id',
            '{{%team_memberships}}'
        );

        $this->dropIndex(
            'idx-team_memberships-reports_to_user_id',
            '{{%team_memberships}}'
        );

        $this->dropIndex(
            'idx-team_memberships-role_id',
            '{{%team_memberships}}'
        );

        $this->dropColumn('{{%team_memberships}}', 'status');
        $this->dropColumn('{{%team_memberships}}', 'reports_to_user_id');
        $this->dropColumn('{{%team_memberships}}', 'role_id');
    }
}