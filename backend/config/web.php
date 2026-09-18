<?php

$params = require __DIR__ . '/params.php';
$db = require __DIR__ . '/db.php';

$config = [
    'id' => 'basic',
    'basePath' => dirname(__DIR__),
    'bootstrap' => ['log'],
    'container' => [
        'singletons' => [
            \yii\mail\MailerInterface::class => [
                'class' => \yii\symfonymailer\Mailer::class,
                // send all mails to a file by default.
                'useFileTransport' => true,
                'viewPath' => '@app/mail',
            ],
        ],
    ],
    'aliases' => [
        '@bower' => '@vendor/bower-asset',
        '@npm'   => '@vendor/npm-asset',
    ],
    'components' => [
        'request' => [
            'cookieValidationKey' => 'GqmhIh7QoL9hCPgkZ1ajFaT4gnDWfNQW',
            'parsers' => [
                'application/json' => 'yii\web\JsonParser',
            ],
        ],

        'response' => [
            'class' => 'yii\web\Response',
            'format' => \yii\web\Response::FORMAT_JSON,
            'on beforeSend' => function ($event) {
                $response = $event->sender;
                $response->headers->set('Access-Control-Allow-Origin', 'http://localhost:5173');
                $response->headers->set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
                $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
            },
        ],

        'cache' => [
            'class' => \yii\caching\FileCache::class,
        ],
        'user' => [
            'identityClass' => \app\models\User::class,
            'enableAutoLogin' => true,
        ],
        'errorHandler' => [
            'errorAction' => 'site/error',
        ],
        'mailer' => \yii\mail\MailerInterface::class,
        'log' => [
            'traceLevel' => YII_DEBUG ? 3 : 0,
            'targets' => [
                [
                    'class' => \yii\log\FileTarget::class,
                    'levels' => ['error', 'warning'],
                ],
            ],
        ],
        'db' => $db,
        
        'urlManager' => [
            'enablePrettyUrl' => true,
            'showScriptName' => false,
            'enableStrictParsing' => false,
            'rules' => [
                [
                    'class' => 'yii\rest\UrlRule',
                    'controller' => 'task-watcher',
                ],
                [
                    'class' => 'yii\rest\UrlRule',
                    'controller' => 'task',
                ],
                [
                    'class' => 'yii\rest\UrlRule',
                    'controller' => 'task-assignment',
                ],
                [
                    'class' => 'yii\rest\UrlRule',
                    'controller' => 'task-activity',
                ],
                [
                    'class' => 'yii\rest\UrlRule',
                    'controller' => 'task-dependency',
                ],
                [
                    'class' => 'yii\rest\UrlRule',
                    'controller' => 'organization-unit',
                ],
                [
                    'class' => 'yii\rest\UrlRule',
                    'controller' => 'team',
                    'extraPatterns' => [
                        'GET <id>/members' => 'members',
                        'OPTIONS <id>/members' => 'options',
                        'GET <id>/channels' => 'channels',
                        'OPTIONS <id>/channels' => 'options',
                    ],
                ],
                [
                    'class' => 'yii\rest\UrlRule',
                    'controller' => 'team-membership',
                ],
                [
                    'class' => 'yii\rest\UrlRule',
                    'controller' => 'channel',
                    'extraPatterns' => [
                        'GET <teamId>/channels' => 'index',
                    ],
                ],
                [
                    'class' => 'yii\rest\UrlRule',
                    'controller' => 'channel-membership',
                ],
                [
                    'class' => 'yii\rest\UrlRule',
                    'controller' => 'role',
                ],
                [
                    'class' => 'yii\rest\UrlRule',
                    'controller' => 'permission',
                    'extraPatterns' => [
                        'GET mine' => 'mine',
                        'OPTIONS mine' => 'options',
                    ],
                ],
                [
                    'class' => 'yii\rest\UrlRule',
                    'controller' => 'role-permission',
                ],
                [
                    'class' => 'yii\rest\UrlRule',
                    'controller' => 'user-role',
                ],
                [
                    'class' => 'yii\rest\UrlRule',
                    'controller' => 'user-organization-unit',
                ],
                [
                    'class' => 'yii\rest\UrlRule',
                    'controller' => 'conversation',
                ],
                [
                    'class' => 'yii\rest\UrlRule',
                    'controller' => 'conversation-participant',
                ],
                [
                    'class' => 'yii\rest\UrlRule',
                    'controller' => 'message',
                    'extraPatterns' => [
                        'GET' => 'index',
                        'POST' => 'create',
                        'DELETE <id>' => 'soft-delete',
                        'GET <id>/replies' => 'replies',
                        'POST <id>/mention' => 'mention',
                        'GET <id>/mentions' => 'mentions',
                        'DELETE <id>/mentions/<mentionId>' => 'delete-mention',
                        'POST <id>/upload-attachment' => 'upload-attachment',
                        'OPTIONS <id>/upload-attachment' => 'options',
                        'GET <id>/download-attachment' => 'download-attachment',
                        'OPTIONS <id>/download-attachment' => 'options',
                    ],
                ],

                [
                    'class' => 'yii\rest\UrlRule',
                    'controller' => 'message-reaction',
                    'pluralize' => false,
                    'extraPatterns' => [
                        'GET <messageId>' => 'index',
                        'POST' => 'create',
                        'DELETE <id>' => 'delete',
                    ],
                ],

                [
                    'class' => 'yii\rest\UrlRule',
                    'controller' => 'message-read',
                    'pluralize' => false,
                    'extraPatterns' => [
                        'GET <messageId>' => 'index',
                        'POST' => 'create',
                    ],
                ],

                [
                    'class' => 'yii\rest\UrlRule',
                    'controller' => 'notification',
                    'pluralize' => false,
                    'extraPatterns' => [
                        'GET' => 'index',
                        'POST' => 'create',
                        'PATCH <id>/read' => 'mark-read',
                        'OPTIONS <id>/read' => 'options',
                    ],
                ],

                [
                    'class' => 'yii\rest\UrlRule',
                    'controller' => 'user',
                    'pluralize' => true,
                    'extraPatterns' => [
                        'GET' => 'index',
                        'OPTIONS' => 'options',
                    ],
                ],

            ],
        ],
    
    ],
    'params' => $params,
];

if (YII_ENV_DEV) {
    // configuration adjustments for 'dev' environment
    $config['bootstrap'][] = 'debug';
    $config['modules']['debug'] = [
        'class' => \yii\debug\Module::class,
        // uncomment the following to add your IP if you are not connecting from localhost.
        //'allowedIPs' => ['127.0.0.1', '::1'],
    ];

    $config['bootstrap'][] = 'gii';
    $config['modules']['gii'] = [
        'class' => \yii\gii\Module::class,
        // uncomment the following to add your IP if you are not connecting from localhost.
        //'allowedIPs' => ['127.0.0.1', '::1'],
    ];
}

return $config;
