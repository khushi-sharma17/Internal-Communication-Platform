<?php

use yii\db\Migration;

class m260917_044523_add_manager_status_updated_at_to_organization_units extends Migration
{
    
    public function safeUp()
    {
        $this->addColumn(
            '{{%organization_units}}',
            'manager_id',
            $this->integer()->null()->after('parent_id')
        );

        $this->addColumn(
            '{{%organization_units}}',
            'status',
            $this->string(50)->notNull()->defaultValue('active')->after('type')
        );

        $this->addColumn(
            '{{%organization_units}}',
            'updated_at',
            $this->integer()->null()->after('created_at')
        );

        $this->addForeignKey(
            'fk-organization_units-manager_id',
            '{{%organization_units}}',
            'manager_id',
            '{{%users}}',
            'id',
            'SET NULL',
            'CASCADE'
        );
    }

    public function safeDown()
    {
        $this->dropForeignKey(
            'fk-organization_units-manager_id',
            '{{%organization_units}}'
        );

        $this->dropColumn('{{%organization_units}}', 'updated_at');
        $this->dropColumn('{{%organization_units}}', 'status');
        $this->dropColumn('{{%organization_units}}', 'manager_id');
    }
    
}
