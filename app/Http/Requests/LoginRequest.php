<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'username' => ['required', 'string', 'max:254'],
            'password' => ['required', 'string', 'max:4096'],
        ];
    }

    public function messages(): array
    {
        return [
            'username.required' => 'Ingrese su usuario corporativo.',
            'password.required' => 'Ingrese su contraseña corporativa.',
        ];
    }
}
