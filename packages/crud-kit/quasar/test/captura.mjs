// Full corporate page, both real bundles and domain JS. Fake transport, no ERP effects.
import { JSDOM, ResourceLoader, VirtualConsole } from 'jsdom';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
const repo=resolve('../../..');
const html=execFileSync('php',['-d','xdebug.mode=off','tests/produccion/CapturaEntregasRfidSmoke.php','--page'],{cwd:repo,encoding:'utf8'});
class Assets extends ResourceLoader {
  fetch(url) {
    const path=new URL(url).pathname;
    if (!path.startsWith('/packages/')&&!path.startsWith('/modulos/Produccion/EntregaProduccionConFichos/')) return Promise.resolve(Buffer.from(''));
    return Promise.resolve(readFileSync(resolve(repo,'.'+path)));
  }
}
const errors=[],calls=[],notices=[];
let lost=false,held=false;
let deliveryRows=null, gateDeliveries=false;
const pendingDeliveries=[];
const row={fentrop_rowid:71,paquete_entrega:100,fecha_entrega:'2026-11-06 10:00:00',fentrop_id_co_op:'001',fentrop_tipo_op:'OPC',fentrop_numero_op:21,
  referencia:'REF',descripcion:'Producto',und:'UND',cantidad:2,saldo_op:8,entrega:'SIN_ENTREGA',estado_entrega:'SIN_ESTADO',
  fentre_usuario_creacion:285,fentre_usuario_creacion__text:'Usuario de prueba',fentre_id_empleado:35,fentre_id_empleado__text:'Empleado de prueba'};
const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
const dom=new JSDOM(html,{url:'http://localhost/',resources:new Assets(),runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,
  beforeParse(w){
    w.matchMedia=()=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
    w.ResizeObserver=class {observe(){}unobserve(){}disconnect(){}};
    w.scrollTo=()=>{};w.Element.prototype.scrollTo=function(){};
    Object.defineProperty(w.screen,'orientation',{value:{type:'landscape-primary',angle:0,addEventListener(){},removeEventListener(){}}});
    w.fetch=async(url,options)=>{
      const u=new URL(url,'http://localhost/');
      const params=Object.fromEntries(options.body.entries());
      const action=u.searchParams.get('action')||params.action,crud=u.searchParams.get('crud')||params.crud;
      calls.push({action,crud,params});
      if (action==='capturar'&&lost) {lost=false;throw new Error('Simulated lost response after capture');}
      let result={Result:'OK'};
      if (action==='list') result={Result:'OK',TotalRecordCount:crud==='entregas-rfid'&&deliveryRows?deliveryRows.length:1,Records:crud==='entregas-rfid'? (deliveryRows||[row]) :
        [{fentrd_rowid:901,fentrd_rowid_entregas_op_encabezado:71,fentrd_FI_Id:9001,f120_referencia:'REF',f120_descripcion:'Producto',fentrd_cantidad:2}]};
      if (action==='autocomplete') result=[{id:285,label:'Usuario de prueba'}];
      if (['capturar','resultado'].includes(action)) result={Result:'OK',data:{serial:9001,id_paquete:100}};
      if (action==='cargar') result={Result:'OK',data:{registrados:2,id_paquete:Number(params.paquete)||100,errores:['Fila 3: EPC invalido.'],incierto:false}};
      if (action==='entregar'&&gateDeliveries) result=await new Promise(resolve=>pendingDeliveries.push(resolve));
      if (held) await new Promise(r=>setTimeout(r,80));
      return {ok:true,json:async()=>result};
    };
  }});
const {window}=dom;
await new Promise(r=>window.addEventListener('load',r));
const tick=(ms=120)=>new Promise(r=>setTimeout(r,ms));
await tick(250);
const doc=window.document,byId=id=>doc.getElementById(id);
let failures=0;
function check(name,ok){console.log(`${ok?'OK':'FAIL'} ${name}`);if(!ok)failures++;}
const button=(scope,label)=>[...scope.querySelectorAll('button')].find(b=>b.textContent.trim()===label);
check('Monta tema, captura y menu de las tres opciones',!!doc.querySelector('.q-layout.uk-layout')&&!!byId('rfid-serial')&&doc.body.textContent.includes('Corte Bloque corto')&&doc.body.textContent.includes('Imprimir fichos RFID desde OP'));
check('No lista automaticamente al abrir',calls.length===0);
const moduleMenu=doc.querySelector('.uk-main .uk-menu--mobile-dropdown');
const collapseMenu=moduleMenu.querySelector('.uk-menu-collapse-toggle');
const allowedLinks=[...moduleMenu.querySelectorAll('.uk-menu-desktop a')].map(a=>a.getAttribute('href'));
collapseMenu.click();await tick();
check('Contraer menu libera ancho y conserva opciones autorizadas',moduleMenu.classList.contains('uk-menu--collapsed')&&collapseMenu.getAttribute('aria-expanded')==='false'&&window.localStorage.getItem('ui-kit:module-menu-collapsed')==='true'&&moduleMenu.querySelectorAll('.uk-menu-desktop a').length===allowedLinks.length&&calls.length===0);
collapseMenu.click();await tick();
check('Expandir recupera las mismas rutas y opcion activa',!moduleMenu.classList.contains('uk-menu--collapsed')&&collapseMenu.getAttribute('aria-expanded')==='true'&&JSON.stringify([...moduleMenu.querySelectorAll('.uk-menu-desktop a')].map(a=>a.getAttribute('href')))===JSON.stringify(allowedLinks)&&!!moduleMenu.querySelector('[aria-current="page"]')&&calls.length===0);
const trigger=doc.querySelector('.uk-menu-mobile-trigger');
check('Menu movil indica la opcion actual',!!trigger&&trigger.textContent.includes('Captura entrega con RFID'));
trigger.click();await tick();
const mobilePopup=doc.querySelector('.uk-menu-mobile-popup');
check('Desplegable conserva las tres rutas autorizadas y opcion activa',mobilePopup?.querySelectorAll('a').length===3
  &&mobilePopup.querySelector('[aria-current="page"]').textContent.includes('Captura entrega con RFID')
  &&[...mobilePopup.querySelectorAll('a')].some(a=>a.href.includes('idOpcion=2'))
  &&[...mobilePopup.querySelectorAll('a')].some(a=>a.href.includes('file=CorteBloqueCorto')));
const mobileLink=[...mobilePopup.querySelectorAll('a')].find(a=>a.href.includes('idOpcion=2'));
mobileLink.addEventListener('click',event=>event.preventDefault());mobileLink.click();await tick(300);
check('Elegir una opcion cierra el desplegable sin registrar datos',!doc.querySelector('.uk-menu-mobile-popup')&&calls.length===0);
const selectMethod=async(name)=>{byId(`rfid-metodos-tab-${name}`).click();await tick();};
check('Abre en la pestaña de lectura de serial',!byId('rfid-metodos-panel-serial').hidden&&byId('rfid-metodos-panel-archivo').hidden);
check('Dos cards independientes con campos de ui-kit/Quasar',!!byId('rfid-card-serial')?.classList.contains('q-card')&&!!byId('rfid-card-archivo')?.classList.contains('q-card')
  &&!!byId('rfid-serial').closest('.q-field--outlined')&&!!byId('rfid-archivo').closest('.q-field--outlined')&&!!byId('rfid-paquete-archivo'));
for (const [id,expected] of [['rfid-info-serial','Enter, Tab o Registrar serial'],['rfid-info-archivo','columna A, desde la fila 2']]) {
  await selectMethod(id==='rfid-info-serial'?'serial':'archivo');
  byId(id).click();await tick();
  check(`Ayuda ${id} explica su metodo sin registrar datos`,doc.querySelector('.q-dialog')?.textContent.includes(expected)&&calls.length===0);
  button(doc.querySelector('.q-dialog'),'Aceptar').click();await tick(300);
}
await selectMethod('serial');
check('APIs de feedback y puente CRUD disponibles',typeof window.UiKitQuasar.notify==='function'&&typeof window.UiKitQuasar.confirm==='function'&&typeof window.CrudKitQuasar.filter==='function');
const originalNotify=window.UiKitQuasar.notify;
window.UiKitQuasar.notify=(text,type)=>{notices.push({text,type});return originalNotify(text,type);};
byId('rfid-serial').value='9001';byId('rfid-serial').dispatchEvent(new window.Event('input',{bubbles:true}));held=true;
byId('rfid-serial').dispatchEvent(new window.KeyboardEvent('keydown',{key:'Tab',bubbles:true,cancelable:true}));
byId('rfid-serial').dispatchEvent(new window.KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));
check('Bloquea doble lectura mientras envia',byId('rfid-serial').disabled&&calls.filter(c=>c.action==='capturar').length===1);
await tick(300);held=false;
check('Captura conserva paquete, limpia serial y actualiza listado',byId('rfid-paquete').value==='100'&&byId('rfid-serial').value===''&&calls.some(c=>c.action==='list'&&c.params.paquete_entrega==='100'));
const capture=calls.find(c=>c.action==='capturar');
check('Captura envia CSRF e identificador unico',capture.params._csrf==='csrf-test'&&/^[0-9a-f]{32}$/.test(capture.params.request_id));
check('Lista nombres de usuario y empleado',doc.body.textContent.includes('Usuario de prueba')&&doc.body.textContent.includes('Empleado de prueba'));
window.CrudKitQuasar.filter('#ck-entregas-rfid',{paquete_entrega:'200'});await tick();
check('El paquete filtrado tambien es el destino de captura',byId('rfid-paquete').value==='200');
window.CrudKitQuasar.filter('#ck-entregas-rfid',{paquete_entrega:'100'});await tick();
const userField=[...doc.querySelectorAll('#ck-entregas-rfid > .ck-crud-quasar > .ck-q-filters .q-field')].find(f=>f.querySelector('.q-field__label')?.textContent==='Usuario');
const userInput=userField.querySelector('input');userInput.value='Usuario';userInput.dispatchEvent(new window.Event('input',{bubbles:true}));
await tick(700);
check('Autocomplete conserva CSRF',calls.some(c=>c.action==='autocomplete'&&c.params._csrf==='csrf-test'));
userInput.dispatchEvent(new window.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));userInput.blur();await tick();
lost=true;byId('rfid-serial').value='9001';byId('rfid-serial').dispatchEvent(new window.Event('input',{bubbles:true}));
byId('rfid-serial-form').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));await tick();
check('Respuesta perdida conserva captura y pide consultar sin reenviar',!byId('rfid-revision').hidden&&byId('rfid-serial').disabled&&byId('rfid-serial').value==='9001');
byId('rfid-cerrar-resultado').click();await tick();
check('Cerrar mensajes no oculta la conciliacion pendiente',byId('rfid-result-area').hidden&&!byId('rfid-revision').hidden&&byId('rfid-serial').disabled);
const countCapture=calls.filter(c=>c.action==='capturar').length;
byId('rfid-consultar').click();await tick();
check('Consultar resultado recupera confirmacion sin repetir captura',byId('rfid-revision').hidden&&calls.filter(c=>c.action==='capturar').length===countCapture&&calls.some(c=>c.action==='resultado'));
check('Un resultado nuevo reabre el panel expandido',!byId('rfid-result-area').hidden&&!byId('rfid-resultado').hidden);
const file=new window.File(['xls-fake'], 'rfid.xls',{type:'application/vnd.ms-excel'});
await selectMethod('archivo');
window.UiKitQuasar.setFieldValue('rfid-paquete-archivo','200');
Object.defineProperty(byId('rfid-archivo'),'files',{value:[file],configurable:true});
byId('rfid-archivo').dispatchEvent(new window.Event('change',{bubbles:true}));await tick();
check('Archivo se selecciona mediante el campo QFile del kit',!!byId('rfid-archivo').closest('.q-file')&&window.UiKitQuasar.getFieldValue('rfid-archivo').name==='rfid.xls');
await selectMethod('serial');
await selectMethod('archivo');
check('Cambiar de pestaña conserva archivo y paquetes',window.UiKitQuasar.getFieldValue('rfid-archivo').name==='rfid.xls'&&byId('rfid-paquete-archivo').value==='200'&&byId('rfid-paquete').value==='100'&&byId('rfid-metodos-panel-serial').hidden&&!byId('rfid-metodos-panel-archivo').hidden);
// jsdom does not implement file input's native validity state for assigned File arrays.
byId('rfid-file-form').reportValidity=()=>true;
byId('rfid-file-form').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));await tick();
check('Carga envia archivo y presenta resultados parciales como texto',calls.some(c=>c.action==='cargar'&&c.params.archivo.name==='rfid.xls')&&byId('rfid-resultado').textContent.includes('Seriales registrados: 2')&&byId('rfid-resultado').textContent.includes('Fila 3: EPC invalido.'));
const resultText=byId('rfid-resultado').textContent,requestsBeforeCollapse=calls.length;
byId('rfid-contraer-resultado').click();await tick();
check('Contraer conserva el resultado y expone Expandir',byId('rfid-resultado').hidden&&!byId('rfid-result-area').hidden&&byId('rfid-contraer-resultado').textContent.includes('Expandir')&&byId('rfid-contraer-resultado').getAttribute('aria-expanded')==='false');
byId('rfid-contraer-resultado').click();await tick();
check('Expandir recupera los mensajes sin consultar ni registrar',!byId('rfid-resultado').hidden&&byId('rfid-resultado').textContent===resultText&&calls.length===requestsBeforeCollapse);
byId('rfid-cerrar-resultado').click();await tick();
check('Cerrar oculta el panel de resultados',byId('rfid-result-area').hidden&&calls.length===requestsBeforeCollapse);
check('Excel usa su paquete sin cambiar el paquete de lectura serial',calls.find(c=>c.action==='cargar').params.paquete==='200'&&byId('rfid-paquete-archivo').value==='200'&&byId('rfid-paquete').value==='100');
const root=byId('ck-entregas-rfid');
root.querySelector('.ck-q-child-button').click();await tick();
check('Detalle vinculado tiene cierre y permiso de eliminar',calls.some(c=>c.crud==='entregas-rfid-seriales'&&c.params.fentrd_rowid_entregas_op_encabezado==='71')&&!!root.querySelector('.ck-q-close-child')&&!!root.querySelector('.ck-q-child-panel tbody button'));
const child=root.querySelector('.ck-q-child-panel');
child.querySelector('tbody tr:first-child td:last-child button').click();await tick();
const dialog=doc.querySelector('.q-dialog');
button(dialog,'Eliminar').click();await tick(250);
check('Eliminar serial avisa y refresca el padre',calls.some(c=>c.crud==='entregas-rfid-seriales'&&c.action==='delete'&&c.params._csrf==='csrf-test')&&calls.filter(c=>c.crud==='entregas-rfid'&&c.action==='list').length>=4);
root.querySelector('.ck-q-close-child').click();await tick();
root.querySelector('tbody .q-checkbox').click();await tick();
button(root,'Generar entregas').click();await tick();
check('Entrega ERP pide confirmacion',!!doc.querySelector('.q-dialog')&&!calls.some(c=>c.action==='entregar'));
button(doc.querySelector('.q-dialog'),'Generar entregas').click();await tick(250);
const send=calls.filter(c=>c.action==='entregar');
check('Entrega ERP envia una sola fila con CSRF',send.length===1&&send[0].params.selected==='[{"fentrop_rowid":71}]'&&send[0].params._csrf==='csrf-test');
deliveryRows=[71,72,73].map(id=>({...row,fentrop_rowid:id}));
await window.CrudKitQuasar.reload('#ck-entregas-rfid');await tick();
root.querySelector('thead .q-checkbox').click();await tick();
gateDeliveries=true;
button(root,'Generar entregas').click();await tick();
button(doc.querySelector('.q-dialog'),'Generar entregas').click();await tick();
const progress=()=>root.querySelector('.ck-q-selection-progress');
const progressBefore=calls.filter(c=>c.action==='entregar').length;
check('Muestra primera entrega en proceso y dos en espera',progress().textContent.includes('0/3')&&progress().querySelectorAll('[data-status="running"]').length===1&&progress().querySelectorAll('[data-status="pending"]').length===2&&pendingDeliveries.length===1);
check('Informa el IdE actual y evita otro envio mientras procesa',progress().querySelector('[role="status"]').textContent.includes('IdE: 71')&&button(root,'Generar entregas').disabled);
pendingDeliveries.shift()({Result:'OK'});await tick();
check('Actualiza al completar cada entrega sin recargar ni enviar en paralelo',progress().textContent.includes('1/3')&&progress().querySelector('[data-status="success"]').textContent.includes('71')&&pendingDeliveries.length===1&&calls.filter(c=>c.action==='entregar').length===progressBefore+1);
pendingDeliveries.shift()({Result:'ERROR',Message:'Sin disponible para la entrega'});await tick();
check('Conserva error por entrega y continua con la siguiente',progress().textContent.includes('2/3')&&progress().querySelector('[data-status="error"]').textContent.includes('Sin disponible')&&progress().querySelector('[data-status="running"]').textContent.includes('73'));
pendingDeliveries.shift()({Result:'OK'});await tick(250);
check('Conserva resumen final con dos exitos, un error y avance completo',progress().textContent.includes('3/3')&&progress().querySelectorAll('[data-status="success"]').length===2&&progress().querySelectorAll('[data-status="error"]').length===1&&progress().getAttribute('aria-busy')==='false'&&calls.filter(c=>c.action==='entregar').length===progressBefore+2);
check('Sin errores de montaje o JavaScript',errors.length===0);
if(errors.length) console.log(errors);
process.exit(failures?1:0);
