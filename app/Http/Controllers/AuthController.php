<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Support\Auth\AccessRoles;
use App\Support\Auth\JwtTokens;
use App\Support\Auth\LoginService;
use App\Support\Ui\ErpPage;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\DB;
use Ivandzb\UiKit\Component\Alert;
use Ivandzb\UiKit\Component\Button;
use Ivandzb\UiKit\Component\Card;
use Ivandzb\UiKit\Html;
use Symfony\Component\HttpFoundation\Cookie as HttpCookie;
use Symfony\Component\HttpKernel\Exception\ServiceUnavailableHttpException;

class AuthController extends Controller
{
    public function __construct(private ErpPage $pages, private JwtTokens $tokens) {}

    public function form(Request $request): Response
    {
        $username = $request->old('username', '');

        return $this->loginPage(is_string($username) ? $username : '', $request->session()->get('auth_error')
            ?? $request->session()->get('errors')?->first());
    }

    public function login(LoginRequest $request, LoginService $login): Response|JsonResponse|RedirectResponse
    {
        $api = $request->routeIs('api.*');
        try {
            $result = $login->login($request->validated('username'), $request->validated('password'), $api ? 'api' : 'web');
        } catch (AuthenticationException) {
            return $this->failed($request, 'Credenciales inválidas o cuenta corporativa inactiva.', 401, $api);
        } catch (AuthorizationException) {
            return $this->failed($request, 'Su cuenta no tiene acceso habilitado en ERP Utilities. Contacte a Tecnología.', 403, $api);
        } catch (ServiceUnavailableHttpException) {
            return $this->failed($request, 'La conexión segura de autenticación no está disponible. Contacte a Tecnología.', 503, $api);
        }

        if ($api) {
            return $this->tokenResponse($result + ['profile' => AccessRoles::profile($result['user'])]);
        }

        $request->session()->regenerate();

        return redirect()->route('dashboard')->withCookie($this->cookie($result['token'], $result['expires_in']));
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(['user' => AccessRoles::profile($request->user())])->header('Cache-Control', 'no-store');
    }

    public function refresh(Request $request): JsonResponse|RedirectResponse
    {
        $result = $this->tokens->rotate($request->attributes->get('jwt.claims'));
        if ($request->routeIs('api.*')) {
            return $this->tokenResponse($result);
        }

        return redirect()->route('dashboard')->withCookie($this->cookie($result['token'], $result['expires_in']));
    }

    public function logout(Request $request): JsonResponse|RedirectResponse
    {
        $this->tokens->revoke($request->attributes->get('jwt.claims'));
        DB::table('erp_access_events')->insert([
            'user_id' => $request->user()->id, 'event' => 'logout', 'actor' => $request->routeIs('api.*') ? 'api' : 'web',
            'details' => null, 'created_at' => now(),
        ]);

        if ($request->routeIs('api.*')) {
            return response()->json(['message' => 'Sesión cerrada.'])->header('Cache-Control', 'no-store');
        }

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login')->withCookie(Cookie::forget(config('access.jwt.cookie')));
    }

    private function loginPage(string $username = '', ?string $error = null, int $status = 200): Response
    {
        $form = Html::form(route('login.submit'), 'post',
            Html::input('hidden', '_token', csrf_token()),
            Html::div(Html::label('Usuario corporativo', 'username'),
                Html::input('text', 'username', $username)->id('username')->addClass('nexo-input')
                    ->attr('autocomplete', 'username')->attr('required', true)->attr('maxlength', 254)
            )->addClass('nexo-field'),
            Html::div(Html::label('Contraseña corporativa', 'password'),
                Html::input('password', 'password')->id('password')->addClass('nexo-input')
                    ->attr('autocomplete', 'current-password')->attr('required', true)->attr('maxlength', 4096)
            )->addClass('nexo-field'),
            Button::make('Ingresar')->type('submit')->icon('login')
        )->attr('autocomplete', 'on');
        $card = Card::make('Acceso corporativo')->subtitle('Use su cuenta de Comodísimos')
            ->add($error ? Alert::error($error) : null, $form,
                Html::p('El menú y los permisos se administran en ERP Utilities.'))
            ->addClass('nexo-login');

        return $this->pages->render('Iniciar sesión', $card, status: $status);
    }

    private function failed(LoginRequest $request, string $message, int $status, bool $api): Response|JsonResponse|RedirectResponse
    {
        if ($api) {
            return response()->json(['message' => $message], $status)->header('Cache-Control', 'no-store');
        }

        if ($status === 503) {
            return $this->loginPage((string) $request->input('username'), $message, 503);
        }

        return redirect()->route('login')->with('auth_error', $message)->withInput(['username' => $request->input('username')]);
    }

    /** @param array<string, mixed> $result */
    private function tokenResponse(array $result): JsonResponse
    {
        $payload = ['access_token' => $result['token'], 'token_type' => 'Bearer', 'expires_in' => $result['expires_in']];
        if (isset($result['profile'])) {
            $payload['user'] = $result['profile'];
        }

        return response()->json($payload)->header('Cache-Control', 'no-store');
    }

    private function cookie(string $token, int $seconds): HttpCookie
    {
        return Cookie::make(config('access.jwt.cookie'), $token, max(1, (int) ceil($seconds / 60)),
            '/', null, (bool) config('access.jwt.secure_cookie'), true, false, 'lax');
    }
}
