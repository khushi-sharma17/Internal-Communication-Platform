<?php

use yii\db\Migration;

class m260912_055832_update_teams_table extends Migration
{
    public function safeUp()
    {
        $this->addColumn(
            '{{%teams}}',
            'organization_unit_id',
            $this->integer()->notNull()
        );

        $this->addColumn(
            '{{%teams}}',
            'name',
            $this->string(150)->notNull()
        );

        $this->addColumn(
            '{{%teams}}',
            'description',
            $this->text()
        );

        $this->addColumn(
            '{{%teams}}',
            'created_at',
            $this->integer()->notNull()
        );

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
        $this->dropForeignKey(
            'fk-teams-organization_unit_id',
            '{{%teams}}'
        );

        $this->dropColumn('{{%teams}}', 'created_at');
        $this->dropColumn('{{%teams}}', 'description');
        $this->dropColumn('{{%teams}}', 'name');
        $this->dropColumn('{{%teams}}', 'organization_unit_id');
    }
}