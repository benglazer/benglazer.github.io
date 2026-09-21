/* Maze generation and pathfinding are independent of the interface. */
const MazeCore = (() => {
  const dirs = [[0,-1],[1,0],[0,1],[-1,0]];
  function generate(n, random = Math.random) {
    const cells = Array.from({length:n*n}, () => [true,true,true,true]);
    const seen = new Set([0]), stack = [0];
    while(stack.length) {
      const current = stack[stack.length-1], x = current%n, y = Math.floor(current/n);
      const choices = dirs.map(([dx,dy],d)=>({x:x+dx,y:y+dy,d})).filter(p=>p.x>=0&&p.y>=0&&p.x<n&&p.y<n&&!seen.has(p.y*n+p.x));
      if(!choices.length){stack.pop();continue;}
      const next = choices[Math.floor(random()*choices.length)], index=next.y*n+next.x;
      cells[current][next.d]=false;cells[index][(next.d+2)%4]=false;
      seen.add(index);stack.push(index);
    }
    return cells;
  }
  function path(cells,n,start,goal) {
    const queue=[start], previous=new Map([[start,null]]);
    for(let head=0;head<queue.length;head++) {
      const here=queue[head]; if(here===goal)break;
      dirs.forEach(([dx,dy],d)=>{if(!cells[here][d]){const next=here+dx+dy*n;if(!previous.has(next)){previous.set(next,here);queue.push(next);}}});
    }
    if(!previous.has(goal))return [];
    const result=[];for(let at=goal;at!==null;at=previous.get(at))result.push(at);
    return result.reverse();
  }
  function settings(level){
    if(!Number.isInteger(level)||level<1||level>100)throw new Error('Choose a level from 1 to 100.');
    return {level,n:8+Math.floor((level-1)*42/99),starCount:3+Math.floor((level-1)/11),view:level>=90?9:level>=70?11:15,trail:level<80};
  }
  function distances(cells,n,start){
    const result=Array(cells.length).fill(-1),queue=[start];result[start]=0;
    for(let h=0;h<queue.length;h++){const i=queue[h];dirs.forEach(([dx,dy],d)=>{const j=i+dx+dy*n;if(!cells[i][d]&&result[j]<0){result[j]=result[i]+1;queue.push(j);}});}
    return result;
  }
  function createLevel(level,variant=0){
    const config=settings(level),{n,starCount}=config;
    let seed=(level*2654435761+variant*1013904223)>>>0;
    const random=()=>{seed=(seed+0x6D2B79F5)>>>0;let t=seed;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};
    let cells,depths,exit=0,best=-1;
    for(let attempt=0;attempt<(level>=70?8:3);attempt++){
      const candidate=generate(n,random),d=distances(candidate,n,0);let farthest=0;
      d.forEach((v,i)=>{if(v>d[farthest])farthest=i;});
      if(d[farthest]>best){best=d[farthest];cells=candidate;depths=d;exit=farthest;}
    }
    const separation=depths.slice();
    const exitDistances=distances(cells,n,exit);separation.forEach((d,i)=>separation[i]=Math.min(d,exitDistances[i]));
    const stars=[];
    for(let k=0;k<starCount;k++){
      let chosen=-1,score=-1;
      cells.forEach((walls,i)=>{if(i===0||i===exit||stars.includes(i))return;const candidate=separation[i]+(walls.filter(Boolean).length===3?n:0);if(candidate>score){chosen=i;score=candidate;}});
      stars.push(chosen);const d=distances(cells,n,chosen);separation.forEach((v,i)=>separation[i]=Math.min(v,d[i]));
    }
    return {...config,cells,exit,stars,exitDistance:best};
  }
  // Every input crosses exactly one shared, open edge. Speed never affects collision.
  function nextCell(cells,n,from,d){
    if(!Number.isInteger(d)||d<0||d>3||!cells[from])return from;
    const [dx,dy]=dirs[d],x=from%n+dx,y=Math.floor(from/n)+dy;
    if(x<0||y<0||x>=n||y>=n)return from;
    const next=y*n+x;
    return cells[from][d]||cells[next][(d+2)%4]?from:next;
  }
  // In a tree maze, each required branch is walked twice except the route to the exit.
  function minimumSteps(cells,n,stars,exit){
    const branches=new Set();
    for(const goal of [...stars,exit])for(const cell of path(cells,n,0,goal).slice(1))branches.add(cell);
    return branches.size*2-(path(cells,n,0,exit).length-1);
  }
  function scoreFor(steps,minimum,hintsUsed=0,lanternsUsed=0){return Math.max(1,Math.floor(Math.min(10000,10000*minimum/Math.max(steps,minimum))*Math.pow(.8,hintsUsed)*Math.pow(.9,lanternsUsed)));}
  function hintRoute(cells,n,start,goals){
    let here=start;const remaining=[...goals],route=[start];
    while(remaining.length&&route.length<11){
      const routes=remaining.map(goal=>path(cells,n,here,goal)).sort((a,b)=>a.length-b.length);
      const next=routes[0];route.push(...next.slice(1,12-route.length));here=next.at(-1);
      remaining.splice(remaining.indexOf(here),1);
    }
    return route;
  }
  return {generate,path,dirs,settings,createLevel,distances,nextCell,minimumSteps,scoreFor,hintRoute};
})();
if(typeof module!=='undefined') module.exports=MazeCore;
if(typeof document!=='undefined') (()=>{
  const $=id=>document.getElementById(id), canvas=$('maze'), ctx=canvas.getContext('2d');
  const {t,number}=MazeI18n;
  let preferenceStorage;
  try{preferenceStorage=globalThis.localStorage;}catch{/* Language selection also works without storage access. */}
  MazeI18n.initialize(preferenceStorage, globalThis.navigator?.languages || [globalThis.navigator?.language]);
  const SAVE_KEY='abes-maze-v1', HINT_PRICE=10;
  const skins={coral:{color:'#f19b80',price:0},ocean:{color:'#80d7ff',price:40},gold:{color:'#ffd477',price:75},mint:{color:'#a5efae',price:40},violet:{color:'#ceadff',price:100},ruby:{color:'#ff819e',price:150},ice:{color:'#e0ffff',price:250}};
  const gear={
    meadow:{kind:'theme',price:0,floor:'#e5eddb',wall:'#264957'},
    midnight:{kind:'theme',price:120,floor:'#15263d',wall:'#89aec9'},
    desert:{kind:'theme',price:180,floor:'#f8dfaf',wall:'#865634'},
    glacier:{kind:'theme',price:240,floor:'#d7f6fc',wall:'#386c9c'},
    letter:{kind:'symbol',price:0,symbol:'P'},
    spark:{kind:'symbol',price:80,symbol:'✦'},
    diamond:{kind:'symbol',price:160,symbol:'◆'},
    infinity:{kind:'symbol',price:300,symbol:'∞'}
  };
  let wallet={coins:30,tickets:0,chalk:0,lanterns:0,lastLevel:1,owned:['coral'],skin:'coral',gear:['meadow','letter'],theme:'meadow',symbol:'letter',bests:{},bestsV2:{}},storageOK=true;
  try{
    const saved=JSON.parse(localStorage.getItem(SAVE_KEY));
    if(saved&&Number.isSafeInteger(saved.coins)&&saved.coins>=0&&Number.isSafeInteger(saved.tickets)&&saved.tickets>=0){
      wallet.coins=saved.coins;wallet.tickets=saved.tickets;
      if(Number.isInteger(saved.lastLevel)&&saved.lastLevel>=1&&saved.lastLevel<=100)wallet.lastLevel=saved.lastLevel;
      wallet.owned=['coral',...(Array.isArray(saved.owned)?saved.owned:[]).filter(k=>k!=='coral'&&Object.hasOwn(skins,k))];
      wallet.skin=wallet.owned.includes(saved.skin)?saved.skin:'coral';
      for(const key of ['chalk','lanterns'])if(Number.isSafeInteger(saved[key])&&saved[key]>=0)wallet[key]=saved[key];
      wallet.gear=[...new Set(['meadow','letter',...(Array.isArray(saved.gear)?saved.gear:[]).filter(k=>Object.hasOwn(gear,k))])];
      for(const kind of ['theme','symbol'])if(wallet.gear.includes(saved[kind])&&gear[saved[kind]]?.kind===kind)wallet[kind]=saved[kind];
      for(const [key,value] of Object.entries(saved.bests||{})){
        if(/^(100|[1-9][0-9]?)$/.test(key)&&Number.isInteger(value)&&value>0&&value<=10000)wallet.bests[key]=value;
      }
      for(const [key,value] of Object.entries(saved.bestsV2||{}))if(/^(100|[1-9][0-9]?)$/.test(key)&&Number.isInteger(value)&&value>0&&value<=10000)wallet.bestsV2[key]=value;
    }
  }catch{storageOK=false;}
  function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(wallet));}catch{storageOK=false;}}
  let level=1,variant=0,config,n,cells,exit,player=0,stars=[],collected,visited,steps=0,minimum=0,won=false,hintPath=[];
  let renderX=0,renderY=0,animation=null,frame=0,generation=0;
  let history=[];
  let hintsUsed=0,lanternsUsed=0,lanternSteps=0,marks=new Set();
  // Retain keys and raw values so active announcements can be translated again.
  const messages={};
  const count=(kind,value)=>t('count.'+kind,{count:value});
  function renderMessage({key,values}){
    const translated=Object.fromEntries(Object.entries(values).map(([name,value])=>{
      if(value&&typeof value==='object')return [name,value.key?t(value.key):count(value.kind,value.count)];
      return [name,value];
    }));
    return t(key,translated);
  }
  function refreshMessage(id){
    const text=renderMessage(messages[id]);
    // Avoid re-announcing an unchanged live region on every move or shop update.
    if($(id).textContent!==text)$(id).textContent=text;
  }
  function message(id,key,values={}){messages[id]={key,values};refreshMessage(id);}
  const currentScore=()=>MazeCore.scoreFor(steps,minimum,hintsUsed,lanternsUsed);
  const reducedMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let audioContext;
  function prepareAudio(){
    try{
      const Audio=window.AudioContext||window.webkitAudioContext;
      if(!audioContext&&Audio)audioContext=new Audio();
      if(audioContext?.state==='suspended')audioContext.resume().catch(()=>{});
    }catch{/* Sound is optional when browser audio is unavailable. */}
  }
  function starDing(){
    try{
      if(!audioContext||audioContext.state!=='running')return;
      const tone=audioContext.createOscillator(),volume=audioContext.createGain(),now=audioContext.currentTime;
      tone.type='sine';tone.frequency.setValueAtTime(1046.5,now);
      volume.gain.setValueAtTime(0,now);volume.gain.linearRampToValueAtTime(.18,now+.008);
      volume.gain.exponentialRampToValueAtTime(.001,now+.45);
      tone.connect(volume);volume.connect(audioContext.destination);
      tone.onended=()=>{tone.disconnect();volume.disconnect();};
      tone.start(now);tone.stop(now+.46);
    }catch{/* Audio failures must not interrupt a move. */}
  }
  function stopMotion(){
    generation++;
    if(frame)cancelAnimationFrame(frame);
    frame=0;
    if(animation){const done=animation.done;animation=null;done(false);}
  }
  function start(nextLevel=level,newVariant=0){
    const nextConfig=MazeCore.createLevel(nextLevel,newVariant);
    stopMotion();config=nextConfig;level=nextLevel;variant=newVariant;
    ({n,cells,exit,stars}=config);minimum=MazeCore.minimumSteps(cells,n,stars,exit);
    player=0;renderX=0;renderY=0;steps=0;won=false;hintPath=[];collected=new Set();visited=new Set([0]);
    history=[];hintsUsed=0;lanternsUsed=0;lanternSteps=0;marks=new Set();
    $('win').hidden=true;$('levelSelect').value=String(level);
    $('previousLevel').disabled=level===1;$('nextLevel').disabled=level===100;
    message('message','message.start',{stars:{kind:'stars',count:stars.length}});
    renderLevel();
    wallet.lastLevel=level;save();
    update();
  }
  function renderLevel(){
    $('levelLabel').textContent=t('level.label',{level});
    $('starGoal').textContent=t('stars.collect',{count:stars.length});
    const note=level===100?'level.finalNote':level>=80?'level.noTrail':n>config.view?'level.follow':'level.trail';
    $('levelDetails').textContent=t('level.details',{size:n,stars:count('stars',stars.length),note:t(note)});
    $('mapNote').textContent=t(n>config.view?'map.partial':'map.full');
    for(const option of $('levelSelect').children){const value=Number(option.value);option.textContent=t(value===100?'level.finalOption':'level.option',{level:value});}
  }
  function renderWin(){
    const score=currentScore(),reward=10+Math.ceil(level/5)+Math.floor(score/500);
    $('winTitle').textContent=t(score===10000?'win.perfect':'win.normal');
    $('winDetails').textContent=t('win.details',{
      heading:t(level===100?'win.final':'win.level',{level}),steps:count('steps',steps),points:count('points',score),coins:count('coins',reward),
      supplies:t('win.supplies',{hints:hintsUsed,lanterns:lanternsUsed}),minimum:count('steps',minimum)
    });
    $('playAgain').textContent=t(level===100?'win.replay':'win.advance',{level:level+1});
  }
  function update(){
    for(const id of Object.keys(messages))refreshMessage(id);
    if(won)renderWin();
    $('starCount').textContent='★ '+number(collected.size)+' / '+number(stars.length);
    $('moves').textContent=count('steps',steps);
    $('score').textContent=number(currentScore());
    $('bestScore').textContent=wallet.bestsV2[level]?number(wallet.bestsV2[level]):'—';
    $('scorePenalty').textContent=t('score.penalty',{hints:count('hints',hintsUsed),lanterns:count('lanterns',lanternsUsed),percent:Math.round((1-Math.pow(.8,hintsUsed)*Math.pow(.9,lanternsUsed))*100)});
    $('undo').disabled=won||Boolean(animation)||!history.length||wallet.coins<1;
    $('hint').disabled=won||Boolean(animation);
    $('hint').textContent=t(wallet.tickets?'hint.use':'hint.buy');
    $('coins').textContent=number(wallet.coins);
    $('shopCoinLabel').textContent=t('shop.coinSuffix',{count:wallet.coins});
    $('shopBalance').textContent=count('coins',wallet.coins);
    $('tickets').textContent=number(wallet.tickets);
    $('buyHint').disabled=wallet.coins<HINT_PRICE;
    $('chalkStock').textContent=number(wallet.chalk);$('lanternStock').textContent=number(wallet.lanterns);
    $('buyChalk').disabled=wallet.coins<15;$('buyLantern').disabled=wallet.coins<25;
    $('useChalk').textContent=t('chalk.use',{count:wallet.chalk});
    $('useChalk').disabled=won||Boolean(animation)||!wallet.chalk||marks.has(player);
    $('useLantern').textContent=lanternSteps?t('lantern.active',{count:lanternSteps,steps:count('steps',lanternSteps)}):t('lantern.use');
    $('useLantern').disabled=won||Boolean(animation)||!wallet.lanterns||lanternSteps>0||n<=config.view;
    $('storageNote').textContent=t(storageOK?'storage.saved':'storage.session');
    for(const key of Object.keys(skins)){
      const button=$('skin-'+key);button.textContent=wallet.skin===key?t('shop.equipped'):wallet.owned.includes(key)?t('shop.equip'):count('coins',skins[key].price);
      button.disabled=wallet.skin===key||(!wallet.owned.includes(key)&&wallet.coins<skins[key].price);
    }
    for(const [key,item] of Object.entries(gear)){
      const button=$('gear-'+key);button.textContent=wallet[item.kind]===key?t('shop.equipped'):wallet.gear.includes(key)?t('shop.equip'):count('coins',item.price);
      button.disabled=wallet[item.kind]===key||(!wallet.gear.includes(key)&&wallet.coins<item.price);
    }
    draw();
  }
  function finish(){
    won=true;
    const score=currentScore(),reward=10+Math.ceil(level/5)+Math.floor(score/500);
    wallet.coins+=reward;wallet.bestsV2[level]=Math.max(wallet.bestsV2[level]||0,score);save();
    $('win').hidden=false;
    renderWin();
    message('message','message.win');
    $('playAgain').focus();
  }
  // Commit one legal tile transition, then animate only that edge. Busy input is
  // discarded, never accumulated into a velocity or a diagonal shortcut.
  function move(d){
    if(won||animation||($('shop').open||$('rules').open))return Promise.resolve(false);
    prepareAudio();
    const next=MazeCore.nextCell(cells,n,player,d);
    if(next===player)return Promise.resolve(false);
    const from=player,toX=next%n,toY=Math.floor(next/n);
    history.push({from,newVisit:!visited.has(next),newStar:stars.includes(next)&&!collected.has(next)});
    player=next;steps++;
    const epoch=generation;
    return new Promise(done=>{
      animation={from,to:next,done};
      const complete=()=>{
        if(epoch!==generation)return;
        renderX=toX;renderY=toY;animation=null;frame=0;
        visited.add(player);
        if(lanternSteps>0)lanternSteps--;
        if(hintPath[1]===player)hintPath=hintPath.slice(1);
        if(hintPath.length===1)hintPath=[];
        if(stars.includes(player)&&!collected.has(player)){
          collected.add(player);starDing();const left=stars.length-collected.size;
          message('message',left===0?'message.allStars':'message.found',{count:left});
        }
        if(player===exit){
          if(collected.size===stars.length)finish();
          else message('message','message.flag');
        }
        update();done(true);
      };
      if(reducedMotion){complete();return;}
      const x0=from%n,y0=Math.floor(from/n);let started=null;
      const tick=now=>{
        if(epoch!==generation)return;
        if(started===null)started=now;
        const t=Math.min(1,(now-started)/110),smooth=t*t*(3-2*t);
        renderX=x0+(toX-x0)*smooth;renderY=y0+(toY-y0)*smooth;
        draw();
        if(t<1)frame=requestAnimationFrame(tick);else complete();
      };
      update();frame=requestAnimationFrame(tick);
    });
  }
  function undo(){
    if(won||animation||($('shop').open||$('rules').open)||!history.length||wallet.coins<1)return false;
    const previous=history.pop();
    if(previous.newVisit)visited.delete(player);
    if(previous.newStar)collected.delete(player);
    player=previous.from;steps--;renderX=player%n;renderY=Math.floor(player/n);
    wallet.coins--;save();
    message('message','message.undo');
    update();return true;
  }
  function draw(){
    if(!config)return;
    const W=800,pad=25,view=Math.min(n,config.view+(lanternSteps?4:0)),s=(W-pad*2)/view;
    const ox=Math.max(0,Math.min(n-view,renderX-Math.floor(view/2))),oy=Math.max(0,Math.min(n-view,renderY-Math.floor(view/2)));
    // Include partially visible cells throughout a camera transition.
    const visible=i=>i%n+1>=ox&&i%n<=ox+view&&Math.floor(i/n)+1>=oy&&Math.floor(i/n)<=oy+view;
    const center=i=>[pad+(i%n-ox+.5)*s,pad+(Math.floor(i/n)-oy+.5)*s];
    ctx.clearRect(0,0,W,W);ctx.fillStyle=gear[wallet.theme].floor;ctx.fillRect(0,0,W,W);
    ctx.save();ctx.beginPath();ctx.rect(pad-5,pad-5,W-2*pad+10,W-2*pad+10);ctx.clip();
    if(config.trail)visited.forEach(i=>{if(!visible(i))return;const [x,y]=center(i);ctx.beginPath();ctx.arc(x,y,s*.075,0,Math.PI*2);ctx.fillStyle='#b4c6b0';ctx.fill();});
    if(hintPath.length){
      ctx.beginPath();hintPath.forEach((i,j)=>{const [x,y]=center(i);j?ctx.lineTo(x,y):ctx.moveTo(x,y);});
      ctx.strokeStyle='#43805b';ctx.lineWidth=s*.14;ctx.lineJoin='round';ctx.lineCap='round';ctx.stroke();
    }
    ctx.strokeStyle=gear[wallet.theme].wall;ctx.lineWidth=Math.max(4,s*.085);ctx.lineCap='round';ctx.beginPath();
    // All four walls are drawn, including the edge of the moving viewport.
    cells.forEach((walls,i)=>{
      if(!visible(i))return;
      const x=pad+(i%n-ox)*s,y=pad+(Math.floor(i/n)-oy)*s;
      if(walls[0]){ctx.moveTo(x,y);ctx.lineTo(x+s,y);}
      if(walls[1]){ctx.moveTo(x+s,y);ctx.lineTo(x+s,y+s);}
      if(walls[2]){ctx.moveTo(x,y+s);ctx.lineTo(x+s,y+s);}
      if(walls[3]){ctx.moveTo(x,y);ctx.lineTo(x,y+s);}
    });ctx.stroke();
    marks.forEach(i=>{if(!visible(i))return;const [x,y]=center(i);ctx.fillStyle=wallet.theme==='midnight'?'#ffffff':'#a04483';ctx.font='bold '+s*.45+'px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('◇',x,y);});
    stars.filter(i=>!collected.has(i)&&visible(i)).forEach(i=>{
      const [x,y]=center(i);ctx.beginPath();
      for(let k=0;k<10;k++){const a=-Math.PI/2+k*Math.PI/5,r=s*(k%2?.14:.29);k?ctx.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r):ctx.moveTo(x+Math.cos(a)*r,y+Math.sin(a)*r);}
      ctx.closePath();ctx.fillStyle='#eebc45';ctx.fill();ctx.strokeStyle='#a97126';ctx.lineWidth=2;ctx.stroke();
    });
    const [fx,fy]=center(exit);ctx.fillStyle=collected.size===stars.length?'#467b57':'#6b8471';ctx.font='bold '+s*.63+'px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';if(visible(exit))ctx.fillText('⚑',fx,fy);
    const x=pad+(renderX-ox+.5)*s,y=pad+(renderY-oy+.5)*s;
    ctx.beginPath();ctx.arc(x,y,s*.3,0,Math.PI*2);ctx.fillStyle=skins[wallet.skin].color;ctx.fill();ctx.strokeStyle='#243748';ctx.lineWidth=2.5;ctx.stroke();ctx.font='bold '+s*.34+'px sans-serif';ctx.fillStyle='#243748';ctx.fillText(gear[wallet.symbol].symbol,x,y+s*.025);ctx.restore();
  }
  function openShop(){$('shop').showModal();update();}
  function purchase(item){
    if(item==='chalk'||item==='lantern'){
      const price=item==='chalk'?15:25;if(wallet.coins<price)return false;
      wallet.coins-=price;wallet[item==='chalk'?'chalk':'lanterns']+=item==='chalk'?5:1;
      message('shopMessage',item==='chalk'?'shop.addChalk':'shop.addLantern');
    }else if(Object.hasOwn(gear,item)){
      if(!wallet.gear.includes(item)){if(wallet.coins<gear[item].price)return false;wallet.coins-=gear[item].price;wallet.gear.push(item);}
      wallet[gear[item].kind]=item;message('shopMessage','shop.itemEquipped',{item:{key:'item.'+item}});
    }else if(item==='hint'){
      if(wallet.coins<HINT_PRICE)return false;
      wallet.coins-=HINT_PRICE;wallet.tickets++;
      message('shopMessage','shop.addHint');
    }else if(Object.hasOwn(skins,item)){
      if(!wallet.owned.includes(item)){
        if(wallet.coins<skins[item].price)return false;
        wallet.coins-=skins[item].price;wallet.owned.push(item);
      }
      wallet.skin=item;message('shopMessage','shop.itemEquipped',{item:{key:'item.'+item}});
    }else return false;
    save();update();return true;
  }
  function useSupply(item){
    if(won||animation||($('shop').open||$('rules').open))return false;
    if(item==='chalk'){
      if(!wallet.chalk||marks.has(player))return false;
      wallet.chalk--;marks.add(player);message('message','message.chalk');
    }else if(item==='lantern'){
      if(!wallet.lanterns||lanternSteps||n<=config.view)return false;
      wallet.lanterns--;lanternsUsed++;lanternSteps=40;message('message','message.lantern');
    }else return false;
    save();update();return true;
  }
  function hint(){
    if(won||animation||$('rules').open)return false;
    if(!wallet.tickets){openShop();message('shopMessage','shop.needHint');return false;}
    const goals=stars.filter(i=>!collected.has(i));
    // Continue across nearby stars; only shorten when fewer than ten steps remain to win.
    const route=MazeCore.hintRoute(cells,n,player,goals.length?goals: [exit]);
    if(route.length<11&&goals.length){
      const tail=MazeCore.path(cells,n,route.at(-1),exit);
      route.push(...tail.slice(1,12-route.length));
    }
    if(route.length<2)return false;
    wallet.tickets--;hintsUsed++;hintPath=route;save();
    message('message','message.hint',{count:route.length-1,steps:{kind:'steps',count:route.length-1}});
    update();return true;
  }
  document.addEventListener('keydown',e=>{
    if(e.target.matches('input,select,textarea')||($('shop').open||$('rules').open))return;
    const d={ArrowUp:0,w:0,ArrowRight:1,d:1,ArrowDown:2,s:2,ArrowLeft:3,a:3}[e.key.length===1?e.key.toLowerCase():e.key];
    if(d!==undefined){e.preventDefault();void move(d);}
  });
  document.querySelectorAll('[data-dir]').forEach(b=>b.addEventListener('click',()=>void move(Number(b.dataset.dir))));
  for(let i=1;i<=100;i++){const option=document.createElement('option');option.value=String(i);$('levelSelect').append(option);}
  $('levelSelect').addEventListener('change',e=>start(Number(e.target.value)));
  $('previousLevel').addEventListener('click',()=>{if(level>1)start(level-1);});
  $('nextLevel').addEventListener('click',()=>{if(level<100)start(level+1);});
  $('restartMaze').addEventListener('click',()=>{if(!won)return;start(level,variant);canvas.focus({preventScroll:true});});
  $('newMaze').addEventListener('click',()=>start(level,variant+1));
  $('playAgain').addEventListener('click',()=>{level===100?start(100,variant+1):start(level+1);canvas.focus({preventScroll:true});});
  $('hint').addEventListener('click',hint);
  $('undo').addEventListener('click',undo);
  $('openRules').addEventListener('click',()=>$('rules').showModal());
  $('closeRules').addEventListener('click',()=>$('rules').close());
  $('openShop').addEventListener('click',openShop);
  $('closeShop').addEventListener('click',()=>$('shop').close());
  $('buyHint').addEventListener('click',()=>purchase('hint'));
  for(const key of Object.keys(skins))$('skin-'+key).addEventListener('click',()=>purchase(key));
  for(const key of Object.keys(gear))$('gear-'+key).addEventListener('click',()=>purchase(key));
  $('buyChalk').addEventListener('click',()=>purchase('chalk'));$('buyLantern').addEventListener('click',()=>purchase('lantern'));
  $('useChalk').addEventListener('click',()=>useSupply('chalk'));$('useLantern').addEventListener('click',()=>useSupply('lantern'));
  let touch;
  canvas.addEventListener('pointerdown',e=>{touch=[e.clientX,e.clientY];canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointerup',e=>{
    if(!touch)return;const dx=e.clientX-touch[0],dy=e.clientY-touch[1];touch=null;
    if(Math.max(Math.abs(dx),Math.abs(dy))>12)void move(Math.abs(dx)>Math.abs(dy)?(dx>0?1:3):(dy>0?2:0));
  });
  canvas.addEventListener('pointercancel',()=>touch=null);
  for(const [code,locale] of Object.entries(MazeI18n.locales)){
    const option=document.createElement('option');option.value=code;option.textContent=locale.name;option.lang=code;$('languageSelect').append(option);
  }
  $('languageSelect').value=MazeI18n.locale;
  $('languageSelect').addEventListener('change',e=>{
    MazeI18n.remember(e.target.value,preferenceStorage);
    MazeI18n.render(document);renderLevel();update();
  });
  MazeI18n.render(document);
  start(wallet.lastLevel);
  if(document.modelContext?.registerTool){
    const lifecycle=new AbortController();
    const state=()=>({level,size:n,position:{x:player%n,y:Math.floor(player/n)},starsCollected:collected.size,starsRequired:stars.length,steps,won,score:currentScore(),hintsUsed,lanternsUsed,lanternSteps,marks:marks.size,coins:wallet.coins,hintTickets:wallet.tickets,hintSteps:hintPath.length?hintPath.length-1:0});
    const definitions=[
      {name:'start_maze',description:'Start one of 100 maze levels, replacing the current game.',inputSchema:{type:'object',properties:{level:{type:'integer',minimum:1,maximum:100}},required:['level'],additionalProperties:false},execute(input){MazeCore.settings(input?.level);start(input.level);return state();}},
      {name:'move_in_maze',description:'Move through up to 100 directions, respecting walls and waiting for each animation.',inputSchema:{type:'object',properties:{directions:{type:'array',items:{type:'string',enum:['up','right','down','left']},minItems:1,maxItems:100}},required:['directions'],additionalProperties:false},async execute(input){
        const values=['up','right','down','left'];
        if(!Array.isArray(input?.directions)||input.directions.length<1||input.directions.length>100||input.directions.some(d=>!values.includes(d)))throw new Error('Provide 1–100 valid directions.');
        const epoch=generation;
        for(const d of input.directions){if(epoch!==generation)break;await move(values.indexOf(d));}
        return state();
      }},
      {name:'show_maze_hint',description:'Spend one purchased hint ticket and reduce the run score by 20% to reveal ten steps. Opens the shop if no tickets remain.',inputSchema:{type:'object',properties:{},additionalProperties:false},execute(){hint();return state();}}
    ];
    definitions.forEach(tool=>{try{Promise.resolve(document.modelContext.registerTool({...tool,annotations:{readOnlyHint:false,untrustedContentHint:false}},{signal:lifecycle.signal})).catch(()=>{});}catch{}});
    window.addEventListener('pagehide',()=>{stopMotion();lifecycle.abort();},{once:true});
  }
})();
