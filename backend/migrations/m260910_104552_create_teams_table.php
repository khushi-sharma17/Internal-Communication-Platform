<?php

use yii\db\Migration;

/**
 * Handles the creation of table `{{%teams}}`.
 */
class m260910_104552_create_teams_table extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->createTable('{{%teams}}', [
            'id' => $this->primaryKey(),
            'organization_unit_id' => $this->integer()->notNull(),
            'name' => $this->string(150)->notNull(),
            'description' => $this->text(),
            'created_at' => $this->integer()->notNull(),
        ]);

        $this->addForeignKey(
            'fk-teams-organization_unit_id',
            '{{%teams}}',
            'organization_unit_id',
            '{{%organization_units}}',
            'id',
            'CASCADE',
            'CASCADE'
        );
    }

    public function safeDown()
    {
        $this->dropTable('{{%teams}}');
    }
}
