/* FAVOUR MEDIA / video + audio library.
   Static GitHub Pages front end. No analytics, accounts, or uploads.
   The only public items come from media/catalog.js. */
(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const elements = {
    channelCount:$("channel-count"), playerFile:$("player-file"),
    emptyHero:$("empty-hero"), screen:$("player-screen"),
    video:$("video-player"), audio:$("audio-player"),
    audioControls:$("audio-controls"), audioArt:$("audio-art"),
    audioTitle:$("audio-title"), title:$("player-title"),
    description:$("player-description"), meta:$("player-meta"),
    playerError:$("player-error"), transcriptBox:$("transcript-box"),
    transcript:$("transcript-content"), copy:$("copy-link"),
    queue:$("queue-items"), grid:$("media-grid"),
    count:$("result-count"), listStatus:$("list-status"),
    search:$("library-search"), category:$("category-filter"),
    sort:$("sort-order"), picker:$("preview-file"),
    clearPreview:$("clear-preview"), previewStatus:$("preview-status")
  };
  const raw=Array.isArray(window.FAVOUR_RECORDINGS)?window.FAVOUR_RECORDINGS:[];
  const getText=(value,max=350)=>typeof value==="string"?value.trim().slice(0,max):"";
  const isMediaPath=(input)=>{
    const str=getText(input,2048);
    if(!str||str.startsWith("//")||/^(?:javascript|data|file|blob):/i.test(str))return false;
    try{
      const url=new URL(str,document.baseURI);
      return ["http:","https:"].includes(url.protocol);
    }catch{return false}
  };
  const catalog=raw.filter(item=>item&&typeof item==="object"&&
    ["video","audio"].includes(item.type)&&
    /^[a-z0-9][a-z0-9-]{1,70}$/.test(item.id||"")&&
    getText(item.title,180)&&isMediaPath(item.src)
  ).map(item=>({
    id:item.id,type:item.type,title:getText(item.title,180),
    category:getText(item.category,60)||"Uncategorized",
    description:getText(item.description,1200),
    date:/^\d{4}-\d{2}-\d{2}$/.test(item.date||"")?item.date:"",
    duration:getText(item.duration,18),
    poster:isMediaPath(item.poster)?item.poster:"",
    captions:isMediaPath(item.captions)?item.captions:"",
    transcript:getText(item.transcript,18000),
    src:item.src
  }));
  const seen=new Set();
  const items=catalog.filter(item=>{
    if(seen.has(item.id))return false;
    seen.add(item.id);return true;
  });
  let filter="all",selected=null,localUrl=null,previewItem=null;
  const dateLabel=iso=>{
    if(!iso)return"UNDATED";
    const d=new Date(iso+"T12:00:00");
    return Number.isNaN(d.getTime())?"UNDATED":new Intl.DateTimeFormat(undefined,{year:"numeric",month:"short",day:"numeric"}).format(d);
  };
  const updateCount=()=>{
    elements.channelCount.textContent=items.length===1?"1 PUBLISHED RECORDING":items.length+" PUBLISHED RECORDINGS";
  };
  const make=(tag,props={},children=[])=>{
    const node=document.createElement(tag);
    for(const [key,value] of Object.entries(props)){
      if(key==="text")node.textContent=value;
      else if(key==="className")node.className=value;
      else node.setAttribute(key,value);
    }
    for(const child of children)node.append(child);
    return node;
  };
  const setVisible=(element,visible)=>element.classList.toggle("media-hidden",!visible);
  const stopPlayers=()=>{
    elements.video.pause();elements.audio.pause();
    elements.video.removeAttribute("src");elements.video.removeAttribute("poster");
    elements.audio.removeAttribute("src");
    elements.video.querySelectorAll("track").forEach(track=>track.remove());
    elements.video.load();elements.audio.load();
    setVisible(elements.video,false);setVisible(elements.audioControls,false);
    setVisible(elements.audioArt,false);
  };
  const removeObject=()=>{
    if(localUrl){URL.revokeObjectURL(localUrl);localUrl=null}
    previewItem=null;
    elements.picker.value="";
    elements.clearPreview.disabled=true;
    elements.previewStatus.textContent="NO FILE SELECTED. LOCAL PREVIEW IS OFF.";
  };
  const clearPlayer=()=>{
    selected=null;stopPlayers();
    setVisible(elements.emptyHero,true);
    setVisible(elements.copy,false);setVisible(elements.transcriptBox,false);
    setVisible(elements.playerError,false);
    elements.playerFile.textContent="NOW_PLAYING / NO_FILE_SELECTED";
    elements.meta.textContent="FAVOUR MEDIA / YOUR WATCH & LISTEN SPACE";
    elements.title.textContent="Welcome to FAVOUR Media.";
    elements.description.textContent="Your recordings will appear here when you publish them. You can test an existing recording locally using the preview controls farther down the page.";
    markSelection();
  };
  const markSelection=()=>{
    document.querySelectorAll("[data-media-id]").forEach(node=>{
      const current=!!selected&&node.dataset.mediaId===selected.id;
      node.setAttribute("aria-current",String(current));
    });
  };
  const selectMedia=(item,local=false)=>{
    if(!item)return;
    if(!local)removeObject();
    stopPlayers();
    selected=item;
    elements.playerFile.textContent=(local?"LOCAL_PREVIEW":"PUBLISHED")+" / "+item.type.toUpperCase()+" / "+item.id.toUpperCase();
    elements.meta.textContent=[item.type==="video"?"VIDEO RECORDING":"AUDIO RECORDING",item.category.toUpperCase(),dateLabel(item.date)].join(" · ");
    elements.title.textContent=local?"Private preview: "+item.title:item.title;
    elements.description.textContent=local?"This file is being played from your device. It has not been uploaded, published, or added to the library.":item.description||"A recording from the FAVOUR media archive.";
    setVisible(elements.emptyHero,false);
    setVisible(elements.playerError,false);
    setVisible(elements.copy,!local);
    setVisible(elements.transcriptBox,!!item.transcript);
    elements.transcript.textContent=item.transcript||"";
    if(item.type==="video"){
      setVisible(elements.video,true);
      elements.video.src=item.src;
      if(item.poster)elements.video.poster=item.poster;
      if(item.captions){
        const track=make("track",{kind:"captions",src:item.captions,srclang:"en",label:"English captions"});
        elements.video.append(track);
      }
      elements.video.load();
    }else{
      setVisible(elements.audioArt,true);
      setVisible(elements.audioControls,true);
      elements.audioTitle.textContent=item.title;
      elements.audio.src=item.src;
      elements.audio.load();
    }
    markSelection();
  };
  const playCard=(item)=>{
    selectMedia(item);
    if(window.location.hash!=="#watch-"+item.id)history.replaceState(null,"","#watch-"+item.id);
    document.querySelector(".player-shell").scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"});
  };
  function mediaIcon(item){
    const poster=make("div",{className:"poster"});
    if(item.poster){
      poster.append(make("img",{src:item.poster,alt:"",loading:"lazy"}));
    }else{
      const symbol=make("span",{text:item.type==="video"?"▷":"♫"});
      symbol.style.cssText="font-size:66px;color:#14232a;line-height:1;font-weight:700";
      poster.append(symbol);
    }
    if(item.duration)poster.append(make("span",{className:"duration",text:item.duration}));
    return poster;
  }
  function card(item,small=false){
    const b=make("button",{type:"button",className:small?"queue-button "+item.type:"media-card "+item.type,"data-media-id":item.id,"aria-current":String(selected?.id===item.id)});
    if(small){
      b.append(make("span",{className:"queue-thumb",text:item.type==="video"?"▷":"♫"}));
      const body=make("span");
      body.append(make("strong",{text:item.title}),make("small",{text:item.type.toUpperCase()+" · "+(item.duration||item.category)}));
      b.append(body);
    }else{
      b.append(mediaIcon(item));
      const body=make("div",{className:"card-body"});
      body.append(make("span",{className:"kind",text:item.type.toUpperCase()+" / "+item.category.toUpperCase()}),
        make("h3",{text:item.title}),
        make("p",{text:[dateLabel(item.date),item.duration||"PLAYABLE RECORDING"].join(" · ")}));
      b.append(body);
    }
    b.addEventListener("click",()=>playCard(item));
    return b;
  }
  function renderQueue(){
    elements.queue.replaceChildren();
    if(!items.length){
      elements.queue.append(make("p",{className:"queue-empty",text:"Your queue will appear after you publish a video or audio recording."}));
      return;
    }
    for(const item of items.slice(0,8))elements.queue.append(card(item,true));
  }
  function renderLibrary(){
    const term=elements.search.value.trim().toLocaleLowerCase();
    const cat=elements.category.value;
    const order=elements.sort.value;
    const found=items.filter(item=>
      (filter==="all"||item.type===filter)&&
      (cat==="all"||item.category===cat)&&
      (!term||[item.title,item.description,item.category].join(" ").toLocaleLowerCase().includes(term))
    ).sort((a,b)=>{
      if(order==="title")return a.title.localeCompare(b.title);
      const cmp=(a.date||"").localeCompare(b.date||"");
      return order==="oldest"?cmp||a.title.localeCompare(b.title):-cmp||a.title.localeCompare(b.title);
    });
    elements.grid.replaceChildren();
    for(const item of found)elements.grid.append(card(item));
    if(!found.length){
      const empty=make("div",{className:"no-result"});
      empty.append(make("h3",{text:items.length?"Nothing matches these filters.":"Your recording shelf is ready."}),
        make("p",{text:items.length?"Try another search, format, or category.":"Publish your first recording to fill this space. Until then, browse the ideas below or preview a file privately from your device."}));
      elements.grid.append(empty);
    }
    elements.count.textContent="[ "+String(found.length).padStart(2,"0")+" / "+String(items.length).padStart(2,"0")+" FILES ]";
    elements.listStatus.textContent=items.length?found.length+" of "+items.length+" published recordings shown.":"No recordings published yet.";
    markSelection();
  }
  function renderCategories(){
    const categories=[...new Set(items.map(item=>item.category))].sort((a,b)=>a.localeCompare(b));
    for(const category of categories)elements.category.append(make("option",{value:category,text:category.toUpperCase()}));
  }
  for(const button of document.querySelectorAll("[data-filter]")){
    button.addEventListener("click",()=>{
      filter=button.dataset.filter;
      for(const b of document.querySelectorAll("[data-filter]"))b.setAttribute("aria-pressed",String(b===button));
      renderLibrary();
    });
  }
  elements.search.addEventListener("input",renderLibrary);
  elements.category.addEventListener("change",renderLibrary);
  elements.sort.addEventListener("change",renderLibrary);
  elements.copy.addEventListener("click",async()=>{
    if(!selected||previewItem)return;
    const link=new URL("#watch-"+selected.id,window.location.href).href;
    try{
      if(!navigator.clipboard?.writeText)throw Error("Clipboard not available");
      await navigator.clipboard.writeText(link);
      elements.copy.textContent="LINK COPIED ✓";
      setTimeout(()=>elements.copy.textContent="COPY EPISODE LINK ↗",2500);
    }catch{
      elements.copy.textContent="USE BROWSER SHARE MENU";
      setTimeout(()=>elements.copy.textContent="COPY EPISODE LINK ↗",3500);
    }
  });
  for(const media of [elements.audio,elements.video]){
    media.addEventListener("error",()=>{
      if(!media.currentSrc)return;
      elements.playerError.textContent="This recording could not be played. Check the file URL and encoding, or try a different browser.";
      setVisible(elements.playerError,true);
    });
  }
  elements.picker.addEventListener("change",()=>{
    const file=elements.picker.files?.[0];
    if(!file)return;
    const name=file.name||"Untitled recording";
    const isVideo=file.type.startsWith("video/")||/\.(?:mp4|mov|webm|m4v)$/i.test(name);
    const isAudio=file.type.startsWith("audio/")||/\.(?:mp3|m4a|aac|wav|oga|ogg)$/i.test(name);
    if(!isVideo&&!isAudio){
      elements.previewStatus.textContent="FILE NOT SUPPORTED. CHOOSE A VIDEO OR AUDIO RECORDING.";
      elements.picker.value="";return;
    }
    stopPlayers();removeObject();
    localUrl=URL.createObjectURL(file);
    previewItem={id:"preview",type:isVideo?"video":"audio",title:name,src:localUrl,category:"LOCAL FILE",description:"",date:"",duration:"",poster:"",captions:"",transcript:""};
    elements.clearPreview.disabled=false;
    elements.previewStatus.textContent="PRIVATE PREVIEW READY / "+name+" / "+(file.size/1048576).toFixed(1)+" MB";
    selectMedia(previewItem,true);
    document.querySelector(".player-shell").scrollIntoView({behavior:"smooth",block:"start"});
  });
  elements.clearPreview.addEventListener("click",()=>{
    if(!previewItem)return;
    stopPlayers();removeObject();clearPlayer();
    elements.previewStatus.textContent="LOCAL PREVIEW REMOVED. NO RECORDING WAS UPLOADED.";
  });
  window.addEventListener("pagehide",()=>{if(localUrl)URL.revokeObjectURL(localUrl)});
  const init=()=>{
    updateCount();renderCategories();renderQueue();renderLibrary();clearPlayer();
    if(window.location.hash.startsWith("#watch-")){
      const id=decodeURIComponent(window.location.hash.slice(7));
      const item=items.find(candidate=>candidate.id===id);
      if(item)selectMedia(item);
    }
  };
  init();
})();
