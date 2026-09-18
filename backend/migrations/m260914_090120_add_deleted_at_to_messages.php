<?php

use yii\db\Migration;

class m260914_090120_add_deleted_at_to_messages extends Migration
{
    public function safeUp()
    {
        $this->addColumn(
            '{{%messages}}',
            'deleted_at',
            $this->integer()->null()
        );
    }

    public function safeDown()
    {
        $this->dropColumn(
            '{{%messages}}',
            'deleted_at'
        );
    }
}