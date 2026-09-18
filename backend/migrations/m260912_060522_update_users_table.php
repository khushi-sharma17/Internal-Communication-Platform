<?php

use yii\db\Migration;

class m260912_060522_update_users_table extends Migration
{
    public function safeUp()
    {
        $this->addColumn(
            '{{%users}}',
            'avatar_path',
            $this->string(255)->null()
        );

        $this->addColumn(
            '{{%users}}',
            'status',
            $this->string(20)->notNull()->defaultValue('active')
        );

        $this->addColumn(
            '{{%users}}',
            'last_seen_at',
            $this->integer()->null()
        );
    }

    public function safeDown()
    {
        $this->dropColumn('{{%users}}', 'last_seen_at');
        $this->dropColumn('{{%users}}', 'status');
        $this->dropColumn('{{%users}}', 'avatar_path');
    }
}