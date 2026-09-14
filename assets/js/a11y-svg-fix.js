(function(g){
'use strict';
const old=g.AulaGramSeedVisuals;
if(!old||typeof old.post!=='function'||typeof old.postMeta!=='function')return;

const cache=new Map();
function esc(s){return String(s||'').replace(/[&<>]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]));}
function idx(x){const m=String(x||'').match(/post(\d+)$/);return m?+m[1]:(+x||0);}
function wrap(s,n=22){const words=String(s||'').split(/\s+/),out=[];let line='';for(const w of words){const test=line?line+' '+w:w;if(test.length>n&&line){out.push(line);line=w}else line=test}if(line)out.push(line);return out.slice(0,3);}
function data(svg){return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);}

function fixedA11yPost(x){
  const i=idx(x);
  if(i<1||i>3)return '';
  const key='a11y-fixed-'+i;
  if(cache.has(key))return cache.get(key);
  const p=old.profile('a11y_bot');
  const q=p&&p.posts&&p.posts[i-1];
  if(!q)return '';
  const c1='#1565C0',c2='#2E7D32';
  const lines=wrap(q.title),fs=lines.length>1?54:62;
  const titleText=lines.map((t,j)=>`<text x="450" y="${590+j*70}" text-anchor="middle" fill="white" font-size="${fs}" font-weight="800" font-family="Arial,sans-serif">${esc(t)}</text>`).join('');
  const motif=`<circle cx="450" cy="280" r="52" fill="white"/><path d="M280 365h340M450 330v245M450 420 335 595M450 420l115 175" fill="none" stroke="white" stroke-width="30" stroke-linecap="round" stroke-linejoin="round" opacity=".88"/>`;
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 900" role="img"><title>${esc(q.title)}</title><desc>${esc(q.alt)}</desc><defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient><pattern id="d" width="54" height="54" patternUnits="userSpaceOnUse"><circle cx="5" cy="5" r="2.4" fill="white" opacity=".12"/></pattern></defs><rect width="900" height="900" fill="url(#g)"/><rect width="900" height="900" fill="url(#d)"/><circle cx="80" cy="90" r="160" fill="white" opacity=".06"/><circle cx="840" cy="220" r="210" fill="white" opacity=".05"/>${motif}<rect x="120" y="520" width="660" height="245" rx="34" fill="#07111f" opacity=".25"/>${titleText}<text x="450" y="805" text-anchor="middle" fill="white" font-size="26" font-weight="700" font-family="Arial,sans-serif">${esc(q.banner)}</text><text x="60" y="70" fill="white" font-size="25" font-weight="800" font-family="Arial,sans-serif">ACCESIBILIDAD · ${i}</text></svg>`;
  const uri=data(svg);cache.set(key,uri);return uri;
}

const patched={
  avatar:(a)=>old.avatar(a),
  post:(a,x)=>a==='a11y_bot'?fixedA11yPost(x):old.post(a,x),
  postMeta:(a,x)=>{
    const meta=old.postMeta(a,x);
    if(!meta||a!=='a11y_bot')return meta;
    return Object.assign({},meta,{image:fixedA11yPost(x)});
  },
  profile:(a)=>old.profile(a),
  aliases:old.aliases
};

g.AulaGramSeedVisuals=Object.freeze(patched);
})(window);
