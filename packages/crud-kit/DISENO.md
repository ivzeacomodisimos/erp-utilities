# ivandzb/crud-kit — Diseño

Estado: **aprobado; núcleo y piloto Sectores v2 implementados** (ver `README.md` y `modulos/logistica/SectoresV2.php`).

- Paquete: `ivandzb/crud-kit` (GitHub y Composer)
- Namespace: `Ivandzb\CrudKit`
- API en inglés; este documento de diseño en español (interno). El README público irá en inglés.

## 1. Qué es y qué no es

Un paquete PHP para construir pantallas CRUD (listar, filtrar, crear, editar, borrar,
tablas hijas) a partir de una **definición**. Toma las ideas de jtable.org —campos
declarados, protocolo simple con el servidor, paginación/orden/filtros en el servidor—
pero no depende de la intranet ni de jQuery.

- **No reemplaza** al framework actual (`cHtml/ControlesWeb/mantenimiento_jtable`): las 96
  pantallas existentes siguen con él, sin cambios. Un módulo pasa a crud-kit cuando alguien lo toque.
- **Es reutilizable**: el núcleo no conoce la intranet. Todo lo propio de la intranet (conexiones,
  permisos, consecutivos, páginas con tema) vive en un adaptador aparte, dentro del repositorio
  de la intranet.
- **El renderizador es intercambiable**: el primero usa jTable 2.4.0 (ya instalado); más adelante
  se agrega uno en Vue 3 sin cambiar las definiciones ni el servidor.
- **PHP 7.2 o superior**, sin nada deprecado en 8.x (lo usan la intranet 7.2, broker-workers 8.1
  y api-producer 8.4).

## 2. Estructura

```
packages/crud-kit/                    paquete independiente (composer.json propio)
  src/
    Definition/     Crud, Field (text, number, select, date, autocomplete, ...),
                    Filter, Rules, Child, Action
    Data/           DataSource (interfaz), TableDataSource (SQL parametrizado), Query, Page
    Server/         Dispatcher: list, create, update, delete, options, autocomplete,
                    acciones propias; validación; permisos; hooks
    Ports/          Interfaces que implementa cada proyecto: Connection, Permissions,
                    Sequences, Translator
    Render/
      JTable/       Renderizador jTable 2.4.0: definición → objeto de configuración jTable (JSON)
  assets/           CSS acotado al contenedor, tema azul, traducciones (es, en, ...)
  tests/            Pruebas sin intranet ni base real (conexión en memoria)
  README.md         documentación pública (inglés)

clases/Framework/CrudKitIntranet/     adaptador de la intranet (fuera del paquete)
  IntranetConnection     envuelve MySQL_DB / MsSQL_DB
  IntranetPermissions    intranetopcionespermisos
  IntranetSequences      NS
  IntranetPage           pinta en la página con el tema (head/footer, tdBloqueCentro) y enruta
```

La intranet lo instala como dependencia local de Composer (`"type": "path"`); otro proyecto, con
`composer require ivandzb/crud-kit` cuando esté publicado.

## 3. Cómo se escribe un mantenimiento — Sectores, antes y después

**Hoy (v1)** — `modulos/logistica/Sectores.php`, 85 líneas:

```php
class Sectores extends Mantenimiento_JTable
{
  function __construct($db)
  {
    global $acceso;
    parent::__construct($db);
    $this->repository = new SectoresRepository($db);
    $this->asignarNombreTabla($this->repository->leer());
    $this->definirAction("index.php?modulo=logistica&file=mant_lista_picking&idMenu=...&nombreOpcion=Sectores", "Grabar");
    $this->asignarMensajes("_TITULO", '<div class="lista-picking-titulo-configuracion"><strong>Sectores de entrega</strong></div>');
    $this->formulario("Nombre", "fSectores");
    $this->addCampo_TextBox("idsector", 0, "0", "", 1, "Id Sector", 1, 0, array(), 0, 2, 2, null, null, null, 1);
    $this->campo("idsector")->creable(true);
    $this->addCampo_TextBox("Descripcion", 1, $_REQUEST["Descripcion"], "", 1, "Titulo", 1, 1, array(), 0, 80, 20);
    $this->addCampo_Lista("Activo", 1, $_REQUEST["Activo"], null, 1, "Estado", 1, 1, $this->repository->sqlEstado());
    $this->permiteBorrarRegistro($acceso['E'] == 1);
    // ... más configuración de opciones
  }

  function action($data = null)
  {
    // try/catch para hacer editable la clave solo al crear y releer el registro
  }
}
```

**Con crud-kit** — una definición, sin clase ni `action()`:

```php
use Ivandzb\CrudKit\Definition\Crud;
use Ivandzb\CrudKit\Definition\Field;

return Crud::make('sectores')
  ->title('Sectores de entrega')
  ->table("{$GLOBALS['dbnameMIntranet']}.maestros.sectordespacho")
  ->fields(
    Field::text('idsector', 'Id Sector')->key()->onlyOnCreate()->filterable()
      ->rules(['required' => true, 'maxLength' => 2]),
    Field::text('Descripcion', 'Título')->width('60%')
      ->rules(['required' => true, 'maxLength' => 80]),
    Field::select('Activo', 'Estado', [1 => 'Activo', 0 => 'Inactivo'])
  )
  ->permissions(['delete' => 'E'])       // se resuelve con el adaptador de permisos
  ->messages(['loadingMessage' => 'Cargando sectores...']);
```

Lo que el paquete resuelve solo, sin código del módulo: el JSON de jTable, listar con
paginación/orden/filtro en el servidor, crear/editar/borrar con SQL parametrizado, validar en el
navegador y en el servidor con la misma regla, permisos, mensajes de error y traducción.

## 4. Capacidades nuevas frente a v1

| | v1 (actual) | crud-kit |
|---|---|---|
| Definición | `addCampo_*` con hasta 18 parámetros posicionales, o arreglo | API fluida con autocompletado del IDE; la definición se puede volcar a JSON |
| SQL | Texto con valores escapados | Consultas parametrizadas (binding real) |
| Validaciones | A mano en `alAntesDeGuardar` | Declaradas una vez (`rules`); se aplican en navegador y servidor |
| Listas | Consultan la base al pintar la página | Acción `options` con caché en jTable; cascadas (`dependsOn`) declarativas |
| Opciones de jTable | Solo las que el framework expone | Atajos para las comunes + `->jtable([...])` para pasar cualquier opción documentada |
| Eventos de jTable | 9 | Todos, incluidos `rowInserted`, `rowUpdated`, `selectionChanged`, `closeRequested` |
| Ids en la página | Globales (`#LoadRecordsButton`, `#campo`) | Con prefijo del CRUD: varios en la misma página sin choques |
| Textos | De jTable traducibles; los del framework fijos | Todos traducibles y ajustables por pantalla |
| Sesión expirada | Pantalla cargando sin explicación | Redirección configurable (`unAuthorizedRequestRedirectUrl`) |
| Pruebas | No hay | Del núcleo sin base real + prueba de humo por CRUD |
| Otra tecnología | Atado a jTable | Renderizador intercambiable (Vue 3 más adelante) |

## 5. Contrato con el navegador

Cada CRUD tiene un id (`sectores`) y atiende sus operaciones en la misma URL de la página, con
`crud=<id>&action=<operación>`:

| Acción | Recibe | Responde |
|---|---|---|
| `list` | filtros, `jtStartIndex`, `jtPageSize`, `jtSorting` | `{Result, Records, TotalRecordCount}` |
| `create` / `update` | campos del formulario | `{Result, Record}` o `{Result: "ERROR", Message, Errors: {campo: mensaje}}` |
| `delete` | clave | `{Result}` |
| `options` | `field` y valores de los que depende | `{Result, Options: [{Value, DisplayText}]}` |
| `autocomplete` | `field`, `term` | `[{id, value, label}]` |
| acción propia | lo que defina | lo que devuelva su función |

Es el protocolo de jTable, así que el renderizador jTable lo usa sin adaptaciones y el de Vue 3
lo consume igual.

## 6. Puertos (lo que cada proyecto conecta)

| Puerto | Responsabilidad | En la intranet |
|---|---|---|
| `Connection` | Ejecutar SQL parametrizado y devolver filas | `MySQL_DB` / `MsSQL_DB` con `sql_query_params` |
| `Permissions` | ¿El usuario puede crear/modificar/borrar? | `intranetopcionespermisos` / `$acceso` |
| `Sequences` | Siguiente número de un tipo de documento | `NS` |
| `Translator` | Textos del paquete | archivo de idioma del paquete |
| `Page` (solo adaptador) | Insertar el HTML/JS en la página y enrutar las acciones | tema actual, `tdBloqueCentro` |

## 7. Coexistencia con v1

- Ids, clases CSS y eventos con prefijo propio (`ck-`): una pantalla puede tener un padre v1 y un
  hijo crud-kit, o al revés, sin pisarse.
- Usa los mismos archivos de jTable ya cargados por los temas; trae su propio CSS acotado.
- El piloto queda como opción nueva del menú ("Sectores v2") junto a la actual. La vieja se
  retira cuando la nueva se aprueba.

## 8. Pruebas

- **Núcleo**: la definición genera el JSON de jTable esperado; validaciones; SQL parametrizado;
  despacho de acciones. Con una conexión en memoria, sin base real.
- **Adaptador intranet**: contra el ambiente de pruebas (MySQL 192.168.0.117, SQL Server
  192.168.0.74 `Siesa_Pruebas`): listar y CRUD completo del piloto.
- **JS generado**: sintaxis válida con `node --check`, en archivos con saltos LF y CRLF.

## 9. Plan

1. Revisión de este diseño (aquí).
2. Núcleo: definición, renderizador jTable, servidor (list/create/update/delete), puertos,
   pruebas.
3. Adaptador de la intranet + **Sectores v2** lado a lado con el actual.
4. Documento "antes / después" de Sectores.
5. Ampliación: listas por `options`, autocompletar, acciones propias, validaciones completas,
   tablas hijas → **Items y volumen v2**.
6. Más adelante: renderizador Vue 3.

## 10. Decisiones

Tomadas:

- **Nombre**: `ivandzb/crud-kit`, namespace `Ivandzb\CrudKit`, API en inglés.
- **Ubicación**: `packages/crud-kit/` dentro de este repositorio mientras se desarrolla; luego
  pasa a su propio repositorio en GitHub (`ivandzb/crud-kit`).

Pendientes:

1. **Propiedad y licencia**: confirmar con la empresa que el código puede publicarse en el
   GitHub personal, y elegir licencia (propuesta: MIT). El paquete no contiene nada propio de la
   empresa (tablas, IPs, conexiones, permisos): eso queda en el adaptador de la intranet.
2. **Tipos de datos en las respuestas**: con consultas parametrizadas en MySQL, los números llegan
   como números (`"Activo": 1`) y no como texto (`"Activo": "1"`). En crud-kit no hay módulos
   viejos que dependan del texto, así que se propone aceptarlo.
3. **Definición**: API fluida en PHP (con autocompletado del IDE), con opción de exportarla a JSON.
   El arreglo declarativo de v1 no se trae a crud-kit.
