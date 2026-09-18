<?php

use yii\db\Migration;

/**
 * Handles the creation of table `{{%team_memberships}}`.
 */
class m260910_104745_create_team_memberships_table extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->createTable('{{%team_memberships}}', [
            'id' => $this->primaryKey(),
            'team_id' => $this->integer()->notNull(),
            'user_id' => $this->integer()->notNull(),
            'joined_at' => $this->integer()->notNull(),
        ]);

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
        $this->dropTable('{{%team_memberships}}');
    }
}
