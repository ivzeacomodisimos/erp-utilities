<?php

namespace App\Support\Auth;

readonly class DirectoryIdentity
{
    public function __construct(
        public string $username,
        public string $guid,
        public string $name,
    ) {}
}
