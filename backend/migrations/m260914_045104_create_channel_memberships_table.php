<?php

use yii\db\Migration;

/**
 * Handles the creation of table `{{%channel_memberships}}`.
 */
class m260914_045104_create_channel_memberships_table extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->createTable('{{%channel_memberships}}', [
            'id' => $this->primaryKey(),
            'channel_id' => $this->integer()->notNull(),
            'user_id' => $this->integer()->notNull(),
            'role_id' => $this->integer()->null(),
            'joined_at' => $this->integer()->notNull(),
            'status' => $this->string(20)->notNull()->defaultValue('active'),
        ]);

        $this->createIndex(
            'idx-channel_memberships-channel_id',
            '{{%channel_memberships}}',
            'channel_id'
        );

        $this->createIndex(
            'idx-channel_memberships-user_id',
            '{{%channel_memberships}}',
            'user_id'
        );

        $this->createIndex(
            'idx-channel_memberships-role_id',
            '{{%channel_memberships}}',
            'role_id'
        );

        $this->createIndex(
            'uq-channel_memberships-channel-user',
            '{{%channel_memberships}}',
            ['channel_id', 'user_id'],
            true
        );

        $this->addForeignKey(
            'fk-channel_memberships-channel_id',
            '{{%channel_memberships}}',
            'channel_id',
            '{{%channels}}',
            'id',
            'CASCADE',
            'CASCADE'
        );

        $this->addForeignKey(
            'fk-channel_memberships-user_id',
            '{{%channel_memberships}}',
            'user_id',
            '{{%users}}',
            'id',
            'CASCADE',
            'CASCADE'
        );

        $this->addForeignKey(
            'fk-channel_memberships-role_id',
            '{{%channel_memberships}}',
            'role_id',
            '{{%roles}}',
            'id',
            'SET NULL',
            'CASCADE'
        );
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->dropForeignKey(
            'fk-channel_memberships-role_id',
            '{{%channel_memberships}}'
        );

        $this->dropForeignKey(
            'fk-channel_memberships-user_id',
            '{{%channel_memberships}}'
        );

        $this->dropForeignKey(
            'fk-channel_memberships-channel_id',
            '{{%channel_memberships}}'
        );

        $this->dropTable('{{%channel_memberships}}');
    }
}