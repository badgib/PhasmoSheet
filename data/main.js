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

let selected = [];
let eliminated = [];
let focus = "all";

title.innerText = t().title;
close.innerText = t().close;

/* Evidence buttons (RESTORED) */
Object.keys(t().evidence).forEach(ev=>{
  const btn=document.createElement("div");
  btn.className="btn clueButton";
  // btn.id="clueButton";
  btn.innerHTML=`${icons[ev]} ${t().evidence[ev]}`;

  btn.onclick=()=>{
    btn.classList.toggle("active");

    selected = selected.includes(ev)
      ? selected.filter(x=>x!==ev)
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
  render();
}

function render(){

  orbsCol.innerHTML = `<h3>👻 ${t().orbs}</h3>`;
  noOrbsCol.innerHTML = `<h3>🚫 ${t().noOrbs}</h3>`;

  document.querySelector("#orbsCol h3").onclick = ()=>setFocus("orbs");
  document.querySelector("#noOrbsCol h3").onclick = ()=>setFocus("noOrbs");

  ghosts.forEach(g=>{
    const hasOrbs = g.evidence.includes("Orbs");
    const match = selected.every(e=>g.evidence.includes(e));
    const elim = eliminated.includes(g.id);
    const meta = t().ghosts[g.id]

    let dim = false;
    if(focus==="orbs" && !hasOrbs) dim = true;
    if(focus==="noOrbs" && hasOrbs) dim = true;

    const div=document.createElement("div");
    div.className="ghost";

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
          ${meta.hint}
        </div>

      </div>
    `;

    (hasOrbs?orbsCol:noOrbsCol).appendChild(div);
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