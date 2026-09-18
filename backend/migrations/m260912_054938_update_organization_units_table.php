<?php

use yii\db\Migration;

class m260912_054938_update_organization_units_table extends Migration
{
    public function safeUp()
    {
        $this->addColumn(
            '{{%organization_units}}',
            'parent_id',
            $this->integer()->null()
        );

        $this->addColumn(
            '{{%organization_units}}',
            'name',
            $this->string(150)->notNull()
        );

        $this->addColumn(
            '{{%organization_units}}',
            'type',
            $this->string(50)->notNull()
        );

        $this->addColumn(
            '{{%organization_units}}',
            'created_at',
            $this->integer()->notNull()
        );

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
        $this->dropForeignKey(
            'fk-organization_units-parent_id',
            '{{%organization_units}}'
        );

        $this->dropColumn('{{%organization_units}}', 'created_at');
        $this->dropColumn('{{%organization_units}}', 'type');
        $this->dropColumn('{{%organization_units}}', 'name');
        $this->dropColumn('{{%organization_units}}', 'parent_id');
    }
}