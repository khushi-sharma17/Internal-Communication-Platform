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
            'actor_id' => $this->integer()->null(),
            'object_type' => $this->string(100)->notNull(),
            'object_id' => $this->integer()->null(),
            'action' => $this->string(100)->notNull(),
            'old_value_json' => $this->text()->null(),
            'new_value_json' => $this->text()->null(),
            'created_at' => $this->integer()->notNull(),
        ]);

        $this->createIndex(
            'idx-audit_logs-actor_id',
            '{{%audit_logs}}',
            'actor_id'
        );

        $this->createIndex(
            'idx-audit_logs-object',
            '{{%audit_logs}}',
            ['object_type', 'object_id']
        );

        $this->createIndex(
            'idx-audit_logs-created_at',
            '{{%audit_logs}}',
            'created_at'
        );
    }

    
    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->dropTable('{{%audit_logs}}');
    }
}
