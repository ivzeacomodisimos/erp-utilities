// Actual RFID schema + built bundle, entirely simulated network/printer.
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const schema=JSON.parse(execFileSync('php',['../../../tests/produccion/ImpresionFichosRfidSmoke.php','--schema'],{encoding:'utf8'}).replace(/^[^{]*/,''));
const dom=new JSDOM('<!doctype html><html><body><div id="rfid"></div></body></html>',{url:'http://localhost/',pretendToBeVisual:true,runScripts:'outside-only'});
const {window}=dom;
window.matchMedia=()=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
window.ResizeObserver=class {observe(){} unobserve(){} disconnect(){}};
window.scrollTo=()=>{};
window.Element.prototype.scrollTo=function(){};
Object.defineProperty(window.screen,'orientation',{value:{type:'landscape-primary',angle:0,addEventListener(){},removeEventListener(){}}});
const errors=[],calls=[];
window.addEventListener('error',e=>errors.push(e.message));
window.fetch=async(url,options)=>{
  const u=new URL(url,'http://localhost/'),action=u.searchParams.get('action'),crud=u.searchParams.get('crud');
  const params=Object.fromEntries(new URLSearchParams(options.body.toString()));
  calls.push({action,crud,params});
  return {json:async()=>action==='list' ? {Result:'OK',TotalRecordCount:1,Records:crud==='rfid-seriales' ?
    [{FC_Id:9001,FC_Pedido:'Lote conservado',PE_Nombre:'Corte'}] :
    [{fmi_rowid:71,f850_id_co:'001',f850_id_tipo_docto:'OBC',f850_consec_docto:21,f120_referencia:'BAPFRO190140',
      f120_descripcion:'Bloque corto',fmi_cantidad_impresos:0,fmi_cantidad_no_impresos:2,fmi_cantidad_a_imprimir:2,
      fmi_id_etiqueta:10,fmi_id_impresora:1177,fmi_nota:'Lote conservado'}]} : {Result:'OK',Total:2}};
};
const tick=(ms=120)=>new Promise(r=>setTimeout(r,ms));
let failures=0;
function check(name,ok){console.log(`${ok?'OK':'FAIL'} ${name}`);if(!ok)failures++;}
window.eval(readFileSync('../assets/quasar/crud-kit-quasar.js','utf8'));
window.CrudKitQuasar.mount('#rfid',schema);
await tick(180);
const root=window.document.querySelector('#rfid');
check('No consulta al abrir',calls.length===0);
for(const [label,value] of [['Centro operativo','001'],['Tipo OP','OBC'],['Orden de produccion','21']]){
  const input=[...root.querySelectorAll('.ck-q-filters .q-field')].find(f=>f.textContent.includes(label)).querySelector('input');
  input.value=value;input.dispatchEvent(new window.Event('input',{bubbles:true}));
}
root.querySelector('.ck-q-filters').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));
await tick(200);
check('Filtrar envia CSRF, OP y paginacion',calls.length===1&&calls[0].params._csrf==='test-csrf'&&calls[0].params.f850_consec_docto==='21');
check('Lista etiquetas e impresoras legibles',root.textContent.includes('Etiqueta Semielaborado')&&root.textContent.includes('Impresora de prueba'));
const button=(container,text)=>[...container.querySelectorAll('button')].find(b=>b.textContent.trim()===text);
button(root,'Generar fichos').click();await tick();
const formField=label=>[...window.document.querySelectorAll('.ck-q-form-card .q-field')].find(f=>f.querySelector('.q-field__label')?.textContent===label);
check('Generar hereda filtros aplicados',formField('Centro operativo')?.querySelector('input').value==='001'&&formField('Tipo OP')?.querySelector('input').value==='OBC'&&formField('Orden de produccion')?.querySelector('input').value==='21');
check('Generar no solicita cantidad ni nota',!formField('Cantidad a imprimir')&&!formField('Nota'));
button(window.document,'Cancelar').click();await tick(250);
root.querySelector('tbody tr:first-child td:last-child button').click();await tick();
check('Configurar permite cantidad y nota sin alterar la OP',formField('Cantidad a imprimir')?.querySelector('input').value==='2'&&!!formField('Nota')&&!formField('Centro operativo'));
const quantity=formField('Cantidad a imprimir').querySelector('input');
quantity.value='1';quantity.dispatchEvent(new window.Event('input',{bubbles:true}));
await tick(30);
window.document.querySelector('.ck-q-form-card form').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));
await tick(300);
const update=calls.find(c=>c.action==='update');
check('Configurar envia clave, cantidad y CSRF',update?.params.fmi_rowid==='71'&&update.params.fmi_cantidad_a_imprimir==='1'&&update.params._csrf==='test-csrf');
root.querySelector('.ck-q-child-button').click();await tick();
check('Detalle envia CSRF y vinculo de fila',calls.at(-1).crud==='rfid-seriales'&&calls.at(-1).params.fmid_rowid==='71'&&calls.at(-1).params._csrf==='test-csrf'&&root.textContent.includes('Lote conservado'));
root.querySelector('.ck-q-close-child').click();await tick();
root.querySelector('tbody .q-checkbox').click();await tick();
button(root,'Imprimir fichos').click();await tick(200);
check('Confirmacion aparece antes de imprimir',!!window.document.querySelector('.q-dialog')&&!calls.some(c=>c.action==='imprimir'));
button(window.document.querySelector('.q-dialog'),'Cancelar').click();await tick(300);
check('Cancelar no envia ninguna impresion',!calls.some(c=>c.action==='imprimir'));
button(root,'Imprimir fichos').click();await tick(200);
button(window.document.querySelector('.q-dialog'),'Imprimir fichos').click();await tick(300);
const printCalls=calls.filter(c=>c.action==='imprimir');
check('Confirmar envia una sola peticion con clave y CSRF',printCalls.length===1&&printCalls[0].params._csrf==='test-csrf'&&printCalls[0].params.selected==='[{"fmi_rowid":71}]');
check('Sin errores JavaScript',errors.length===0);
process.exit(failures ? 1 : 0);
