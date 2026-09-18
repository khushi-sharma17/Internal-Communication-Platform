<?php

use yii\db\Migration;

/**
 * Handles the creation of table `{{%user_roles}}`.
 */
class m260910_104146_create_user_roles_table extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->createTable('{{%user_roles}}', [
            'id' => $this->primaryKey(),
            'user_id' => $this->integer()->notNull(),
            'role_id' => $this->integer()->notNull(),
            'created_at' => $this->integer()->notNull(),
        ]);

        $this->addForeignKey(
            'fk-user_roles-user_id',
            '{{%user_roles}}',
            'user_id',
            '{{%users}}',
            'id',
            'CASCADE',
            'CASCADE'
        );

        $this->addForeignKey(
            'fk-user_roles-role_id',
            '{{%user_roles}}',
            'role_id',
            '{{%roles}}',
            'id',
            'CASCADE',
            'CASCADE'
        );

        $this->createIndex(
            'idx-user_roles-user_role',
            '{{%user_roles}}',
            ['user_id', 'role_id'],
            true
        );
    }

    public function safeDown()
    {
        $this->dropTable('{{%user_roles}}');
    }
}
