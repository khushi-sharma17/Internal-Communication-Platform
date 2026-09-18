<?php

use yii\db\Migration;

class m260912_100050_add_auth_token_to_users_table extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->addColumn(
            'users',
            'auth_token',
            $this->string(255)->unique()->null()
        );
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->dropColumn('users', 'auth_token');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m260912_100050_add_auth_token_to_users_table cannot be reverted.\n";

        return false;
    }
    */
}
