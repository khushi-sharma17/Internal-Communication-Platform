<?php

use yii\db\Migration;

/**
 * Handles the creation of table `{{%audit_logs}}`.
 */
class m260923_050013_create_audit_logs_table extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->createTable('{{%audit_logs}}', [
            'id' => $this->primaryKey(),
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->dropTable('{{%audit_logs}}');
    }
}
