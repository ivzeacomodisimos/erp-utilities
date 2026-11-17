<?php

namespace App\Http\Middleware;

use App\Support\Auth\JwtTokens;
use Closure;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cookie;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateJwt
{
    public function __construct(private JwtTokens $tokens) {}

    public function handle(Request $request, Closure $next, string $mode = 'web'): Response
    {
        $token = $mode === 'api' || $request->hasHeader('Authorization')
            ? $request->bearerToken() : $request->cookie(config('access.jwt.cookie'));

        try {
            if (! is_string($token) || $token === '') {
                throw new AuthenticationException;
            }

            $context = $this->tokens->authenticate($token);
        } catch (AuthenticationException) {
            if ($mode === 'api' || $request->expectsJson()) {
                return response()->json(['message' => 'Sesión no válida o vencida.'], 401)->header('Cache-Control', 'no-store');
            }

            return redirect()->route('login')->withCookie(Cookie::forget(config('access.jwt.cookie')));
        }

        $request->setUserResolver(fn () => $context['user']);
        $request->attributes->set('jwt.claims', $context['claims']);

        $guard = Auth::guard();
        $guard->setUser($context['user']);
        try {
            $response = $next($request);
            $response->headers->set('Cache-Control', 'no-store');

            return $response;
        } finally {
            $guard->forgetUser();
        }
    }
}
