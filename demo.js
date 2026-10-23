import { encodeModelArchive, decodeModelArchive } from './demo-model.js';
import { validateProfiles, createLabelMap, choosePrediction, StableResult } from './pipeline.js';
import { localizedProfile } from './content.js';
const $ = id => document.getElementById(id);
let profiles=[], labelMap, selected, model=null, stream=null, running=false, busy=false, cancelled=false, runVersion=0, cameraVersion=0;
let photos=[[],[]], trainingHashes=new Set(), matched=null, language='en', predictionTask=Promise.resolve();
try { if(localStorage.getItem('jungle-king-card-language')==='zh-Hant')language='zh-Hant'; } catch {}
const stable=new StableResult(4), scripts=new Map();
const canvas=document.createElement('canvas');canvas.width=canvas.height=224;const ctx=canvas.getContext('2d');
const frame=document.createElement('canvas');frame.width=frame.height=224;const frameCtx=frame.getContext('2d');
function message(id,value,error=false){$(id).textContent=value;$(id).classList.toggle('error',error);}
function update(){
  $('piece').disabled=busy||!selected;
  for(const id of ['positive-photos','negative-photos','model-files','test-label','test-photos'])$(id).disabled=busy||!selected;
  $('train').disabled=busy||!selected||photos.some(files=>files.length<20||files.length>400);
  $('cancel-training').disabled=!busy||$('training-progress').hidden;
  $('save-model').disabled=busy||!model;
  $('test-model').disabled=busy||!model||!$('test-photos').files.length;
  $('camera-start').disabled=busy||!!stream||!selected;
  $('camera-stop').disabled=!stream;
  $('scan-start').disabled=busy||!model||!stream||running;
  $('scan-stop').disabled=!running;
}
function hideResult(){matched=null;$('demo-result').hidden=true;$('waiting-result').hidden=false;}
function pause(){running=false;runVersion++;stable.reset();update();}
function stopCamera(announce=true){cameraVersion++;pause();stream?.getTracks().forEach(t=>t.stop());stream=null;$('camera').srcObject=null;$('camera').hidden=true;$('camera-placeholder').hidden=false;hideResult();update();if(announce)message('scan-status',model?'Camera stopped. Enable it when you are ready.':'Train or open a model to enable scanning.');}
// Training can fail before the library creates its trainingModel. Release each available model safely.
function dispose(candidate){if(!candidate)return;for(const part of new Set([candidate.model,candidate.trainingModel,candidate.truncatedModel])){try{part?.dispose?.();}catch{}}}
async function clearModel(){pause();await predictionTask.catch(()=>{});dispose(model);model=null;trainingHashes.clear();hideResult();message('model-status','No model connected. Scanning is disabled.');message('test-status','Connect or train a model first.');update();}
function loadScript(url){if(scripts.has(url))return scripts.get(url);const promise=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=url;script.onload=resolve;script.onerror=()=>{scripts.delete(url);script.remove();reject(new Error('A recognition library could not load. Check your internet connection and try again.'));};document.head.append(script);});scripts.set(url,promise);return promise;}
async function libraries(){await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.3.1/dist/tf.min.js');await loadScript('https://cdn.jsdelivr.net/npm/@teachablemachine/image@0.8.3/dist/teachablemachine-image.min.js');if(!window.tmImage?.createTeachable)throw new Error('The training library is unavailable. Please refresh and retry.');}
async function drawPhoto(file){
  const url=URL.createObjectURL(file),image=new Image();
  try{image.src=url;await image.decode();const size=Math.min(image.naturalWidth,image.naturalHeight);if(!size)throw new Error('Empty image');ctx.drawImage(image,(image.naturalWidth-size)/2,(image.naturalHeight-size)/2,size,size,0,0,224,224);return canvas;}
  catch{throw new Error(`Cannot read ${file.name}. Use JPG, PNG or WebP; convert HEIC first.`);}
  finally{URL.revokeObjectURL(url);}
}
async function digest(file){const bytes=await crypto.subtle.digest('SHA-256',await file.arrayBuffer());return [...new Uint8Array(bytes)].map(v=>v.toString(16).padStart(2,'0')).join('');}
function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}
async function acceptModel(candidate,hashes=new Set()){
  const labels=candidate.getClassLabels().map(s=>s.trim().toLowerCase());
  if(labels.length!==2||!labels.includes('other')||!labels.some(label=>labelMap.get(label)===selected.pieceId))throw new Error(`This demo needs two labels: ${selected.pieceId} (or its animal-name alias) and other. Choose the matching animal first.`);
  await predictionTask.catch(()=>{});dispose(model);model=candidate;trainingHashes=hashes;
  message('model-status',`Model ready · ${selected.name} and everything else. Download the model ZIP to keep it.`);
  message('scan-status','Model ready. Enable the camera, then start scanning.');message('test-status','Choose photos from a different session to check the model.');update();
}
for(const [id,index] of [['positive-photos',0],['negative-photos',1]]) $(id).addEventListener('change',async()=>{
  photos[index]=[...$(id).files];await clearModel();message(index?'negative-count':'positive-count',`${photos[index].length} photos selected`,photos[index].length>400);
  message('training-status',photos.some(f=>f.length<20)?'Add at least 20 photos to each group.':photos.some(f=>f.length>400)?'Use at most 400 photos in each group.':'Ready to train. More varied photos help; this minimum does not establish accuracy.');update();
});
$('piece').addEventListener('change',async()=>{stopCamera(false);await clearModel();selected=profiles.find(p=>p.pieceId===$('piece').value);photos=[[],[]];$('positive-photos').value='';$('negative-photos').value='';$('model-files').value='';$('test-photos').value='';$('positive-count').textContent=$('negative-count').textContent='No photos selected';$('positive-title').textContent=selected.name;message('training-status','Add photos to both groups to begin.');update();});
$('train').addEventListener('click',async()=>{
  if(busy||photos.some(files=>files.length<20||files.length>400))return;
  busy=true;cancelled=false;pause();hideResult();$('training-progress').hidden=false;$('training-progress').value=0;update();let candidate;
  try{
    message('training-status','Downloading the base model. Keep this tab open…');await libraries();
    candidate=await window.tmImage.createTeachable({labels:[selected.pieceId,'other'],imageSize:224,modelName:`Jungle King ${selected.name}`},{version:2,alpha:0.35});candidate.setLabels([selected.pieceId,'other']);
    const hashes=new Set(),categoryHashes=[new Set(),new Set()];let count=0;const total=photos[0].length+photos[1].length;
    for(let group=0;group<2;group++)for(const file of photos[group]){
      if(cancelled)throw new Error('Training cancelled.');const hash=await digest(file);
      if(categoryHashes[1-group].has(hash))throw new Error('The same photo is in both groups. Remove it from the incorrect group and retry.');categoryHashes[group].add(hash);hashes.add(hash);
      await candidate.addExample(group,await drawPhoto(file));count++;$('training-progress').value=count/total*40;message('training-status',`Preparing photo ${count} of ${total}…`);await window.tf.nextFrame();
    }
    if(cancelled)throw new Error('Training cancelled.');
    await candidate.train({denseUnits:100,epochs:30,learningRate:0.001,batchSize:16},{onEpochEnd:async(epoch)=>{message('training-status',`Learning · round ${epoch+1} of 30. Keep this tab open…`);$('training-progress').value=40+(epoch+1)/30*60;if(cancelled)candidate.stopTraining();await window.tf.nextFrame();}});
    if(cancelled)throw new Error('Training cancelled.');
    await acceptModel(candidate,hashes);candidate=null;$('training-progress').value=100;message('training-status','Training finished. Check held-out photos, save your model, then try the live camera. Training completion is not an accuracy measurement.');
  }catch(error){dispose(candidate);message('training-status',`${error.message}${model?' Your previous model remains connected.':''}`,true);}
  finally{busy=false;$('training-progress').hidden=true;update();}
});
$('cancel-training').addEventListener('click',()=>{cancelled=true;$('cancel-training').disabled=true;message('training-status','Cancelling after the current photo or learning round…');});
$('save-model').addEventListener('click',async()=>{
  if(!model||busy)return;busy=true;pause();update();
  try{
    if(!window.JSZip)throw new Error('The ZIP library did not load. Refresh after saving your original photos.');
    let saved;
    await model.model.save(window.tf.io.withSaveHandler(async artifacts=>{saved=artifacts;return {modelArtifactsInfo:{dateSaved:new Date(),modelTopologyType:'JSON',modelTopologyBytes:JSON.stringify(artifacts.modelTopology).length,weightSpecsBytes:JSON.stringify(artifacts.weightSpecs).length,weightDataBytes:artifacts.weightData.byteLength}};}));
    const bytes=await encodeModelArchive(window.JSZip,saved,model.getMetadata());
    download(new Blob([bytes],{type:'application/zip'}),`jungle-king-${selected.pieceId}-model.zip`);message('model-status','Model ZIP downloaded. Keep this file; you can reopen it here after refreshing or on another device.');
  }catch(error){message('model-status',`Could not save: ${error.message}`,true);}finally{busy=false;update();}
});
$('model-files').addEventListener('change',async()=>{
  if(busy||!$('model-files').files.length)return;busy=true;pause();hideResult();update();let candidate;
  try{
    await libraries();let files=[...$('model-files').files];if(files.some(f=>f.size>50*1024*1024))throw new Error('Model files must each be smaller than 50 MB.');
    if(files.length===1&&/\.zip$/i.test(files[0].name)){
      if(!window.JSZip)throw new Error('ZIP library unavailable. Select the three exported files instead.');
      files=(await decodeModelArchive(window.JSZip,await files[0].arrayBuffer())).map(({name,data})=>new File([data],name));
    }
    const topology=files.find(f=>f.name==='model.json'),metadata=files.find(f=>f.name==='metadata.json'),weights=files.filter(f=>/\.bin$/i.test(f.name));
    if(!topology||!metadata||weights.length!==1)throw new Error('Select model.json, metadata.json and one weights .bin file together.');
    candidate=await window.tmImage.loadFromFiles(topology,weights[0],metadata);await acceptModel(candidate);candidate=null;message('test-status','Loaded model: use separate test-session photos. Training-photo overlap cannot be checked for imported models.');
  }catch(error){dispose(candidate);message('model-status',`Could not open model: ${error.message}${model?' Previous model is still connected.':''}`,true);}finally{busy=false;update();}
});
$('test-photos').addEventListener('change',update);
$('test-model').addEventListener('click',async()=>{
  if(busy||!model)return;const files=[...$('test-photos').files];if(!files.length||files.length>200){message('test-status','Choose between 1 and 200 separate test photos.',true);return;}busy=true;pause();update();
  try{
    let accepted=0,rejected=0;const expected=$('test-label').value==='piece';
    for(let i=0;i<files.length;i++){
      if(trainingHashes.has(await digest(files[i])))throw new Error(`${files[i].name} was used for training. Choose photos from a different session.`);
      predictionTask=model.predict(await drawPhoto(files[i]));const match=choosePrediction(await predictionTask,labelMap);
      if(match?.pieceId===selected.pieceId)accepted++;else rejected++;message('test-status',`Checking photo ${i+1} of ${files.length}…`);await window.tf.nextFrame();
    }
    message('test-status',expected?`${files.length} piece photos: ${accepted} accepted, ${rejected} missed or uncertain. Repeat on a different session and device.`:`${files.length} other photos: ${rejected} rejected, ${accepted} false matches. Collect more varied examples if false matches occur.`);
  }catch(error){message('test-status',error.message,true);}finally{busy=false;update();}
});
$('camera-start').addEventListener('click',async()=>{
  if(stream||busy)return;const version=++cameraVersion;$('camera-start').disabled=true;message('scan-status','Requesting camera permission…');let next;
  try{
    if(!window.isSecureContext||!navigator.mediaDevices?.getUserMedia)throw new Error('Use HTTPS in Safari or Chrome for camera access.');
    next=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:720}}});
    if(version!==cameraVersion){next.getTracks().forEach(t=>t.stop());return;}
    stream=next;$('camera').srcObject=stream;$('camera').hidden=false;await $('camera').play();if(version!==cameraVersion)return;$('camera-placeholder').hidden=true;
    next.getVideoTracks()[0]?.addEventListener('ended',()=>{if(stream===next)stopCamera();});message('scan-status',model?'Camera ready. Centre one piece, then start scanning.':'Camera preview ready. Train or open a model before scanning.');
  }catch(error){if(version!==cameraVersion){next?.getTracks().forEach(t=>t.stop());return;}stopCamera(false);message('scan-status',error.name==='NotAllowedError'?'Camera permission was denied. Allow camera access in your browser settings and retry.':error.message,true);}
  finally{update();}
});
$('camera-stop').addEventListener('click',()=>stopCamera());
$('scan-start').addEventListener('click',()=>{
  if(!model||!stream||running||busy)return;hideResult();stable.reset();running=true;const version=++runVersion;update();message('scan-status','Looking for a stable match. Hold one piece inside the square.');
  const tick=async()=>{
    if(!running||version!==runVersion||!stream||document.hidden)return;
    try{
      const video=$('camera');if(video.readyState>=2){const size=Math.min(video.videoWidth,video.videoHeight)*0.7;frameCtx.drawImage(video,(video.videoWidth-size)/2,(video.videoHeight-size)/2,size,size,0,0,224,224);predictionTask=model.predict(frame);const predictions=await predictionTask;if(!running||version!==runVersion)return;const match=stable.update(choosePrediction(predictions,labelMap));
      if(match){pause();matched=match;renderResult();message('scan-status','Animal found. Scanning paused so you can explore its story.');$('animal-name').focus({preventScroll:true});if(matchMedia('(max-width:600px)').matches)$('demo-result').scrollIntoView({block:'start'});return;}
      message('scan-status',stable.count?`Confirming · ${stable.count} of 4 matching frames. Hold steady…`:'No clear match. Centre one piece or try another angle.');}
      if(running&&version===runVersion)setTimeout(tick,250);
    }catch(error){if(version!==runVersion)return;pause();hideResult();message('scan-status',`Scanning stopped: ${error.message}`,true);}
  };tick();
});
$('scan-stop').addEventListener('click',()=>{pause();message('scan-status','Scanning paused. Start again when ready.');});
$('scan-another').addEventListener('click',()=>{pause();hideResult();message('scan-status','Ready for another scan. Centre the piece and start scanning.');$('scan-start').focus();});
function renderResult(){
  if(!matched)return;const original=profiles.find(p=>p.pieceId===matched.pieceId),p=localizedProfile(original,language),zh=language==='zh-Hant';
  $('demo-result').lang=language;$('demo-result').hidden=false;$('waiting-result').hidden=true;
  for(const [id,key] of Object.entries({'animal-name':'name','scientific-name':'scientificName','animal-intro':'intro','habitat':'habitat','threats':'threats','protection':'protection','fact':'fact'}))$(id).textContent=p[key];
  $('conservation').textContent=[`${p.conservation.category} · ${p.conservation.scope}`,...(p.conservation.secondary||[]).map(s=>`${s.category} · ${s.scope}`),p.conservation.note].filter(Boolean).join('\n');
  $('result-proof').textContent=zh?`即時相機模型結果 · ${(matched.score*100).toFixed(0)}% 模型分數（並非準確率）`:`LIVE CAMERA MODEL RESULT · ${(matched.score*100).toFixed(0)}% model score (not measured accuracy)`;
  const labels=zh?{'status-label':'保育等級與範圍','habitat-label':'棲息地','threats-label':'主要威脅','protection-label':'保護方法','fact-label':'認識更多','sources-label':'資料來源與查核日期','scan-another':'掃描另一枚棋子 ↗'}:{'status-label':'Conservation status & scope','habitat-label':'Habitat','threats-label':'Threats','protection-label':'What helps','fact-label':'A closer look','sources-label':'Sources & research notes','scan-another':'Scan another piece ↗'};
  for(const [id,value] of Object.entries(labels))$(id).textContent=value;
  $('mapping-note').hidden=p.mappingStatus!=='provisional';$('mapping-note').textContent=zh?'仍需確認水鼠棋子是否代表歐洲水田鼠。':'Please confirm that the Aquatic Rat piece represents the European water vole.';
  const art=$('piece-art');art.replaceChildren();if(p.artwork){const [x,y,w,h]=p.artwork.crop;art.style.aspectRatio=`${w}/${h}`;const img=document.createElement('img');img.src=p.artwork.file;img.alt=p.name;img.style.width=`${p.artwork.width/w*100}%`;img.style.left=`${-x/w*100}%`;img.style.top=`${-y/h*100}%`;art.append(img);}
  $('source-list').replaceChildren(...p.sources.map(s=>{const li=document.createElement('li'),a=document.createElement('a');a.href=s.url;a.textContent=s.name;a.target='_blank';a.rel='noopener';li.append(a);return li;}));
  $('research-date').textContent=zh?`來源查核日期：${p.checkedOn}。主要評估日期尚未核實。`:`Sources checked: ${p.checkedOn}. Primary assessment date not verified.`;
  $('story-en').setAttribute('aria-pressed',String(!zh));$('story-zh').setAttribute('aria-pressed',String(zh));
}
for(const [id,value] of [['story-en','en'],['story-zh','zh-Hant']])$(id).addEventListener('click',()=>{language=value;try{localStorage.setItem('jungle-king-card-language',value);}catch{}renderResult();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopCamera();});
window.addEventListener('pagehide',()=>stopCamera(false));
window.addEventListener('beforeunload',event=>{if(busy){event.preventDefault();event.returnValue='';}});
try{const response=await fetch('./species.json');if(!response.ok)throw new Error('Animal stories unavailable.');profiles=validateProfiles(await response.json());labelMap=createLabelMap(profiles);selected=profiles.find(p=>p.pieceId==='tiger_piece')||profiles[0];$('piece').replaceChildren(...profiles.map(p=>{const option=document.createElement('option');option.value=p.pieceId;option.textContent=p.name;return option;}));$('piece').value=selected.pieceId;$('positive-title').textContent=selected.name;message('page-status','Choose one piece below. Training and scanning start only when you ask.');update();}catch(error){message('page-status',error.message,true);}
