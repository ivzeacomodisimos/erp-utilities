<?php

return [
    'roles' => [
        'usuario' => ['label' => 'Usuario', 'permissions' => []],
        'administrador' => ['label' => 'Administrador', 'permissions' => ['menu.manage', 'users.manage']],
    ],
    'jwt' => [
        'secret' => env('ERP_JWT_SECRET', ''),
        'issuer' => env('ERP_JWT_ISSUER', 'erp-utilities'),
        'audience' => 'erp-utilities-web-api',
        'ttl_minutes' => 30,
        'session_minutes' => 30,
        'cookie' => 'erp-utilities_access',
        'secure_cookie' => env('ERP_COOKIE_SECURE', ! in_array(env('APP_ENV', 'production'), ['local', 'testing'], true)),
    ],
];
