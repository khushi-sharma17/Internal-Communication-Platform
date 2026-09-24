<?php

namespace app\components;

use app\models\AuditLog;
use Yii;

class AuditLogger
{
    public static function log(
        string $objectType,
        ?int $objectId,
        string $action,
        $oldValue = null,
        $newValue = null
    ): AuditLog {
        $log = new AuditLog();

        $log->actor_id = Yii::$app->user->isGuest
            ? null
            : (int) Yii::$app->user->id;

        $log->object_type = $objectType;
        $log->object_id = $objectId;
        $log->action = $action;

        $log->old_value_json = $oldValue === null
            ? null
            : json_encode($oldValue);

        $log->new_value_json = $newValue === null
            ? null
            : json_encode($newValue);

        $log->created_at = time();

        if (!$log->save()) {
            Yii::error([
                'message' => 'Failed to create audit log',
                'errors' => $log->errors,
            ], 'audit');

            throw new \RuntimeException('Failed to create audit log.');
        }

        return $log;
    }
}