<?php

use yii\db\Migration;

/**
 * Handles the creation of table `{{%roles}}`.
 */
class m260910_103948_create_roles_table extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->createTable('{{%roles}}', [
            'id' => $this->primaryKey(),
            'name' => $this->string(100)->notNull()->unique(),
            'description' => $this->text(),
            'created_at' => $this->integer()->notNull(),
        ]);
    }

    public function safeDown()
    {
        $this->dropTable('{{%roles}}');
    }
}
