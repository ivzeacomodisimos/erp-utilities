<?php

namespace App\Support\Auth;

use Illuminate\Auth\AuthenticationException;
use LDAP\Connection;
use SensitiveParameter;
use Symfony\Component\HttpKernel\Exception\ServiceUnavailableHttpException;

class LdapAuthenticator
{
    public function normalizeUsername(string $username): string
    {
        $username = strtolower(trim($username));
        if (str_contains($username, '@')) {
            [$username, $domain] = explode('@', $username, 2);
            if ($domain !== strtolower((string) config('erp.ldap.domain'))) {
                throw new AuthenticationException('Credenciales inválidas.');
            }
        }

        if (preg_match('/^[a-z0-9][a-z0-9._-]{0,99}$/D', $username) !== 1) {
            throw new AuthenticationException('Credenciales inválidas.');
        }

        return $username;
    }

    public function authenticate(string $username, #[SensitiveParameter] string $password): DirectoryIdentity
    {
        $username = $this->normalizeUsername($username);
        if (trim($password) === '' || str_contains($password, "\0")) {
            throw new AuthenticationException('Credenciales inválidas.');
        }

        $settings = config('erp.ldap');
        if (! extension_loaded('ldap') || ! $settings['host'] || ! $settings['domain'] || ! $settings['base_dn']) {
            throw new ServiceUnavailableHttpException(null, 'La autenticación corporativa no está disponible.');
        }

        $host = (string) $settings['host'];
        $uri = str_contains($host, '://') ? $host : 'ldap://'.$host.':'.$settings['port'];
        if (! in_array(parse_url($uri, PHP_URL_SCHEME), ['ldap', 'ldaps'], true)
            || parse_url($uri, PHP_URL_USER) || parse_url($uri, PHP_URL_PASS)
            || (! str_starts_with($uri, 'ldaps://') && ! $settings['start_tls'])) {
            throw new ServiceUnavailableHttpException(null, 'La conexión segura con LDAP requiere configuración de Tecnología.');
        }

        $connection = null;
        try {
            if (! empty($settings['ca_cert'])) {
                if (! is_file($settings['ca_cert'])) {
                    throw new ServiceUnavailableHttpException(null, 'La confianza TLS de LDAP requiere configuración.');
                }
                ldap_set_option(null, LDAP_OPT_X_TLS_CACERTFILE, $settings['ca_cert']);
            }

            $connection = ldap_connect($uri);
            ldap_set_option($connection, LDAP_OPT_PROTOCOL_VERSION, 3);
            ldap_set_option($connection, LDAP_OPT_REFERRALS, 0);
            ldap_set_option($connection, LDAP_OPT_NETWORK_TIMEOUT, (int) $settings['timeout']);
            ldap_set_option($connection, LDAP_OPT_TIMELIMIT, (int) $settings['timeout']);
            ldap_set_option($connection, LDAP_OPT_X_TLS_REQUIRE_CERT, LDAP_OPT_X_TLS_DEMAND);

            if ($settings['start_tls'] && ! str_starts_with($uri, 'ldaps://') && ! @ldap_start_tls($connection)) {
                throw new ServiceUnavailableHttpException(null, 'No se pudo validar la conexión segura con LDAP.');
            }

            if (! @ldap_bind($connection, $username.'@'.$settings['domain'], $password)) {
                if (ldap_errno($connection) === 49) {
                    throw new AuthenticationException('Credenciales inválidas o cuenta inactiva.');
                }
                throw new ServiceUnavailableHttpException(null, 'La autenticación corporativa no está disponible.');
            }

            $filter = '(&(objectClass=user)(sAMAccountName='.ldap_escape($username, '', LDAP_ESCAPE_FILTER).'))';
            $result = @ldap_search($connection, $settings['base_dn'], $filter,
                ['sAMAccountName', 'objectGUID', 'userAccountControl', 'displayName'], 0, 2, (int) $settings['timeout']);
            if ($result === false) {
                throw new ServiceUnavailableHttpException(null, 'No se pudo verificar la identidad corporativa.');
            }

            $entries = ldap_get_entries($connection, $result);
            if (($entries['count'] ?? 0) !== 1) {
                throw new AuthenticationException('No se pudo verificar la identidad corporativa.');
            }

            return $this->identityFromEntry($entries[0], $username);
        } catch (AuthenticationException|ServiceUnavailableHttpException $exception) {
            throw $exception;
        } catch (\Throwable) {
            throw new ServiceUnavailableHttpException(null, 'La autenticación corporativa no está disponible.');
        } finally {
            if ($connection instanceof Connection) {
                @ldap_unbind($connection);
            }
        }
    }

    /** @param array<string, mixed> $entry */
    public function identityFromEntry(array $entry, string $expectedUsername): DirectoryIdentity
    {
        $username = strtolower((string) ($entry['samaccountname'][0] ?? ''));
        $flags = $entry['useraccountcontrol'][0] ?? null;
        $guid = $entry['objectguid'][0] ?? '';
        if ($username !== $expectedUsername || ! is_string($flags) || ! ctype_digit($flags)
            || ((int) $flags & 2) !== 0 || strlen($guid) !== 16) {
            throw new AuthenticationException('Credenciales inválidas o cuenta inactiva.');
        }

        return new DirectoryIdentity($username, bin2hex($guid), mb_substr($entry['displayname'][0] ?? $username, 0, 180));
    }
}
