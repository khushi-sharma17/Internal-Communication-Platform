<?php

use yii\db\Migration;

class m260912_055424_update_permissions_table extends Migration
{
    public function safeUp()
    {
        $this->addColumn(
            '{{%permissions}}',
            'name',
            $this->string(100)->notNull()->unique()
        );

        $this->addColumn(
            '{{%permissions}}',
            'description',
            $this->text()
        );

        $this->addColumn(
            '{{%permissions}}',
            'created_at',
            $this->integer()->notNull()
        );
    }

    public function safeDown()
    {
        $this->dropColumn('{{%permissions}}', 'created_at');
        $this->dropColumn('{{%permissions}}', 'description');
        $this->dropColumn('{{%permissions}}', 'name');
    }
}