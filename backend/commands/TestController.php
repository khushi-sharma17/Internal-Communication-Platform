<?php

namespace app\commands;

use yii\console\Controller;

class TestController extends Controller
{
    public function actionHierarchy()
    {
        $user = \app\models\User::findOne(2);

        echo "User 2 manager: " . $user->manager->name . PHP_EOL;

        $manager = \app\models\User::findOne(1);

        echo "User 1 subordinate: " . $manager->subordinates[0]->name . PHP_EOL;
    }

    public function actionRbac()
    {
        $user = \app\models\User::findIdentityByAccessToken('user2-test-token-12345');

        if ($user) {
            echo "Authenticated User: " . $user->name . PHP_EOL;
            echo "User ID: " . $user->getId() . PHP_EOL;

            $hasPermission = \app\components\Rbac::hasPermission(
                $user->getId(),
                'view_channels'
            );

            if ($hasPermission) {
                echo "RBAC: Permission granted" . PHP_EOL;
            } else {
                echo "RBAC: Permission denied" . PHP_EOL;
            }
        } else {
            echo "Authentication failed" . PHP_EOL;
        }
    }

    public function actionRelationships()
    {
        $team = \app\models\Team::findOne(2);

        if (!$team) {
            echo "Team not found" . PHP_EOL;
            return;
        }

        echo "Team: " . $team->name . PHP_EOL;
        echo "Channels: " . $team->getChannels()->count() . PHP_EOL;
        echo "Team Memberships: " . $team->getTeamMemberships()->count() . PHP_EOL;

        $channel = \app\models\Channel::findOne(2);

        if ($channel) {
            echo "Channel: " . $channel->name . PHP_EOL;
            echo "Channel Team: " . $channel->team->name . PHP_EOL;
            echo "Channel Memberships: " . $channel->getChannelMemberships()->count() . PHP_EOL;
        }
    }
}