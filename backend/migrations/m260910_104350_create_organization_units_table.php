<?php

use yii\db\Migration;

/**
 * Handles the creation of table `{{%organization_units}}`.
 */
class m260910_104350_create_organization_units_table extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->createTable('{{%organization_units}}', [
            'id' => $this->primaryKey(),
            'parent_id' => $this->integer(),
            'name' => $this->string(150)->notNull(),
            'type' => $this->string(50)->notNull(),
            'created_at' => $this->integer()->notNull(),
        ]);

        $this->addForeignKey(
            'fk-organization_units-parent_id',
            '{{%organization_units}}',
            'parent_id',
            '{{%organization_units}}',
            'id',
            'CASCADE',
            'CASCADE'
        );
    }

    public function safeDown()
    {
        $this->dropTable('{{%organization_units}}');
    }
}
