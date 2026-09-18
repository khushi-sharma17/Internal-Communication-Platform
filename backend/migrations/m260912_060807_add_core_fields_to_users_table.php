<?php

use yii\db\Migration;

class m260912_060807_add_core_fields_to_users_table extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
{
    // Add columns as nullable first
    $this->addColumn('{{%users}}', 'name', $this->string(100)->null());
    $this->addColumn('{{%users}}', 'email', $this->string(150)->null());
    $this->addColumn('{{%users}}', 'password_hash', $this->string()->null());
    $this->addColumn('{{%users}}', 'created_at', $this->integer()->null());
    $this->addColumn('{{%users}}', 'updated_at', $this->integer()->null());

    // Fill existing test users
    $this->update('{{%users}}', [
        'name' => 'Test User 1',
        'email' => 'testuser1@example.com',
        'password_hash' => 'temporary_hash_1',
        'created_at' => time(),
        'updated_at' => time(),
    ], ['id' => 1]);

    $this->update('{{%users}}', [
        'name' => 'Test User 2',
        'email' => 'testuser2@example.com',
        'password_hash' => 'temporary_hash_2',
        'created_at' => time(),
        'updated_at' => time(),
    ], ['id' => 2]);

    // Make required fields NOT NULL
    $this->alterColumn('{{%users}}', 'name', $this->string(100)->notNull());
    $this->alterColumn('{{%users}}', 'email', $this->string(150)->notNull());
    $this->alterColumn('{{%users}}', 'password_hash', $this->string()->notNull());
    $this->alterColumn('{{%users}}', 'created_at', $this->integer()->notNull());
    $this->alterColumn('{{%users}}', 'updated_at', $this->integer()->notNull());

    // Email must be unique
    $this->createIndex(
        'unique-users-email',
        '{{%users}}',
        'email',
        true
    );
}

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        echo "m260912_060807_add_core_fields_to_users_table cannot be reverted.\n";

        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m260912_060807_add_core_fields_to_users_table cannot be reverted.\n";

        return false;
    }
    */
}
