<?php

return [
    'migrated_menu_options' => [
        'access.options' => [
            'label' => 'Permisos de opciones y botones',
            'route' => 'access.options',
        ],
        'access.permissions' => [
            'label' => 'Administración de permisos',
            'route' => 'access.manage',
            'parameters' => ['section' => 'permisos'],
        ],
        'access.users' => [
            'label' => 'Administración de usuarios',
            'route' => 'access.manage',
            'parameters' => ['section' => 'usuarios'],
        ],
    ],
    'legacy_allowed_origins' => ['http://192.168.0.51', 'http://www.intranet.com', 'https://correo.comodisimos.com.co', 'http://www.intranetlocal.com', 'https://posvirtual.comodisimos.com'],
    'legacy_base_url' => env('LEGACY_BASE_URL', 'http://localhost:8083/'),
    'ldap' => [
        'host' => env('LDAP_AUTH_HOST', env('LDAP_HOST', '')),
        'ca_cert' => env('LDAP_CA_CERT', ''),
        'port' => (int) env('LDAP_PORT', 389),
        'base_dn' => env('LDAP_BASE_DN', ''),
        'domain' => env('LDAP_DOMAIN', ''),
        'start_tls' => env('LDAP_START_TLS', false),
        'timeout' => 5,
    ],
];
