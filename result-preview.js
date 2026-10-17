import { localizedProfile } from './content.js';
const $ = id => document.getElementById(id);
const copy = {
  en: {
    'preview-label':'DESIGN PROTOTYPE', 'back-link':'← Back to scanner', 'sample-note':'Sample result · no camera recognition',
    'story-label':'THE STORY BEHIND YOUR PIECE', 'art-caption':'Jungle King · game piece artwork', 'status-heading':'CONSERVATION STATUS',
    'habitat-label':'WHERE IT LIVES', 'habitat-title':'A place to call home.', 'threats-label':'WHAT IT FACES', 'threats-title':'A changing world.',
    'protection-label':'WHAT HELPS', 'protection-title':'Room for a future.', 'fact-label':'A CLOSER LOOK', 'sources-label':'Sources & research notes',
    'scan-another':'Scan another piece ↗', 'sample-label':'Preview another animal', 'preview-help':'Design preview only. Live recognition is being prepared.',
    'footer-note':'Small pieces. Big stories.', mapping:'Provisional identity: please confirm that the Aquatic Rat piece represents the European water vole.',
    credit:'Game artwork: llab design ltd, from the supplied campaign screenshots.',
  },
  'zh-Hant': {
    'preview-label':'設計原型', 'back-link':'← 返回掃描頁面', 'sample-note':'示範結果 · 未使用相機辨識',
    'story-label':'棋子背後的故事', 'art-caption':'Jungle King · 棋子圖像', 'status-heading':'保育等級',
    'habitat-label':'棲息地', 'habitat-title':'牠的家園。', 'threats-label':'主要威脅', 'threats-title':'變動中的世界。',
    'protection-label':'保護方法', 'protection-title':'為未來留一片空間。', 'fact-label':'認識更多', 'sources-label':'資料來源與查核說明',
    'scan-another':'掃描另一枚棋子 ↗', 'sample-label':'預覽其他動物', 'preview-help':'此頁僅供設計預覽，實際辨識功能正在準備中。',
    'footer-note':'小小棋子，大大故事。', mapping:'暫定身分：仍需確認水鼠棋子是否代表歐洲水田鼠。',
    credit:'遊戲圖像：llab design ltd，取自使用者提供的宣傳截圖。',
  },
};
let language='en', profiles=[], selected;
try { if(localStorage.getItem('jungle-king-card-language')==='zh-Hant') language='zh-Hant'; } catch {}
function render(){
  const c=copy[language], p=localizedProfile(selected,language);
  document.documentElement.lang=language;
  document.title=`${p.name} · Jungle King`;
  for(const [id,value] of Object.entries(c)) if($(id)) $(id).textContent=value;
  $('language-en').setAttribute('aria-pressed',String(language==='en'));
  $('language-zh').setAttribute('aria-pressed',String(language==='zh-Hant'));
  for(const [id,key] of Object.entries({'animal-name':'name','scientific-name':'scientificName','animal-intro':'intro','habitat':'habitat','threats':'threats','protection':'protection','animal-fact':'fact'})) $(id).textContent=p[key];
  $('status-value').textContent=p.conservation.category;
  $('status-scope').textContent=p.conservation.scope;
  $('status-note').textContent=p.conservation.note;
  $('secondary-status').textContent=(p.conservation.secondary||[]).map(s=>`${s.category} · ${s.scope}`).join('; ');
  $('mapping-note').hidden=p.mappingStatus!=='provisional';
  $('mapping-note').textContent=c.mapping;
  const [x,y,w,h]=p.artwork.crop, art=$('artwork'), img=document.createElement('img');
  art.style.aspectRatio=`${w}/${h}`;
  img.src=p.artwork.file; img.alt=p.name; img.width=p.artwork.width; img.height=p.artwork.height;
  img.style.width=`${p.artwork.width/w*100}%`;img.style.left=`${-x/w*100}%`;img.style.top=`${-y/h*100}%`;
  art.replaceChildren(img);
  $('sources').replaceChildren(...p.sources.map(source=>{const li=document.createElement('li'),a=document.createElement('a');a.href=source.url;a.textContent=source.name;a.target='_blank';a.rel='noopener';li.append(a);return li;}));
  $('research-note').textContent=language==='en'?`Sources checked: ${p.checkedOn}. The source-check date is not the conservation assessment date. Primary assessment date has not been verified.`:`來源查核日期：${p.checkedOn}。查核日期並非保育評估日期；主要評估日期尚未核實。`;
  for(const option of $('sample-piece').options) option.textContent=localizedProfile(profiles.find(p=>p.pieceId===option.value),language).name;
  $('sample-piece').value=selected.pieceId;
}
for(const [id,value] of [['language-en','en'],['language-zh','zh-Hant']]) $(id).addEventListener('click',()=>{language=value;try{localStorage.setItem('jungle-king-card-language',value);}catch{}if(selected)render();});
$('sample-piece').addEventListener('change',()=>{selected=profiles.find(p=>p.pieceId===$('sample-piece').value);render();const url=new URL(location.href);url.searchParams.set('piece',selected.pieceId);history.replaceState(null,'',url);});
try {
  const response=await fetch('./species.json'); if(!response.ok) throw new Error('Story unavailable');
  profiles=(await response.json()).profiles;
  const requested=new URL(location.href).searchParams.get('piece');
  selected=profiles.find(p=>p.pieceId===requested)||profiles.find(p=>p.pieceId==='tiger_piece');
  $('sample-piece').replaceChildren(...profiles.map(p=>{const option=document.createElement('option');option.value=p.pieceId;return option;}));
  render();$('loading').hidden=true;$('story').hidden=false;$('sample-piece').disabled=false;
} catch { $('loading').textContent=language==='en'?'The animal story could not load. Please refresh the page.':'無法載入動物故事，請重新整理頁面。'; }
