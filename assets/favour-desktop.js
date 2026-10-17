
/* FAVOUR OS 2.0 — interactive mini desktop and reading controls.
   No analytics, no network requests. Draft notes are browser-local only. */
(() => {
  "use strict";
  const root=document.getElementById("os-desktop");
  const article=document.querySelector(".story");
  const safeGet=k=>{try{return localStorage.getItem(k)}catch{return null}};
  const safeSet=(k,v)=>{try{localStorage.setItem(k,v);return true}catch{return false}};
  function addReadingControls(){
    if(!article)return;
    const actions=document.querySelector(".fx-actions");
    if(!actions)return;
    let size=Number(safeGet("favour-reading-scale")||"1");
    if(!Number.isFinite(size)||size<1||size>1.3)size=1;
    const dec=document.createElement("button");
    const inc=document.createElement("button");
    [dec,inc].forEach(button=>{button.type="button";button.className="fx-control"});
    dec.textContent="A−";dec.setAttribute("aria-label","Decrease article text size");
    inc.textContent="A+";inc.setAttribute("aria-label","Increase article text size");
    dec.title="Smaller article text";inc.title="Larger article text";
    function render(){
      article.style.setProperty("--os-reading-scale",size.toFixed(2));
      dec.disabled=size<=1;inc.disabled=size>=1.3;
      dec.setAttribute("aria-label","Decrease article text size (current "+Math.round(size*100)+" percent)");
      inc.setAttribute("aria-label","Increase article text size (current "+Math.round(size*100)+" percent)");
      safeSet("favour-reading-scale",size.toString());
    }
    dec.addEventListener("click",()=>{size=Math.max(1,Math.round((size-.15)*100)/100);render()});
    inc.addEventListener("click",()=>{size=Math.min(1.3,Math.round((size+.15)*100)/100);render()});
    actions.prepend(dec,inc);render();
  }
  addReadingControls();
  if(!root)return;
  const buttons=[...root.querySelectorAll(".os-launch")];
  const windows=[...root.querySelectorAll(".os-window")];
  const clock=document.getElementById("os-clock");
  const storageKey="favour-quick-notes-v1";
  let z=6;
  let active="terminal";
  function openApp(name){
    const windowEl=windows.find(w=>w.dataset.window===name);
    if(!windowEl)return;
    windowEl.hidden=false;
    z+=1;windowEl.style.zIndex=String(z);
    windows.forEach(w=>w.classList.toggle("os-active",w===windowEl));
    buttons.forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.open===name)));
    active=name;
    const target=name==="terminal"?windowEl.querySelector(".os-terminal-input"):name==="notes"?windowEl.querySelector(".os-note-input"):windowEl.querySelector(".os-filelist a");
    if(target)target.focus({preventScroll:true});
  }
  function closeApp(name){
    const w=windows.find(w=>w.dataset.window===name);
    if(!w)return;
    w.hidden=true;w.classList.remove("os-active");
    const remaining=windows.filter(el=>!el.hidden);
    if(remaining.length){
      remaining.sort((a,b)=>(Number(a.style.zIndex)||0)-(Number(b.style.zIndex)||0));
      openApp(remaining[remaining.length-1].dataset.window);
    } else {
      active="";
      buttons.forEach(b=>b.setAttribute("aria-pressed","false"));
      const launcher=buttons.find(b=>b.dataset.open===name);
      if(launcher)launcher.focus({preventScroll:true});
    }
  }
  buttons.forEach(b=>b.addEventListener("click",()=>openApp(b.dataset.open)));
  root.querySelectorAll("[data-os-close]").forEach(b=>b.addEventListener("click",()=>closeApp(b.dataset.osClose)));
  windows.forEach(w=>{
    w.addEventListener("pointerdown",()=>{if(!w.hidden&&active!==w.dataset.window){
      z+=1;w.style.zIndex=String(z);
      windows.forEach(el=>el.classList.toggle("os-active",el===w));
      buttons.forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.open===w.dataset.window)));
      active=w.dataset.window;
    }});
  });
  // Drag desktop windows by the title bar; mobile uses accessible launcher buttons instead.
  windows.forEach(w=>{
    const bar=w.querySelector(".os-titlebar");
    if(!bar)return;
    let drag=null;
    bar.addEventListener("pointerdown",e=>{
      if(window.innerWidth<820||e.button!==0||e.target.closest("button"))return;
      const wr=w.getBoundingClientRect(),rr=root.getBoundingClientRect();
      drag={id:e.pointerId,offsetX:e.clientX-wr.left,offsetY:e.clientY-wr.top,rr};
      bar.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    bar.addEventListener("pointermove",e=>{
      if(!drag||drag.id!==e.pointerId)return;
      const rr=root.getBoundingClientRect(),wr=w.getBoundingClientRect();
      const left=Math.max(0,Math.min(rr.width-wr.width,e.clientX-rr.left-drag.offsetX));
      const top=Math.max(38,Math.min(rr.height-wr.height-47,e.clientY-rr.top-drag.offsetY));
      w.style.left=left+"px";w.style.top=top+"px";w.style.right="auto";
    });
    const end=e=>{if(drag&&drag.id===e.pointerId)drag=null};
    bar.addEventListener("pointerup",end);
    bar.addEventListener("pointercancel",end);
    bar.addEventListener("lostpointercapture",()=>drag=null);
  });
  function setClock(){
    if(!clock)return;
    const now=new Date();
    clock.textContent=new Intl.DateTimeFormat(undefined,{hour:"2-digit",minute:"2-digit"}).format(now);
    clock.dateTime=now.toISOString();
    clock.title="Time on your device";
  }
  setClock();setInterval(setClock,60000);
  const log=root.querySelector(".os-log"),form=root.querySelector(".os-terminal-form");
  const input=root.querySelector(".os-terminal-input");
  function line(content,kind){
    if(!log)return;
    const p=document.createElement("p");p.className=kind==="command"?"os-command":"os-output";p.textContent=content;
    log.append(p);log.scrollTop=log.scrollHeight;
  }
  function exec(command){
    const raw=command.trim().slice(0,120),cmd=raw.toLowerCase().replace(/\s+/g," ");
    if(!raw)return;
    if(cmd==="clear"){log.replaceChildren();line("Screen cleared. Type HELP to view commands.","output");return}
    line("C:\\FAVOUR> "+raw,"command");
    if(cmd==="help"){line("COMMANDS: HELP | ABOUT | JOURNAL | INTERESTS | NOTES | FILES | TIME | STATUS | THEME [MINT/VIOLET/AMBER] | OPEN 1 | OPEN 2 | CLEAR","output")}
    else if(cmd==="about"||cmd==="whoami"){line("FAVOUR: reader, student and independent creator. Interests: psychology, philosophy, society, cartoons, research and design.","output")}
    else if(cmd==="journal"){line("2 entries: [1] The quiet distance between people; [2] Why fictional characters make us think. Type OPEN 1 or OPEN 2.","output")}
    else if(cmd==="interests"){line("Opening interests directory ...","output");setTimeout(()=>document.getElementById("curiosities")?.scrollIntoView({behavior:document.body.classList.contains("fx-no-motion")?"instant":"smooth"}),150)}
    else if(cmd==="notes"){line("Opening NOTES.TXT ...","output");openApp("notes")}
    else if(cmd==="files"){line("Opening FILES/ ...","output");openApp("files")}
    else if(cmd==="time"||cmd==="date"){line(new Date().toLocaleString(),"output")}
    else if(cmd==="status"){line("FAVOUR OS ONLINE. LOCAL STORAGE: "+(safeGet("favour-palette")===null?"DEVICE ONLY (WHEN ALLOWED)":"DEVICE ONLY")+". No data sent to a server by these apps.","output")}
    else if(cmd==="open 1"){window.location.href="journal/quiet-distance.html"}
    else if(cmd==="open 2"){window.location.href="journal/fictional-characters.html"}
    else if(cmd==="theme"){line("CURRENT PALETTE: "+(document.body.dataset.palette||"mint")+". TRY THEME VIOLET.","output")}
    else if(/^theme (mint|violet|amber)$/.test(cmd)){
      const theme=cmd.split(" ")[1];
      const toggle=document.getElementById("fx-palette");
      if(toggle){
        for(let n=0;n<3 && document.body.dataset.palette!==theme;n++)toggle.click();
        line("PALETTE UPDATED: "+theme.toUpperCase(),"output");
      }else line("COLOR CONTROLS ARE STILL LOADING.","output");
    }
    else{line("UNKNOWN COMMAND. TYPE HELP FOR THE FILE LIST.","output")}
  }
  if(form)form.addEventListener("submit",e=>{e.preventDefault();exec(input.value);input.value="";if(active==="terminal")input.focus()});
  root.querySelectorAll("[data-os-cmd]").forEach(b=>b.addEventListener("click",()=>exec(b.dataset.osCmd)));
  line("FAVOUR OS v2.0 / A MIND FULL OF OPEN TABS.","output");
  line("Type HELP for commands, or open a program using the desktop icons.","output");
  const notes=root.querySelector(".os-note-input");
  const noteStatus=root.querySelector("[data-os-live]");
  if(notes){
    notes.value=safeGet(storageKey)||"";
    function status(t){if(noteStatus)noteStatus.textContent=t}
    status("NOTES STAY IN THIS BROWSER ON THIS DEVICE. Avoid storing sensitive information.");
    notes.addEventListener("input",()=>{
      status(safeSet(storageKey,notes.value)?"SAVED LOCALLY ✓":"BROWSER STORAGE UNAVAILABLE: COPY OR EXPORT YOUR NOTES.");
    });
    root.querySelector("[data-os-export]")?.addEventListener("click",()=>{
      const blob=new Blob([notes.value],{type:"text/plain;charset=utf-8"});
      const url=URL.createObjectURL(blob);
      const anchor=document.createElement("a");anchor.href=url;anchor.download="FAVOUR_NOTES.txt";document.body.append(anchor);
      anchor.click();anchor.remove();
      setTimeout(()=>URL.revokeObjectURL(url),1500);
      status("EXPORT REQUESTED: FAVOUR_NOTES.txt");
    });
    root.querySelector("[data-os-clear-notes]")?.addEventListener("click",()=>{
      if(!notes.value)return;
      if(!window.confirm("Clear notes saved in this browser? This cannot be undone."))return;
      notes.value="";
      status(safeSet(storageKey,"")?"LOCAL NOTES CLEARED.":"NOTES CLEARED IN THIS WINDOW.");
      notes.focus();
    });
  }
  root.addEventListener("keydown",e=>{
    if(e.key==="Escape"){
      const visible=windows.find(w=>w.dataset.window===active&&!w.hidden);
      if(visible&&document.activeElement&&visible.contains(document.activeElement)){closeApp(active)}
    }
  });
})();
