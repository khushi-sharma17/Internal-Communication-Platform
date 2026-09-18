<?php

use yii\db\Migration;

class m260910_121620_create_meetings_table extends Migration
{
    public function safeUp()
    {
        $this->createTable('{{%meetings}}', [
            'id' => $this->primaryKey(),

            'title' => $this->string(200)->notNull(),
            'agenda' => $this->text(),

            'created_by' => $this->integer()->notNull(),

            'start_time' => $this->integer()->notNull(),
            'end_time' => $this->integer()->notNull(),

            'timezone' => $this->string(50)->notNull()->defaultValue('UTC'),

            'location' => $this->string(255),
            'meeting_link' => $this->string(500),

            'is_recurring' => $this->boolean()->notNull()->defaultValue(false),

            'created_at' => $this->integer()->notNull(),
            'updated_at' => $this->integer()->notNull(),
        ]);

        $this->addForeignKey(
            'fk-meetings-created_by',
            '{{%meetings}}',
            'created_by',
            '{{%users}}',
            'id',
            'CASCADE',
            'CASCADE'
        );

        $this->createIndex(
            'idx-meetings-created_by',
            '{{%meetings}}',
            'created_by'
        );

        $this->createIndex(
            'idx-meetings-start_time',
            '{{%meetings}}',
            'start_time'
        );
    }

    public function safeDown()
    {
        $this->dropTable('{{%meetings}}');
    }
}