// Genuine multipart upload + XLS parser on a loopback-only PHP test server. No DB/ERP.
import { execFileSync, spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join, sep, basename } from 'node:path';
import { randomBytes } from 'node:crypto';
import { createServer, createConnection } from 'node:net';
const repo=resolve('../../..'),folder=mkdtempSync(join(tmpdir(),'rfid-upload-')),path=join(folder,'rfid.xls');
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const port=server.address().port;await new Promise(r=>server.close(r));
const secret=randomBytes(24).toString('hex');
let processPhp;
try {
  execFileSync('php',['-d','xdebug.mode=off','tests/produccion/CapturaRfidUploadFixture.php','--generate',path],{cwd:repo});
  processPhp=spawn('php',['-d','xdebug.mode=off','-d','display_errors=0','-S',`127.0.0.1:${port}`,'tests/produccion/CapturaRfidUploadFixture.php'],
    {cwd:repo,env:{...process.env,RFID_UPLOAD_TEST_SECRET:secret},windowsHide:true,stdio:['ignore','pipe','pipe']});
  let ready=false;
  for(let attempt=0;attempt<50&&!ready;attempt++) {
    ready=await new Promise(r=>{const socket=createConnection({host:'127.0.0.1',port});socket.once('connect',()=>{socket.destroy();r(true);});socket.once('error',()=>r(false));});
    if(!ready)await new Promise(r=>setTimeout(r,100));
  }
  if(!ready)throw new Error('PHP test server startup timed out');
  const send=async content=>{
    const form=new FormData();form.set('archivo',new Blob([content]),'rfid.xls');
    return (await fetch(`http://127.0.0.1:${port}/`,{method:'POST',headers:{'X-RFID-Test':secret},body:form})).json();
  };
  const result=await send(readFileSync(path));
  if(result.Result!=='OK'||result.rows['2']!==Buffer.from('F|9001|A').toString('hex')||result.rows['3']!=='ZZ'||result.rows['4']!==Buffer.from('F|9002|B').toString('hex')) throw new Error(JSON.stringify(result));
  console.log('OK Multipart real conserva filas y EPC del archivo .xls');
  const corrupt=await send(Buffer.from('invalid xls'));
  if(corrupt.Result!=='ERROR'||!corrupt.Message.includes('no es un libro Excel')) throw new Error(JSON.stringify(corrupt));
  console.log('OK Archivo falso es rechazado antes de procesar seriales');
} finally {
  if(processPhp)processPhp.kill();
  // Only remove the exact temporary directory created above.
  if(!resolve(folder).startsWith(resolve(tmpdir())+sep)||!basename(folder).startsWith('rfid-upload-'))throw new Error('Unexpected temporary path');
  rmSync(folder,{recursive:true,force:true});
}
