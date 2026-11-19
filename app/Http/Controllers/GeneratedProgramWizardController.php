<?php

namespace App\Http\Controllers;

use App\Support\Menu\GeneratedProgramWizard;
use App\Support\Ui\ErpPage;
use Illuminate\Contracts\Cache\LockTimeoutException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;
use Ivandzb\UiKit\Html;

class GeneratedProgramWizardController extends Controller
{
    public function index(Request $request, GeneratedProgramWizard $wizard, ErpPage $pages): Response|JsonResponse
    {
        $wizard->authorize($request->user());
        if ($request->expectsJson()) {
            $data = $request->validate(['program_id' => ['required', 'integer', 'min:1']]);

            return response()->json(['State' => $wizard->state($data['program_id'], $request->user())]);
        }
        $options = $wizard->options($request->user());
        $config = $options + ['url' => route('access.generator.wizard'), 'token' => csrf_token(),
            'program_id' => $request->integer('program_id'), 'create_url' => route('access.generator')];

        return $pages->render('Asistente de alta de programas', Html::raw(view('program-wizard', compact('config'))->render()), $request->user(),
            scripts: ['js/program-wizard.js?v='.filemtime(public_path('js/program-wizard.js'))]);
    }

    public function run(Request $request, GeneratedProgramWizard $wizard): JsonResponse
    {
        $wizard->authorize($request->user());
        $data = $request->validate(['action' => ['required', 'in:prepare,discover,publish'], 'program_id' => ['required', 'integer', 'min:1'], 'snapshot' => ['required', 'string', 'size:64']]);
        try {
            $state = $data['action'] === 'publish' ? $wizard->publish($request->all(), $request->user())
                : $wizard->prepare($data['program_id'], $data['snapshot'], $request->user(), $data['action'] === 'discover');

            return response()->json(['Result' => 'OK', 'State' => $state]);
        } catch (LockTimeoutException) {
            throw ValidationException::withMessages(['program_id' => 'Hay otra operación en curso sobre este programa. Espere un momento y recargue el asistente.']);
        }
    }
}
