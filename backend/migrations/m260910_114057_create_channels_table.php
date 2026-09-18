<?php

use yii\db\Migration;

/**
 * Handles the creation of table `{{%channels}}`.
 */
class m260910_114057_create_channels_table extends Migration
{
    public function safeUp()
    {
        $this->createTable('{{%channels}}', [
            'id' => $this->primaryKey(),
            'team_id' => $this->integer()->notNull(),
            'name' => $this->string(100)->notNull(),
            'description' => $this->text(),
            'type' => $this->string(30)->notNull()->defaultValue('team'),
            'created_at' => $this->integer()->notNull(),
        ]);

        $this->addForeignKey(
            'fk-channels-team_id',
            '{{%channels}}',
            'team_id',
            '{{%teams}}',
            'id',
            'CASCADE',
            'CASCADE'
        );

        $this->createIndex(
            'idx-channels-team_id-name',
            '{{%channels}}',
            ['team_id', 'name'],
            true
        );
    }

    public function safeDown()
    {
        $this->dropTable('{{%channels}}');
    }
}