<?php

use yii\db\Migration;

class m260912_093219_add_manager_id_to_users_table extends Migration
{
    public function safeUp()
    {
        $this->addColumn(
            '{{%users}}',
            'manager_id',
            $this->integer()->null()
        );

        $this->addForeignKey(
            'fk-users-manager_id',
            '{{%users}}',
            'manager_id',
            '{{%users}}',
            'id',
            'SET NULL',
            'CASCADE'
        );

        $this->createIndex(
            'idx-users-manager_id',
            '{{%users}}',
            'manager_id'
        );
    }

    public function safeDown()
    {
        $this->dropForeignKey(
            'fk-users-manager_id',
            '{{%users}}'
        );

        $this->dropIndex(
            'idx-users-manager_id',
            '{{%users}}'
        );

        $this->dropColumn(
            '{{%users}}',
            'manager_id'
        );
    }
}