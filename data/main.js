const icons = {
 "EMF 5":"📳",
 "Spirit Box":"📣",
 "UV":"👣",
 "Writing":"📕",
 "Freezing":"❄️",
 "D.O.T.S":"🟢"
};

let currentLang = localStorage.getItem("lang") || "en";

const LANGS = {
  en: LANG,
  pl: LANG_PL,
};

const langBtn = document.getElementById("langBtn");
const langPopup = document.getElementById("langPopup");

langBtn.onclick = ()=>{
  langPopup.style.display =
    langPopup.style.display === "block" ? "none" : "block";
};

document.querySelectorAll(".langItem").forEach(el=>{
  el.onclick = ()=>{

    currentLang = el.dataset.lang;
    localStorage.setItem("lang", currentLang);
    langPopup.style.display = "none";

    // refresh UI
    title.innerText = t().title;
    // let currentControls = controls.getElementById("clueButton").innerText;
    let currentControls = controls.querySelectorAll(".clueButton");
    currentControls.forEach(btn=>{
      const icon = btn.innerText.slice(0, 2);
      const key = Object.keys(icons).find(k => icons[k] === icon);
      if(key) {
        btn.innerHTML = `${icons[key]} ${t().evidence[key]}`;
      }
    });
    render();
  };
});

let ghosts = [...GHOSTS].sort((a,b)=>
  t().ghosts[a.id]?.name?.localeCompare(t().ghosts[b.id]?.name || a.id) || 0
);

let buttons = [];
let selected = [];
let eliminated = [];
let excluded = [];
let focus = "all";

title.innerText = t().title;
close.innerText = t().close;


const tooltip = document.createElement("div");
tooltip.className = "tooltip";
document.body.appendChild(tooltip);

Object.keys(t().evidence).forEach(ev=>{
  const btn=document.createElement("div");
  btn.className="btn clueButton";

  btn.innerHTML=`${icons[ev]} ${t().evidence[ev]}`;

  btn.onclick = (e) => {

    // SHIFT = exclude (red state)
    if (e.shiftKey) {

      // remove from selected if it was there
      selected = selected.filter(x => x !== ev);

      // toggle excluded
      excluded = excluded.includes(ev)
        ? excluded.filter(x => x !== ev)
        : [...excluded, ev];

      render();
      return;
    }

    // NORMAL CLICK = include
    excluded = excluded.filter(x => x !== ev);

    selected = selected.includes(ev)
      ? selected.filter(x => x !== ev)
      : [...selected, ev];

    render();
  };

  controls.appendChild(btn);
});

function t(){
  return LANGS[currentLang];
}

function meta(id){
  return t().ghosts[id] || {
    name:id,
    sanity:"?",
    speed:"?",
    hint:"?"
  };
}

function setFocus(mode){
  focus = (focus === mode) ? "all" : mode;
  if(focus==="all"){
    selected = selected.filter(x => x !== "Orbs");
    excluded = excluded.filter(x => x !== "Orbs");
  }
  else if(focus==="noOrbs"){

    excluded = [...new Set([...excluded, "Orbs"])]
    selected = selected.filter(x => x !== "Orbs");
  }
  else if(focus==="orbs"){
    selected = [...new Set([...selected, "Orbs"])]
    excluded = excluded.filter(x => x !== "Orbs");
  }
  render();
}

function render(){

  orbsCol.innerHTML = `<h3>👻 ${t().orbs}</h3>`;
  noOrbsCol.innerHTML = `<h3>🚫 ${t().noOrbs}</h3>`;

  const possibleGhosts = ghosts.filter(g =>
    selected.every(e => g.evidence.includes(e)) &&
    excluded.every(e => !g.evidence.includes(e)) &&
    !eliminated.includes(g.id)
  );

  const possibleEvidenceSet = new Set();

  possibleGhosts.forEach(g => {
    g.evidence.forEach(ev => {
      if (ev !== "Orbs") { // ignore orbs if needed
        possibleEvidenceSet.add(ev);
      }
    });
  });
  controls.querySelectorAll(".clueButton").forEach(btn=>{
    
    const key = Object.keys(icons).find(
      k => icons[k] === btn.innerText.slice(0, 2)
    );
    if (selected.includes(Object.keys(icons).find(k => icons[k] === btn.innerText.slice(0, 2)))){
      btn.classList.add("active");
      btn.classList.remove("excluded");
    } 
    else if (excluded.includes(Object.keys(icons).find(k => icons[k] === btn.innerText.slice(0, 2)))){
      btn.classList.add("excluded");
      btn.classList.remove("active");
    }
    else{
      btn.classList.remove("active");
      btn.classList.remove("excluded");
    }
    if (
      !possibleEvidenceSet.has(key) &&
      !selected.includes(key) &&
      !excluded.includes(key)
    ) {
      btn.classList.add("disabled");
      btn.style.pointerEvents = "none";
      btn.style.opacity = "0.3";
    } else {
      btn.classList.remove("disabled");
      btn.style.pointerEvents = "auto";
      btn.style.opacity = "1";
    }
  });

  document.querySelector("#orbsCol h3").onclick = ()=>setFocus("orbs");
  document.querySelector("#noOrbsCol h3").onclick = ()=>setFocus("noOrbs");

  ghosts.forEach(g=>{
    const hasOrbs = g.evidence.includes("Orbs");
    // const match = selected.every(e=>g.evidence.includes(e));
    const match =
      selected.every(e => g.evidence.includes(e)) &&
      excluded.every(e => !g.evidence.includes(e));
    const elim = eliminated.includes(g.id);
    const meta = t().ghosts[g.id]

    let dim = false;
    if(focus==="orbs" && !hasOrbs) dim = true;
    if(focus==="noOrbs" && hasOrbs) dim = true;

    const div=document.createElement("div");
    div.className="ghost";
    div.dataset.hint = meta.hint;

    if(dim || !match) div.classList.add("dim");
    if(elim) div.classList.add("elim");

    div.onclick=(e)=>{
      e.stopPropagation();

      if(e.shiftKey){
        eliminated = eliminated.includes(g.id)
          ? eliminated.filter(x=>x!==g.id)
          : [...eliminated,g.id];
        render();
        return;
      }};

    const evs = g.evidence.filter(e=>e!=="Orbs");

    div.innerHTML = `
      <div class="ghostRow">

        <!-- LEFT: stats -->
        <div class="ghostLeft">
          <div class="stat">😱${meta.sanity}</div>
          <div class="stat">🏃‍♀️${meta.speed}</div>
        </div>

        <!-- CENTER: name + evidence -->
        <div class="ghostCenter">
          <strong>${meta.name}</strong>

          <div class="evidence">
            ${evs.map(e=>`
              <div class="ev">
                <span>${icons[e]}</span>
                ${t().evidence[e]}
              </div>
            `).join("")}
          </div>
        </div>

        <!-- RIGHT: hint -->
        <div class="ghostRight">
          <img 
            src="data/${g.id.toLowerCase().replace(/\s+/g, "_")}.png"
            class="ghostImg"
            
          />
        </div>

      </div>
    `;

    (hasOrbs?orbsCol:noOrbsCol).appendChild(div);
  });

  document.querySelectorAll(".ghost").forEach(el => {

    let tooltipTimeout;

    el.onmouseenter = () => {
      if (el.classList.contains("dim")) return;
      tooltipTimeout = setTimeout(() => {
        tooltip.innerText = el.dataset.hint;
        tooltip.style.opacity = "1";
      }, 120);
    };

    el.onmousemove = (e) => {
      const x = e.clientX + 12;
      const y = e.clientY + 12;

      tooltip.style.left = Math.min(x, window.innerWidth - 240) + "px";
      tooltip.style.top = Math.min(y, window.innerHeight - 80) + "px";
    };

    el.onmouseleave = () => {
      clearTimeout(tooltipTimeout);
      tooltip.style.opacity = "0";
    };

  });

}

/* popup */
let d=false,x=0,y=0;
header.onmousedown=e=>{
  d=true;
  x=e.clientX-popup.offsetLeft;
  y=e.clientY-popup.offsetTop;
};

document.onmouseup=()=>d=false;

document.onmousemove=e=>{
  if(!d)return;
  popup.style.left=(e.clientX-x)+"px";
  popup.style.top=(e.clientY-y)+"px";
  popup.style.transform="none";
};

close.onclick=()=>popup.style.display="none";

render();