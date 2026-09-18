<?php

use yii\db\Migration;

/**
 * Handles the creation of table `{{%user_organization_units}}`.
 */
class m260910_110205_create_user_organization_units_table extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->createTable('{{%user_organization_units}}', [
            'id' => $this->primaryKey(),
            'user_id' => $this->integer()->notNull(),
            'organization_unit_id' => $this->integer()->notNull(),
            'created_at' => $this->integer()->notNull(),
        ]);

        $this->addForeignKey(
            'fk-user_org_units-user_id',
            '{{%user_organization_units}}',
            'user_id',
            '{{%users}}',
            'id',
            'CASCADE',
            'CASCADE'
        );

        $this->addForeignKey(
            'fk-user_org_units-unit_id',
            '{{%user_organization_units}}',
            'organization_unit_id',
            '{{%organization_units}}',
            'id',
            'CASCADE',
            'CASCADE'
        );

        $this->createIndex(
            'idx-user_org_units-user-unit',
            '{{%user_organization_units}}',
            ['user_id', 'organization_unit_id'],
            true
        );
    }

    public function safeDown()
    {
        $this->dropTable('{{%user_organization_units}}');
    }
}
