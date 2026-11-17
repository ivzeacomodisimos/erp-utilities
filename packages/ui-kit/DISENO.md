# Diseño de ui-kit

Sucesor de `cHtml/` (la librería de componentes PHP de la intranet). Mantiene la idea
original y corrige lo que hoy cuesta mantener.

## Lo que se conserva de cHtml

- **Árbol de componentes.** Los elementos se agregan uno dentro de otro, como el DOM.
- **Componentes básicos y compuestos.** Los compuestos se arman con básicos o con otros compuestos.
- **Temas.** Construyen la página: encabezado, laterales, centro y pie.
- **Una sola llamada pinta todo:** `$pagina->getHtml()`.

## Lo que cambia

| cHtml | ui-kit |
|---|---|
| `addHtml()` acepta texto y HTML mezclados, sin escapar | `add()` escapa siempre el texto; el HTML de confianza se pide con `addHtml()` / `Html::raw()` |
| El HTML se arma concatenando etiquetas en cada clase | El árbol describe *qué* es; el renderizador decide *cómo* se pinta |
| Solo HTML | HTML + jQuery o Vue 3 + Quasar, desde el mismo árbol |
| Temas con `head.php` / `footer.php` y variables globales | Un tema es una clase (`Theme`) que devuelve una `Page` |
| `eval()` para crear hijos, propiedades públicas, `count_arrayP` | Clases pequeñas, nombres validados, sin `eval` |

## Patrones

- **Composite.** Los nodos (`Node`, `Container`, `Element`, `Component`) forman el árbol.
- **Strategy.** `Renderer` tiene dos implementaciones: `HtmlRenderer` y `QuasarRenderer`.
- **Template Method / Builder.** `Component::build()` arma el componente con piezas más simples, y es lo que se pinta cuando un renderizador no tiene una vista propia para él.
- **Registry.** Las vistas por clase de componente se registran con `view()`; el registro se hereda por subclase.
- **Facade.** `UiKit` elige el renderizador y crea páginas.
- **Adapter.** `Raw` envuelve objetos heredados (`getHtml()`). `UiKitIntranetTema` adapta los bloques del tema Ig.

## Decisiones

- **Quasar sin compilador de plantillas.** PHP describe el árbol en JSON (`{t, p, c, s}`) y el paquete lo pinta con `h()`. No se evalúa código, el paquete es más liviano (97 KB comprimido) y no hay inyección de plantillas.
- **HTML de confianza con Quasar.** No se entrega a Vue (con `v-html` sus scripts no correrían). Se escribe oculto en la página y `uk-raw` mueve sus nodos al montar, así conserva los manejadores de eventos. Si el bloque desaparece, por ejemplo al cambiar de pestaña, los nodos vuelven al contenedor oculto.
- **CSS en las dos direcciones.** El CSS de Quasar no sale del app ni entra en los bloques `uk-raw`. El CSS global de la página no entra en el marcado de Quasar: se anula con `all: revert`, y las reglas de Quasar tienen especificidad de id gracias a `:is()`.
- **`Ref` en `build()`.** Un componente pinta sus hijos sin adoptarlos, para que se pueda renderizar varias veces.

## En la intranet

- **Tema `UiKit`:** `cHtml/UiKit/head.php` y `footer.php`, con el adaptador en `clases/Framework/UiKitIntranet/`.
- **Cómo se activa:** con `&tema=UiKit` en la URL de cualquier módulo. Para elegir el renderizador se agrega `&tema_render=jquery` o `quasar`; por defecto es `UiKitIntranet::RENDERIZADOR` (jQuery).
- **Preparación:** se reutiliza la del tema Ig (scripts, estilos, barra del módulo). El contenido de los módulos entra como HTML de confianza, así que no cambia nada en ellos.
- **Menú:** `UiKitIntranetMenu` lee las mismas tablas y aplica la misma regla de permisos que `MenuSidebar`. Hace solo dos consultas y no escribe la caché.
- **Inicio nativo:** `indexUiKit.php` reconstruye lo que pinta `index.php` (ingreso, inicio con los bloques del usuario y salida) solo con ui-kit (`UiKitIntranetInicio`). De la intranet usa lo que no pinta: control de acceso, sesión e ingreso (`mainfile.php`/`Usuario`), menú y bloques como datos. Los `?modulo=` siguen en `index.php`.
- **Mientras dure el piloto:** `config.php` toma el tema solo de la URL, así que un script agrega `&tema=UiKit` a los enlaces y formularios propios al navegar.
