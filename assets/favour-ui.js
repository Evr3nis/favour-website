
/* FAVOUR OS: small, offline-friendly enhancements. No analytics or third-party scripts. */
(() => {
  "use strict";
  const body=document.body;
  const isArticle=!!document.querySelector(".story");
  const onJournal=/\/journal\//.test(window.location.pathname);
  const base=onJournal?"../index.html":"";
  const pageUrl=(anchor)=>onJournal?base+"#"+anchor:"#"+anchor;
  const safeRead=(key)=>{try{return localStorage.getItem(key)}catch{return null}};
  const safeWrite=(key,value)=>{try{localStorage.setItem(key,value)}catch{}};
  const systemReduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const palettes=["mint","violet","amber"];
  let palette=safeRead("favour-palette");
  if(!palettes.includes(palette))palette="mint";
  let scanlines=safeRead("favour-scanlines")!=="off";
  let motion=safeRead("favour-motion")==="on" || (safeRead("favour-motion")!=="off" && !systemReduce);
  body.dataset.palette=palette;
  body.classList.toggle("fx-no-scanlines",!scanlines);
  body.classList.toggle("fx-no-motion",!motion);
  const progress=document.createElement("div");
  progress.className="fx-progress";
  progress.setAttribute("aria-hidden","true");
  body.prepend(progress);
  const header=document.querySelector("header");
  if(!header)return;
  const ctrl=document.createElement("div");
  ctrl.className="wrap fx-controls";
  ctrl.innerHTML='<span class="fx-name"><span class="fx-light" aria-hidden="true"></span>FAVOUR_OS // DISPLAY SETTINGS</span><div class="fx-actions"><button type="button" id="fx-palette" class="fx-control" title="Change the accent colors">PALETTE: MINT</button><button type="button" id="fx-scan" class="fx-control" aria-pressed="true">CRT: ON</button><button type="button" id="fx-motion" class="fx-control" aria-pressed="true">MOTION: ON</button><button type="button" id="fx-menu" class="fx-control fx-primary" aria-haspopup="dialog" aria-controls="fx-modal">⌕ NAVIGATE</button></div>';
  header.insertAdjacentElement("afterend",ctrl);
  const paletteBtn=ctrl.querySelector("#fx-palette");
  const crtBtn=ctrl.querySelector("#fx-scan");
  const motionBtn=ctrl.querySelector("#fx-motion");
  function paint(){
    body.dataset.palette=palette;
    paletteBtn.textContent="PALETTE: "+palette.toUpperCase();
    crtBtn.textContent="CRT: "+(scanlines?"ON":"OFF");
    crtBtn.setAttribute("aria-pressed",String(scanlines));
    motionBtn.textContent="MOTION: "+(motion?"ON":"OFF");
    motionBtn.setAttribute("aria-pressed",String(motion));
    body.classList.toggle("fx-no-scanlines",!scanlines);
    body.classList.toggle("fx-no-motion",!motion);
  }
  paint();
  paletteBtn.addEventListener("click",()=>{palette=palettes[(palettes.indexOf(palette)+1)%palettes.length];safeWrite("favour-palette",palette);paint()});
  crtBtn.addEventListener("click",()=>{scanlines=!scanlines;safeWrite("favour-scanlines",scanlines?"on":"off");paint()});
  motionBtn.addEventListener("click",()=>{motion=!motion;safeWrite("favour-motion",motion?"on":"off");paint()});
  const links=[
    ["Home screen",onJournal?"../index.html":"#top","HOME"],
    ["About Favour",pageUrl("about"),"ABOUT"],
    ["Interests / obsessions",pageUrl("curiosities"),"INTERESTS"],
    ["Journal directory",pageUrl("journal"),"JOURNAL"],
    ["FAVOUR Media · video and audio channel",onJournal?"../media/":"media/","MEDIA"],
    ["Open notebook",pageUrl("notebook"),"NOTEBOOK"],
    ["Essay 001 · The quiet distance between people",onJournal?"quiet-distance.html":"journal/quiet-distance.html","PSYCHOLOGY"],
    ["Essay 002 · Why fictional characters make us think",onJournal?"fictional-characters.html":"journal/fictional-characters.html","MEDIA"]
  ];
  const modal=document.createElement("div");
  modal.id="fx-modal";modal.className="fx-modal";modal.hidden=true;
  modal.innerHTML='<button type="button" class="fx-backdrop" aria-label="Close navigation menu"></button><div class="fx-panel" role="dialog" aria-modal="true" aria-labelledby="fx-modal-title"><div class="fx-modalbar"><span id="fx-modal-title">QUICK_NAVIGATION.exe</span><button type="button" class="fx-x" aria-label="Close navigation menu">×</button></div><div class="fx-modalbody"><label for="fx-search">SEARCH YOUR DESTINATION</label><input id="fx-search" class="fx-search" type="search" placeholder="Type a page or topic..." autocomplete="off" spellcheck="false"><div id="fx-results" class="fx-results"></div><p class="fx-hint">TIP: PRESS / OR CTRL/⌘ + K TO OPEN. ESC TO CLOSE.</p></div></div>';
  body.append(modal);
  const search=modal.querySelector("#fx-search");
  const resultBox=modal.querySelector("#fx-results");
  let previousFocus=null;
  function renderResults(){
    resultBox.replaceChildren();
    const term=search.value.trim().toLowerCase();
    const visible=links.filter(([name,,type])=>(name+" "+type).toLowerCase().includes(term));
    visible.forEach(([name,url,type])=>{
      const a=document.createElement("a");a.href=url;
      const t=document.createElement("span");t.textContent=name;
      const s=document.createElement("small");s.textContent=type+" ↗";
      a.append(t,s);a.addEventListener("click",closeModal);
      resultBox.append(a);
    });
    if(!visible.length){const p=document.createElement("p");p.className="fx-none";p.textContent="NO FILES FOUND. TRY ANOTHER SEARCH.";resultBox.append(p)}
  }
  function openModal(){previousFocus=document.activeElement;modal.hidden=false;search.value="";renderResults();search.focus()}
  function closeModal(){modal.hidden=true;if(previousFocus&&previousFocus.focus)previousFocus.focus()}
  ctrl.querySelector("#fx-menu").addEventListener("click",openModal);
  modal.querySelector(".fx-backdrop").addEventListener("click",closeModal);
  modal.querySelector(".fx-x").addEventListener("click",closeModal);
  search.addEventListener("input",renderResults);
  modal.addEventListener("keydown",e=>{
    if(e.key==="Escape"){e.preventDefault();closeModal();return}
    if(e.key==="Tab"){
      const focusables=[...modal.querySelectorAll("button,input,a")].filter(el=>el.getClientRects().length);
      const first=focusables[0],last=focusables[focusables.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
    }
    if(e.key==="Enter"&&document.activeElement===search){const a=resultBox.querySelector("a");if(a){window.location.href=a.href}}
  });
  document.addEventListener("keydown",e=>{
    if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();modal.hidden?openModal():closeModal()}
    else if(e.key==="/" && !e.metaKey&&!e.ctrlKey&&!e.altKey&&!/input|textarea|select/i.test(document.activeElement?.tagName||"")&&modal.hidden){e.preventDefault();openModal()}
    else if(e.key==="Escape"&&!modal.hidden){closeModal()}
  });
  function updateProgress(){
    const max=Math.max(0,document.documentElement.scrollHeight-window.innerHeight);
    const ratio=max?Math.min(1,Math.max(0,window.scrollY/max)):0;
    progress.style.width=(ratio*100).toFixed(1)+"%";
  }
  window.addEventListener("scroll",updateProgress,{passive:true});
  window.addEventListener("resize",updateProgress,{passive:true});
  updateProgress();
  const toast=document.createElement("div");
  toast.className="fx-toast";toast.hidden=true;toast.setAttribute("role","status");toast.setAttribute("aria-live","polite");body.append(toast);
  let toastTimeout;
  function notify(msg){toast.textContent=msg;toast.hidden=false;clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>toast.hidden=true,3000)}
  // Turn the six interest cards into expandable topic windows (not external links).
  const detail=document.getElementById("fx-topic-detail");
  if(detail){
    const topics={
      mind:{title:"THE HUMAN MIND",text:"A research shelf for questions about personality, development, identity, emotions, and what shapes the way people respond to the world.",link:"journal/quiet-distance.html",label:"READ: THE QUIET DISTANCE"},
      questions:{title:"THE BIG QUESTIONS",text:"Philosophy, ethics, uncertainty, belief, and how to examine an idea without assuming the first answer is always the final one.",link:"#notebook",label:"EXPLORE THE NOTEBOOK"},
      society:{title:"PEOPLE & SOCIETY",text:"Education, belonging, social pressures, inequality, and the ways institutions affect ordinary everyday experiences.",link:"journal/quiet-distance.html",label:"READ: THE QUIET DISTANCE"},
      screens:{title:"SCREEN CULTURE",text:"Animated satire and stories can become doorways into history, psychology, culture, and critical analysis.",link:"journal/fictional-characters.html",label:"READ: FICTIONAL CHARACTERS"},
      design:{title:"DESIGN & IDEAS",text:"Sketchbooks of imaginary media worlds, visual identities, and creative experiments. Not every project needs to be complete to be worth exploring.",link:"#about",label:"MEET THE CREATOR"},
      learning:{title:"THE LEARNING LOG",text:"A place for books, notes, research questions, new vocabulary, and the small discoveries that accumulate over time.",link:"#notebook",label:"OPEN THE NOTEBOOK"}
    };
    const heading=detail.querySelector("[data-topic-heading]");
    const paragraph=detail.querySelector("[data-topic-text]");
    const a=detail.querySelector("[data-topic-link]");
    const cards=[...document.querySelectorAll(".fx-topic")];
    let current=null;
    function closeTopic(refocus){
      detail.hidden=true;cards.forEach(c=>c.setAttribute("aria-expanded","false"));
      const focusTarget=current;current=null;
      if(refocus&&focusTarget)focusTarget.focus();
    }
    cards.forEach(card=>card.addEventListener("click",()=>{
      const wasOpen=current===card&&!detail.hidden;
      closeTopic(false);if(wasOpen)return;
      const t=topics[card.dataset.topic];if(!t)return;
      heading.textContent=t.title;paragraph.textContent=t.text;a.href=t.link;a.textContent=t.label+" ↗";
      detail.hidden=false;card.setAttribute("aria-expanded","true");current=card;
      if(window.matchMedia("(max-width: 620px)").matches){detail.scrollIntoView({behavior:motion?"smooth":"auto",block:"nearest"})}
    }));
    detail.querySelector("[data-topic-close]").addEventListener("click",()=>closeTopic(true));
  }
  // An uncluttered reader mode, link copying, and reading-time estimate on the essays.
  if(isArticle){
    const story=document.querySelector(".story");
    const words=story.textContent.trim().split(/\s+/).filter(Boolean).length;
    const minutes=Math.max(1,Math.ceil(words/200));
    const actions=ctrl.querySelector(".fx-actions");
    const read=document.createElement("button");read.type="button";read.className="fx-control";read.id="fx-reader";read.setAttribute("aria-pressed","false");read.textContent="FOCUS: OFF";
    const copy=document.createElement("button");copy.type="button";copy.className="fx-control";copy.textContent="COPY LINK";
    const time=document.createElement("span");time.className="fx-name";time.textContent="~"+minutes+" MIN READ";
    actions.prepend(read,copy);
    ctrl.querySelector(".fx-name").append(" / ",time.textContent);
    read.addEventListener("click",()=>{let enabled=body.classList.toggle("fx-reader-mode");read.textContent="FOCUS: "+(enabled?"ON":"OFF");read.setAttribute("aria-pressed",String(enabled))});
    copy.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(window.location.href);notify("ARTICLE LINK COPIED ✓")}catch{notify("USE SAFARI'S SHARE BUTTON TO COPY THE LINK")}});
  }
})();
