<?php

use yii\db\Migration;

/**
 * Handles the creation of table `{{%role_permissions}}`.
 */
class m260910_105921_create_role_permissions_table extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->createTable('{{%role_permissions}}', [
            'id' => $this->primaryKey(),
            'role_id' => $this->integer()->notNull(),
            'permission_id' => $this->integer()->notNull(),
            'created_at' => $this->integer()->notNull(),
        ]);

        $this->addForeignKey(
            'fk-role_permissions-role_id',
            '{{%role_permissions}}',
            'role_id',
            '{{%roles}}',
            'id',
            'CASCADE',
            'CASCADE'
        );

        $this->addForeignKey(
            'fk-role_permissions-permission_id',
            '{{%role_permissions}}',
            'permission_id',
            '{{%permissions}}',
            'id',
            'CASCADE',
            'CASCADE'
        );

        $this->createIndex(
            'idx-role_permissions-role-permission',
            '{{%role_permissions}}',
            ['role_id', 'permission_id'],
            true
        );
    }

    public function safeDown()
    {
        $this->dropTable('{{%role_permissions}}');
    }
}
