/* Public-record archive accessibility and owner-view counter controls. */
(function () {
  "use strict";
  const NS = "lawupdates.github.io";
  const KEY = "jcd-archive-new-pageviews-20261119-zero";
  const STORE = "jcd_archive_owner_stats_enabled_v1";
  const PREF = "jcd_archive_accessibility_v1";
  const base = "https://counterapi.com";
  const counterPath = base + "/api/" + encodeURIComponent(NS) + "/view/" + encodeURIComponent(KEY);

  function safeGet(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }
  function safeSet(k,v) { try { localStorage.setItem(k,v); } catch (_) {} }
  function trackPage() {
    // Counts new HTML page loads; not historical visits or confirmed unique humans.
    const img = document.createElement("img");
    img.alt = "";
    img.setAttribute("aria-hidden","true");
    img.width = 1; img.height = 1;
    img.style.cssText = "position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;left:-9999px";
    img.src = base + "/pixel.gif?ns=" + encodeURIComponent(NS) +
      "&action=view&key=" + encodeURIComponent(KEY) + "&startNumber=0&cacheBust=" + Date.now() + "-" + Math.random().toString(36).slice(2);
    document.body.appendChild(img);
  }
  function addCss() {
    const sheet = document.createElement("style");
    sheet.textContent = `
#jcd-accessibility{position:fixed;left:12px;bottom:12px;z-index:2147482000;font:600 15px/1.4 Arial,Helvetica,sans-serif}
#jcd-accessibility button,#jcd-owner-stats-button{cursor:pointer;font:700 15px/1.4 Arial,Helvetica,sans-serif;border:2px solid #eed391;border-radius:8px;min-height:44px;padding:9px 13px;background:#102e41;color:#fff;box-shadow:0 3px 12px #0005}
#jcd-accessibility button:hover,#jcd-owner-stats-button:hover{background:#254d62}
#jcd-accessibility button:focus-visible,#jcd-owner-stats-button:focus-visible{outline:3px solid #f5ca52;outline-offset:3px}
#jcd-accessibility-panel,#jcd-owner-panel{background:#fffdf8;color:#172b35;border:3px solid #173b51;border-radius:10px;padding:15px;box-shadow:0 6px 30px #0005}
#jcd-accessibility-panel{width:min(340px,calc(100vw - 24px));max-height:70vh;overflow:auto;margin-bottom:8px}
#jcd-accessibility-panel h2,#jcd-owner-panel h2{font:700 21px/1.3 Arial,Helvetica,sans-serif;color:#142c3b;margin:0 0 12px}
#jcd-accessibility-panel button{display:block;width:100%;text-align:left;background:#f7ecd1;color:#102d40;border-color:#88703d;margin:7px 0}
#jcd-accessibility-panel button[aria-pressed="true"]{background:#102d40;color:white}
#jcd-accessibility-panel p,#jcd-owner-panel p{font:16px/1.5 Arial,Helvetica,sans-serif;margin:8px 0}
#jcd-owner-stats-button{display:inline-flex;align-items:center;justify-content:center;margin-left:9px}
#jcd-owner-panel{position:fixed;right:12px;top:68px;z-index:2147482001;width:min(380px,calc(100vw - 24px));max-height:75vh;overflow:auto}
#jcd-owner-panel a{color:#054a77;text-decoration:underline}
html.jcd-larger-text body{font-size:20px!important;line-height:1.75!important}
html.jcd-larger-text main p,html.jcd-larger-text main li,html.jcd-larger-text article p,html.jcd-larger-text article li{font-size:1.14em!important;line-height:1.75!important}
html.jcd-high-contrast body,html.jcd-high-contrast main,html.jcd-high-contrast section,html.jcd-high-contrast article,html.jcd-high-contrast header,html.jcd-high-contrast nav,html.jcd-high-contrast footer{background:#fff!important;color:#080808!important;text-shadow:none!important}
html.jcd-high-contrast h1,html.jcd-high-contrast h2,html.jcd-high-contrast h3,html.jcd-high-contrast p,html.jcd-high-contrast li,html.jcd-high-contrast strong,html.jcd-high-contrast .case-caption{color:#080808!important;text-shadow:none!important}
html.jcd-high-contrast a:not(.button){color:#003c82!important;text-decoration:underline!important}
html.jcd-high-contrast button,html.jcd-high-contrast .button{background:#101010!important;color:#fff!important;border-color:#101010!important}
html.jcd-reduced-motion *,html.jcd-reduced-motion *::before,html.jcd-reduced-motion *::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;scroll-behavior:auto!important}
@media(prefers-reduced-motion:reduce){#jcd-accessibility *,#jcd-owner-panel *{animation:none!important;transition:none!important}}

/* Responsive feedback for archive navigation and controls. */
:where(.button,.latest-button,.site-language-button,#archiveDock button,.filing-search-actions button) {
  transition: translate 170ms ease-out, box-shadow 170ms ease-out, background-color 170ms ease-out;
}
:where(.resource-card) {
  transition: translate 200ms ease-out, box-shadow 200ms ease-out;
}
:not(.jcd-high-contrast) :where(.button,.latest-button,.site-language-button,#archiveDock button,.filing-search-actions button):focus-visible {
  outline: 2px solid #a47524;
  outline-offset: 3px;
}
:not(.jcd-high-contrast) :where(.resource-card):focus-within {
  box-shadow: inset 3px 0 #b88b37, 0 6px 18px #102b4018;
}
@media (hover: hover) and (pointer: fine) {
  html:not(.jcd-high-contrast) :where(.button,.latest-button,.site-language-button,#archiveDock button,.filing-search-actions button):hover {
    box-shadow: 0 0 0 2px #cb9b48, 0 6px 14px #102b4030;
  }
}
@media (prefers-reduced-motion: no-preference) {
  @media (hover: hover) and (pointer: fine) {
    html:not(.jcd-reduced-motion) :where(.button,.latest-button,.site-language-button,#archiveDock button,.filing-search-actions button):hover {
      translate: 0 -2px;
    }
    html:not(.jcd-reduced-motion,.jcd-high-contrast) .resource-card:hover {
      translate: 0 -3px;
      box-shadow: inset 3px 0 #b88b37, 0 8px 20px #102b4022;
    }
  }
  html:not(.jcd-reduced-motion) :where(.button,.latest-button,.site-language-button,#archiveDock button,.filing-search-actions button):active {
    translate: 0 1px;
  }
  html:not(.jcd-reduced-motion) :where(#archiveToolsDialog,#archiveReaderDialog)[open],
  html:not(.jcd-reduced-motion) :where(#jcd-accessibility-panel,#jcd-owner-panel):not([hidden]) {
    animation: jcd-panel-enter 190ms ease-out both;
  }
}
@media (prefers-reduced-motion: reduce) {
  :where(.button,.latest-button,.site-language-button,#archiveDock button,.filing-search-actions button,.resource-card) {
    transition: none;
  }
}
@keyframes jcd-panel-enter {
  from { opacity: .55; translate: 0 5px; }
  to { opacity: 1; translate: 0 0; }
}

@media(max-width:600px){#jcd-accessibility{bottom:6px;left:6px}#jcd-accessibility-panel{max-height:60vh}#jcd-owner-panel{top:110px}#jcd-owner-stats-button{margin:5px 0}}
`;
    document.head.appendChild(sheet);
  }
  function readPrefs() {
    try { return JSON.parse(safeGet(PREF) || "{}") || {}; } catch (_) { return {}; }
  }
  const prefs = readPrefs();
  function applyPrefs() {
    document.documentElement.classList.toggle("jcd-larger-text",!!prefs.large);
    document.documentElement.classList.toggle("jcd-high-contrast",!!prefs.contrast);
    document.documentElement.classList.toggle("jcd-reduced-motion",!!prefs.motion);
    safeSet(PREF,JSON.stringify(prefs));
  }
  function addAccessibility() {
    const root = document.createElement("div"); root.id="jcd-accessibility";
    const panel = document.createElement("div"); panel.id="jcd-accessibility-panel"; panel.hidden=true;
    panel.setAttribute("role","group");panel.setAttribute("aria-label","Accessibility settings");
    const heading = document.createElement("h2"); heading.textContent="Accessibility settings";panel.appendChild(heading);
    const controls = [];
    [["large","Larger text"],["contrast","High contrast"],["motion","Reduce animation"]].forEach(([key,caption])=>{
      const b=document.createElement("button");b.type="button";b.textContent=caption;
      b.setAttribute("aria-pressed",String(!!prefs[key]));
      b.addEventListener("click",()=>{prefs[key]=!prefs[key];applyPrefs();b.setAttribute("aria-pressed",String(!!prefs[key]))});
      controls.push(b);panel.appendChild(b);
    });
    const reset=document.createElement("button");reset.type="button";reset.textContent="Reset accessibility settings";
    reset.addEventListener("click",()=>{prefs.large=false;prefs.contrast=false;prefs.motion=false;applyPrefs();controls.forEach(b=>b.setAttribute("aria-pressed","false"))});panel.appendChild(reset);
    const close=document.createElement("button");close.type="button";close.textContent="Close accessibility settings";
    close.addEventListener("click",()=>{panel.hidden=true;toggle.setAttribute("aria-expanded","false");toggle.focus()});panel.appendChild(close);
    const toggle=document.createElement("button");toggle.type="button";
    toggle.textContent="♿ Accessibility";toggle.setAttribute("aria-controls","jcd-accessibility-panel");toggle.setAttribute("aria-expanded","false");
    toggle.addEventListener("click",()=>{panel.hidden=!panel.hidden;toggle.setAttribute("aria-expanded",String(!panel.hidden));if(!panel.hidden)controls[0].focus()});
    root.appendChild(panel);root.appendChild(toggle);document.body.appendChild(root);
    root.addEventListener("keydown",e=>{if(e.key==="Escape"&&!panel.hidden){panel.hidden=true;toggle.setAttribute("aria-expanded","false");toggle.focus()}});
  }
  function ownerRequested() {
    const q=new URLSearchParams(location.search);
    if(q.get("ownerstats")==="1") {
      safeSet(STORE,"1");
      q.delete("ownerstats");
      const next=location.pathname+(q.toString()?"?"+q.toString():"")+location.hash;
      try{history.replaceState(null,"",next)}catch(_){}
    }
    return safeGet(STORE)==="1";
  }
  async function readCount(query,element) {
    try{
      const response=await fetch(counterPath+"?readOnly=true&startNumber=0"+query,{cache:"no-store"});
      if(!response.ok)throw new Error("Stats service unavailable");
      const data=await response.json();
      const n=Number(data.value);
      element.textContent=Number.isFinite(n)?n.toLocaleString():"Unavailable";
    }catch(_){element.textContent="Unavailable (tracking provider blocked or offline)";}
  }
  function addOwnerButton() {
    if(!ownerRequested())return;
    const bar=document.querySelector(".site-language-bar");
    const button=document.createElement("button");button.id="jcd-owner-stats-button";button.type="button";
    button.textContent="🔒 Visitor stats";button.setAttribute("aria-controls","jcd-owner-panel");button.setAttribute("aria-expanded","false");
    if(bar){bar.appendChild(button)}else{button.style.position="fixed";button.style.top="12px";button.style.right="12px";button.style.zIndex="2147482000";document.body.appendChild(button)}
    const panel=document.createElement("aside");panel.id="jcd-owner-panel";panel.hidden=true;
    panel.setAttribute("aria-label","Owner traffic summary");
    panel.innerHTML='<h2>Visitor counter</h2><p>New page views since tracking was added: <strong id="jcd-stats-total">—</strong></p><p>Past 7 days: <strong id="jcd-stats-week">—</strong></p><p>Approximate unique visitors (all time): <strong id="jcd-stats-unique">—</strong></p><p>Counts begin at zero on November 19, 2026. They track HTML page loads, not historical hits. Third-party service metrics are estimates and can be affected by blockers or automated traffic.</p><p><a href="https://github.com/Lawupdates/john-c-d-doe-cv2020-014920/graphs/traffic" target="_blank" rel="noopener noreferrer">GitHub traffic dashboard (sign-in required)</a></p><button type="button" id="jcd-owner-close">Close</button>';
    panel.querySelector("#jcd-owner-close").addEventListener("click",()=>{panel.hidden=true;button.setAttribute("aria-expanded","false");button.focus()});
    document.body.appendChild(panel);
    button.addEventListener("click",()=>{
      panel.hidden=!panel.hidden;button.setAttribute("aria-expanded",String(!panel.hidden));
      if(!panel.hidden){
        readCount("",panel.querySelector("#jcd-stats-total"));
        readCount("&timeline=7d",panel.querySelector("#jcd-stats-week"));
        readCount("&unique=true",panel.querySelector("#jcd-stats-unique"));
      }
    });
    panel.addEventListener("keydown",e=>{if(e.key==="Escape"){panel.hidden=true;button.setAttribute("aria-expanded","false");button.focus()}});
  }
  function init(){addCss();applyPrefs();addAccessibility();addOwnerButton();trackPage();}
  if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",init,{once:true});}else{init();}
})();
