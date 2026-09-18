<?php

use yii\db\Migration;

/**
 * Handles the creation of table `{{%permissions}}`.
 */
class m260910_105007_create_permissions_table extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->createTable('{{%permissions}}', [
            'id' => $this->primaryKey(),
            'name' => $this->string(100)->notNull()->unique(),
            'description' => $this->text(),
            'created_at' => $this->integer()->notNull(),
        ]);
    }

    public function safeDown()
    {
        $this->dropTable('{{%permissions}}');
    }
}
