<?php

use yii\db\Migration;

class m260910_121439_add_reminder_fields_to_tasks_table extends Migration
{
    public function safeUp()
    {
        $this->addColumn(
            '{{%tasks}}',
            'reminder_at',
            $this->integer()
        );

        $this->addColumn(
            '{{%tasks}}',
            'reminder_sent',
            $this->boolean()->notNull()->defaultValue(false)
        );

        $this->createIndex(
            'idx-tasks-reminder_at',
            '{{%tasks}}',
            'reminder_at'
        );
    }

    public function safeDown()
    {
        $this->dropColumn('{{%tasks}}', 'reminder_sent');
        $this->dropColumn('{{%tasks}}', 'reminder_at');
    }
}