// NAV scroll behavior
const nav = document.getElementById('main-nav');
const stickyCta = document.getElementById('stickyCta');
window.addEventListener('scroll', () => {
  if(window.scrollY > 80){
    nav.classList.add('scrolled');
    stickyCta.classList.add('visible');
  } else {
    nav.classList.remove('scrolled');
    stickyCta.classList.remove('visible');
  }
});

// Mobile menu
const toggle = document.getElementById('mobileToggle');
const mobileMenu = document.getElementById('mobileMenu');
toggle.addEventListener('click', () => mobileMenu.classList.toggle('open'));
function closeMobile(){ mobileMenu.classList.remove('open'); }

// Scroll animations
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.12 });
document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

// Quote form step logic
let currentStep = 1;
function goStep(n){
  if(n > currentStep){
    const f1 = document.getElementById('fname');
    if(currentStep === 3 && (!f1 || f1.value.trim() === '')) {
      alert('Please enter your name to submit.'); return;
    }
  }
  document.querySelectorAll('.form-section').forEach(s => s.classList.remove('active'));
  document.getElementById('step'+n).classList.add('active');
  ['prog1','prog2','prog3'].forEach((id, i) => {
    const el = document.getElementById(id);
    el.classList.remove('active','done');
    if(i+1 < n) el.classList.add('done');
    else if(i+1 === n) el.classList.add('active');
  });
  currentStep = n;
  document.getElementById('quoteForm').scrollIntoView({behavior:'smooth',block:'start'});
}

// Chip selection
function selectChip(el, group){
  el.closest('.chip-group').querySelectorAll('.chip').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  const hfMap = {direction:'hf_direction', mode:'hf_mode', container:'hf_container', stack:'hf_stackable', cargotype:'hf_cargo_type'};
  if(hfMap[group]){ const hf = document.getElementById(hfMap[group]); if(hf) hf.value = el.textContent.trim(); }
  if(group === 'mode'){
    const mode = el.dataset.mode;
    const ocean = document.getElementById('oceanOptions');
    const air = document.getElementById('airOptions');
    if(ocean) ocean.style.display = (mode==='ocean'||mode==='both') ? 'block' : 'none';
    if(air)   air.style.display   = (mode==='air'  ||mode==='both') ? 'block' : 'none';
    if(mode==='air'||mode==='both') calcChargeable();
  }
}

// Live volumetric / chargeable weight (air)
function calcChargeable(){
  const num = id => parseFloat((document.getElementById(id)||{}).value) || 0;
  const pieces = num('airPieces'), gross = num('airWeight');
  const L = num('airL'), W = num('airW'), H = num('airH');
  const box = document.getElementById('chargeableBox');
  if(!box) return;
  const haveDims = L>0 && W>0 && H>0 && pieces>0;
  if(!haveDims && gross<=0){ box.style.display='none'; return; }
  const vol = haveDims ? (L*W*H/6000)*pieces : 0;     // kg (IATA 6000 divisor)
  const chargeable = Math.max(vol, gross);
  if(chargeable<=0){ box.style.display='none'; return; }
  box.style.display='flex';
  document.getElementById('chargeableValue').textContent = chargeable.toFixed(1).replace(/\.0$/,'') + ' kg';
  var _hfc = document.getElementById('hf_chargeable'); if(_hfc) _hfc.value = chargeable.toFixed(1).replace(/\.0$/,'') + ' kg';
  let note = '';
  if(haveDims && gross>0){
    note = (vol>gross)
      ? 'Volumetric ('+vol.toFixed(0)+' kg) exceeds actual ('+gross.toFixed(0)+' kg) — billed on volume.'
      : 'Actual ('+gross.toFixed(0)+' kg) exceeds volumetric ('+vol.toFixed(0)+' kg) — billed on weight.';
  } else if(haveDims){ note = 'Estimated from dimensions. Add gross weight for an accurate figure.'; }
  else { note = 'Based on gross weight. Add dimensions to check volumetric weight.'; }
  document.getElementById('chargeableNote').textContent = note;
}

/* ============ SERVICE + INDUSTRY DETAIL DATA ============ */
const SERVICE_DATA = {
  ocean:{icon:"🚢",eyebrow:"Service",title:"Ocean Freight",ctaLabel:"Get an Ocean Freight Quote →",ctaCommodity:"",
    lead:"Cost-effective sea transport for large or heavy shipments. Choose FCL — a full 20ft, 40ft, or 40ft HC container reserved for your cargo — or LCL, where you share container space and pay only for the volume you use (per CBM). Best for non-urgent, high-volume, or bulky goods.",
    meta:[["Coverage","All major global ports & trade lanes"],["Typical transit","China→US 12–30 days · India→US 18–40 days"]],
    sections:[{head:"Documents typically required",type:"doc",items:["Commercial Invoice","Packing List","Bill of Lading (B/L)","ISF (10+2) filing for US imports","Certificate of Origin (if applicable)","Letter of Credit documents (if used)"]}]},
  air:{icon:"✈️",eyebrow:"Service",title:"Air Freight",ctaLabel:"Get an Air Freight Quote →",ctaCommodity:"",
    lead:"Fast, reliable transport for time-sensitive, high-value, or perishable cargo. Pricing is based on chargeable weight — the greater of actual gross weight or volumetric weight (L×W×H in cm ÷ 6000). Express and standard service levels available.",
    meta:[["Coverage","Major international airports worldwide"],["Typical transit","1–3 days airport-to-airport · 3–8 door-to-door"]],
    sections:[{head:"Documents typically required",type:"doc",items:["Commercial Invoice","Packing List","Air Waybill (AWB)","Certificate of Origin (if applicable)","Dangerous Goods declaration (if applicable)","Perishable / temperature certificates (if applicable)"]}]},
  import:{icon:"📥",eyebrow:"Service",title:"Import Logistics",ctaLabel:"Start an Import Quote →",ctaCommodity:"",
    lead:"End-to-end management of bringing goods into the USA — origin pickup, ocean or air transport, customs entry, duty and tax handling, and final-mile delivery. One point of contact for the whole chain.",
    meta:[["Coverage","All US ports & airports, nationwide delivery"],["Customs entry","Often same-day to 1–2 days with clean docs"]],
    sections:[{head:"Documents typically required",type:"doc",items:["Commercial Invoice","Packing List","Bill of Lading or Air Waybill","ISF (10+2) filing","Customs Bond","Arrival Notice","Partner-agency forms by commodity (FDA, FCC, EPA, etc.)"]}]},
  export:{icon:"📤",eyebrow:"Service",title:"Export Logistics",ctaLabel:"Start an Export Quote →",ctaCommodity:"",
    lead:"Outbound shipment management from US origin to overseas destination — booking, export documentation, AES/EEI filing, origin haulage, and carrier coordination.",
    meta:[["Coverage","From any US origin to global destinations"],["Lead time","Booking & docs usually arranged in 1–3 business days"]],
    sections:[{head:"Documents typically required",type:"doc",items:["Commercial Invoice","Packing List","Bill of Lading","Certificate of Origin","Shipper's Letter of Instruction (SLI)","Export License (if controlled goods)","AES / ITN confirmation"]}]},
  customs:{icon:"🛃",eyebrow:"Service",title:"Customs Coordination",ctaLabel:"Ask About Customs →",ctaCommodity:"",
    lead:"Licensed-broker handling of customs clearance — HS/HTS classification, duty and tax calculation, entry filing, and compliance with partner government agencies. We review your paperwork before filing to avoid holds and penalties.",
    meta:[["Coverage","US Customs (CBP) & partner agencies"],["Clearance","Often same-day to 1–2 days with accurate docs"]],
    sections:[{head:"Documents typically required",type:"doc",items:["CBP Form 7501 (Entry Summary)","Commercial Invoice","Packing List","Bill of Lading / Air Waybill","Customs Bond","Power of Attorney (POA)"]}]},
  docs:{icon:"📄",eyebrow:"Service",title:"Documentation Support",ctaLabel:"Request Document Help →",ctaCommodity:"",
    lead:"Preparation and compliance review of all your shipping paperwork. Accurate documents are the single biggest factor in avoiding delays — we make sure every form is correct before your cargo moves.",
    meta:[["Coverage","All trade lanes & transport modes"],["Turnaround","Documents prepared within 24–48 hours"]],
    sections:[{head:"Documents we prepare & review",type:"doc",items:["Commercial Invoice","Packing List","Bill of Lading / Air Waybill","Certificate of Origin","Insurance Certificate","Customs & partner-agency forms","Letter of Credit documents"]}]},
  inland:{icon:"🚚",eyebrow:"Service",title:"Inland Transportation",ctaLabel:"Quote Inland Transport →",ctaCommodity:"",
    lead:"Moving your cargo between ports/airports and the final inland destination — port drayage, FTL and LTL trucking, and rail. We connect the ocean or air leg to the door seamlessly.",
    meta:[["Coverage","Nationwide US drayage & trucking"],["Drayage","Typically 1–3 days from port availability"]],
    sections:[{head:"Documents typically required",type:"doc",items:["Delivery Order","Bill of Lading","Proof of Delivery (POD)","Container release / pickup number"]}]},
  warehouse:{icon:"🏢",eyebrow:"Service",title:"Warehousing & Distribution",ctaLabel:"Ask About Warehousing →",ctaCommodity:"",
    lead:"Storage, handling, and distribution at key US logistics hubs — short or long-term, bonded options, pick & pack, inventory management, and cross-docking for importers and e-commerce sellers.",
    meta:[["Coverage","Key US logistics hubs"],["Inbound","Processed within 24–48 hours of arrival"]],
    sections:[{head:"Documents typically required",type:"doc",items:["Warehouse Receipt","Inventory / stock report","Inbound & outbound manifests","Pick & pack instructions"]}]}
};

const DISCLAIMER = "Requirements vary by the exact product, its origin, and current regulations, which change over time. Treat this as a starting checklist — your customs broker confirms the precise approvals for your shipment.";

const INDUSTRY_DATA = {
  textiles:{icon:"🧵",eyebrow:"Industry",title:"Textiles & Apparel",ctaCommodity:"Textiles & Apparel",ctaLabel:"Quote This Cargo →",note:DISCLAIMER,
    lead:"Apparel, fabrics, home textiles, and footwear. Most clear customs routinely, but labeling and fiber-content rules are strictly enforced, and children's items carry extra safety requirements.",
    meta:[["Lead agency","CBP / FTC"],["Typical clearance","1–2 days"]],
    sections:[{head:"Approvals & registrations",type:"check",items:["FTC fiber content & care-labeling compliance","Country-of-origin marking","CPSC compliance for children's apparel (lead, flammability, drawstrings)","Wool / fur labeling where applicable"]},
              {head:"Required documents",type:"doc",items:["Commercial Invoice (with fiber content)","Packing List","Bill of Lading / Air Waybill","Single-entry / textile declaration as required","Certificate of Origin (for FTA benefits)"]}]},
  industrial:{icon:"⚙️",eyebrow:"Industry",title:"Industrial Equipment",ctaCommodity:"Industrial Equipment",ctaLabel:"Quote This Cargo →",note:DISCLAIMER,
    lead:"Machinery, industrial parts, and heavy equipment. Usually straightforward, but oversized or used machinery and any electrical components can add requirements.",
    meta:[["Lead agency","CBP"],["Typical clearance","1–2 days"]],
    sections:[{head:"Approvals & registrations",type:"check",items:["FCC declaration for equipment with electronics","EPA / DOT compliance for engines or vehicles","Cleaning / fumigation certificate for used machinery (soil & contaminants)","ISPM-15 treated wood packaging"]},
              {head:"Required documents",type:"doc",items:["Commercial Invoice","Packing List","Bill of Lading / Air Waybill","Technical specs / datasheet","Certificate of Origin"]}]},
  pharma:{icon:"💊",eyebrow:"Industry",title:"Pharmaceuticals",ctaCommodity:"Pharmaceuticals",ctaLabel:"Quote This Cargo →",note:DISCLAIMER,
    lead:"Medicines, APIs, supplements, and medical devices. One of the most heavily regulated categories — FDA oversight applies both before and at the border.",
    meta:[["Lead agency","FDA (+ DEA if controlled)"],["Clearance","Subject to FDA review — can take longer"]],
    sections:[{head:"Approvals & registrations",type:"check",items:["FDA establishment registration & drug listing","FDA Prior Notice for each shipment","DEA import permit for controlled substances","FDA approval / clearance for the specific product","Medical device listing (if applicable)"]},
              {head:"Required documents",type:"doc",items:["Commercial Invoice","Packing List","Bill of Lading / Air Waybill","Certificate of Analysis (COA)","FDA Prior Notice confirmation","DEA permit (if controlled)"]}]},
  ecommerce:{icon:"🛒",eyebrow:"Industry",title:"E-Commerce / Amazon",ctaCommodity:"E-Commerce / Amazon cargo",ctaLabel:"Quote This Cargo →",note:DISCLAIMER,
    lead:"FBA and direct-to-consumer inventory from overseas suppliers. The cargo itself can be anything, so requirements follow the actual product — plus Amazon's own prep and labeling rules.",
    meta:[["Lead agency","CBP (+ product-specific)"],["Typical clearance","1–2 days"]],
    sections:[{head:"Approvals & registrations",type:"check",items:["Formal customs entry & duties (typically over $2,500 value)","Product-specific agency rules (FDA, CPSC, FCC) by commodity","FCC / UL marks for electronics","Amazon FBA prep, FNSKU labeling & packaging compliance"]},
              {head:"Required documents",type:"doc",items:["Commercial Invoice","Packing List","Bill of Lading / Air Waybill","ISF filing (ocean imports)","Customs Bond","Amazon shipment / FBA labels"]}]},
  food:{icon:"🍛",eyebrow:"Industry",title:"Food & Agri",ctaCommodity:"Food & Agricultural goods",ctaLabel:"Quote This Cargo →",note:DISCLAIMER,
    lead:"Packaged foods, spices, beverages, and agricultural products. FDA and sometimes USDA oversight applies, with strict facility, notice, and labeling rules.",
    meta:[["Lead agency","FDA / USDA"],["Clearance","Subject to FDA hold / exam"]],
    sections:[{head:"Approvals & registrations",type:"check",items:["FDA food facility registration","FDA Prior Notice for each shipment","FSVP (Foreign Supplier Verification Program)","USDA APHIS permit & phytosanitary certificate (plant / agri)","FDA-compliant nutrition & ingredient labeling"]},
              {head:"Required documents",type:"doc",items:["Commercial Invoice","Packing List","Bill of Lading / Air Waybill","FDA Prior Notice confirmation","Phytosanitary / health certificate (as applicable)","Ingredient list & labels"]}]},
  chemicals:{icon:"🧪",eyebrow:"Industry",title:"Chemicals",ctaCommodity:"Chemicals",ctaLabel:"Quote This Cargo →",note:DISCLAIMER,
    lead:"Industrial chemicals, coatings, and formulations. EPA oversight applies, and any hazardous classification triggers dangerous-goods handling.",
    meta:[["Lead agency","EPA (+ DOT / IATA for hazmat)"],["Typical clearance","1–3 days"]],
    sections:[{head:"Approvals & registrations",type:"check",items:["EPA TSCA certification (positive / negative)","Safety Data Sheet (SDS) on file","Dangerous Goods classification & declaration (if hazmat)","DOT / IATA packaging & labeling for hazardous cargo"]},
              {head:"Required documents",type:"doc",items:["Commercial Invoice","Packing List","Bill of Lading / Air Waybill","Safety Data Sheet (SDS)","TSCA certification statement","DG declaration (if applicable)"]}]},
  electronics:{icon:"🖥️",eyebrow:"Industry",title:"Electronics & Tech",ctaCommodity:"Electronics & Tech",ctaLabel:"Quote This Cargo →",note:DISCLAIMER,
    lead:"Consumer electronics, devices, and components. Radio-frequency and energy-efficiency rules are the main gatekeepers, and lithium batteries add handling requirements.",
    meta:[["Lead agency","FCC (+ DOE / EPA)"],["Typical clearance","1–2 days"]],
    sections:[{head:"Approvals & registrations",type:"check",items:["FCC equipment authorization (Part 15 / SDoC)","DOE energy-efficiency compliance (where applicable)","FDA radiation control for lasers / displays","Battery UN38.3 certification for lithium cells"]},
              {head:"Required documents",type:"doc",items:["Commercial Invoice","Packing List","Bill of Lading / Air Waybill","FCC declaration / grant","UN38.3 / MSDS for batteries","Certificate of Origin"]}]},
  auto:{icon:"🚗",eyebrow:"Industry",title:"Auto Parts",ctaCommodity:"Auto Parts",ctaLabel:"Quote This Cargo →",note:DISCLAIMER,
    lead:"Vehicle parts, components, and accessories. Most parts clear easily; engines, emissions-related parts, and complete vehicles add DOT / EPA requirements.",
    meta:[["Lead agency","DOT / NHTSA & EPA"],["Typical clearance","1–2 days"]],
    sections:[{head:"Approvals & registrations",type:"check",items:["DOT / NHTSA compliance (HS-7 form) for safety-regulated parts","EPA compliance (Form 3520-1) for engines / vehicles","Country-of-origin marking","Brand / trademark authorization for branded parts"]},
              {head:"Required documents",type:"doc",items:["Commercial Invoice","Packing List","Bill of Lading / Air Waybill","HS-7 / EPA 3520-1 (as applicable)","Certificate of Origin"]}]},
  construction:{icon:"🏗️",eyebrow:"Industry",title:"Construction Goods",ctaCommodity:"Construction Goods",ctaLabel:"Quote This Cargo →",note:DISCLAIMER,
    lead:"Building materials, fixtures, tiles, and hardware. Generally routine, with wood-packaging and material-safety rules to watch — and possible anti-dumping duties on certain metals.",
    meta:[["Lead agency","CBP"],["Typical clearance","1–2 days"]],
    sections:[{head:"Approvals & registrations",type:"check",items:["ISPM-15 treated wood packaging","Lacey Act declaration for wood products","CPSC / material-safety compliance where applicable","Anti-dumping / countervailing duty check (certain steel, aluminum)"]},
              {head:"Required documents",type:"doc",items:["Commercial Invoice","Packing List","Bill of Lading / Air Waybill","Mill / material test certificate (if applicable)","Certificate of Origin"]}]},
  beauty:{icon:"💄",eyebrow:"Industry",title:"Beauty & Cosmetics",ctaCommodity:"Beauty & Cosmetics",ctaLabel:"Quote This Cargo →",note:DISCLAIMER,
    lead:"Skincare, makeup, fragrances, and personal-care products. FDA cosmetics rules now include facility registration and product listing under MoCRA.",
    meta:[["Lead agency","FDA"],["Clearance","Subject to FDA review"]],
    sections:[{head:"Approvals & registrations",type:"check",items:["FDA facility registration & product listing (MoCRA)","Ingredient & allergen labeling compliance","Color-additive approval where applicable","FDA Prior Notice (products treated as food / OTC drug)"]},
              {head:"Required documents",type:"doc",items:["Commercial Invoice","Packing List","Bill of Lading / Air Waybill","Ingredient list / formulation","Safety substantiation (as applicable)"]}]},
  manufacturing:{icon:"🏭",eyebrow:"Industry",title:"Manufacturing",ctaCommodity:"Manufacturing inputs",ctaLabel:"Quote This Cargo →",note:DISCLAIMER,
    lead:"Raw materials, semi-finished goods, and production inputs. Requirements depend on the specific material — metals and polymers are common and carry their own checks.",
    meta:[["Lead agency","CBP (+ EPA / agency by material)"],["Typical clearance","1–2 days"]],
    sections:[{head:"Approvals & registrations",type:"check",items:["Material-specific compliance (TSCA for chemicals / polymers)","Anti-dumping / countervailing duty review (metals)","ISPM-15 wood packaging","Mill test / quality certificates"]},
              {head:"Required documents",type:"doc",items:["Commercial Invoice","Packing List","Bill of Lading / Air Waybill","Mill test certificate / COA","Certificate of Origin"]}]},
  general:{icon:"📦",eyebrow:"Industry",title:"General Merchandise",ctaCommodity:"General Merchandise",ctaLabel:"Quote This Cargo →",note:DISCLAIMER,
    lead:"Mixed consumer goods and retail merchandise. Each item follows its own product rules, so the documentation set scales with what's inside the shipment.",
    meta:[["Lead agency","CBP (+ product-specific)"],["Typical clearance","1–2 days"]],
    sections:[{head:"Approvals & registrations",type:"check",items:["Customs entry & duty classification (HTS)","Product-specific agency rules (CPSC, FDA, FCC) as applicable","Country-of-origin marking","Trademark / brand authorization for branded goods"]},
              {head:"Required documents",type:"doc",items:["Commercial Invoice","Packing List","Bill of Lading / Air Waybill","ISF filing (ocean imports)","Customs Bond"]}]}
};

/* ============ MODAL ENGINE ============ */
const CHECK_SVG = '<svg viewBox="0 0 16 16"><path d="M6.4 11.3 2.9 7.8l1.1-1.1 2.4 2.4 5.5-5.5 1.1 1.1z"/></svg>';
const DOC_SVG = '<svg viewBox="0 0 16 16"><path d="M4 1h6l3 3v11H4zM9 1v3h3"/></svg>';
let modalCommodity = "";

function openInfoModal(d){
  document.getElementById('modalIcon').textContent = d.icon || '📦';
  document.getElementById('modalEyebrow').textContent = d.eyebrow || '';
  document.getElementById('modalTitle').textContent = d.title || '';
  document.getElementById('modalLead').textContent = d.lead || '';
  const meta = document.getElementById('modalMeta');
  meta.innerHTML = (d.meta||[]).map(m =>
    '<div class="modal-meta-item"><div class="modal-meta-label">'+m[0]+'</div><div class="modal-meta-value">'+m[1]+'</div></div>').join('');
  meta.style.display = (d.meta && d.meta.length) ? 'grid' : 'none';
  const wrap = document.getElementById('modalSections');
  wrap.innerHTML = (d.sections||[]).map(sec => {
    const cls = sec.type === 'doc' ? 'doc' : 'check';
    const ic = sec.type === 'doc' ? DOC_SVG : CHECK_SVG;
    const items = sec.items.map(i => '<div class="modal-li '+cls+'">'+ic+'<span>'+i+'</span></div>').join('');
    return '<div class="modal-subhead">'+sec.head+'</div><div class="modal-list">'+items+'</div>';
  }).join('');
  const note = document.getElementById('modalNote');
  if(d.note){ note.textContent = d.note; note.style.display = 'block'; } else { note.style.display = 'none'; }
  modalCommodity = d.ctaCommodity || "";
  document.getElementById('modalCtaBtn').textContent = d.ctaLabel || 'Request a Quote →';
  const ov = document.getElementById('infoModal');
  ov.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeInfoModal(){
  document.getElementById('infoModal').classList.remove('open');
  document.body.style.overflow = '';
}
function openService(k){ if(SERVICE_DATA[k]) openInfoModal(SERVICE_DATA[k]); }
function openIndustry(k){ if(INDUSTRY_DATA[k]) openInfoModal(INDUSTRY_DATA[k]); }
function modalQuote(){
  if(modalCommodity){ const c = document.getElementById('commodity'); if(c) c.value = modalCommodity; }
  closeInfoModal();
  const q = document.getElementById('quote');
  if(q) q.scrollIntoView({behavior:'smooth'});
}
document.addEventListener('keydown', e => { if(e.key === 'Escape') closeInfoModal(); });



// ---- Netlify Forms submission (AJAX, keeps the on-page success UI) ----
function encodeForm(form){
  return new URLSearchParams(new FormData(form)).toString();
}
function isPreview(){ return location.protocol === 'file:'; }

function submitForm(){
  const email = document.getElementById('email').value;
  const fname = document.getElementById('fname').value;
  if(!fname.trim()){ alert('Please enter your name.'); return; }
  if(!email.trim() || !email.includes('@')){ alert('Please enter a valid email address.'); return; }
  const form = document.getElementById('quoteForm');
  const btn = document.getElementById('quoteSubmitBtn');
  if(btn){ btn.disabled = true; btn.textContent = 'Sending…'; }
  const showSuccess = () => {
    document.querySelectorAll('#quoteForm .form-section, #quoteForm .form-progress')
            .forEach(el => el.style.display = 'none');
    document.getElementById('successMsg').classList.add('show');
  };
  fetch('/', {method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body: encodeForm(form)})
    .then(showSuccess)
    .catch(() => {
      if(isPreview()){ showSuccess(); return; }   // local file preview has no server
      alert('Sorry, something went wrong sending your request. Please email info@seairodlogistics.com.');
      if(btn){ btn.disabled = false; btn.textContent = 'Submit Quote Request →'; }
    });
}

function submitContact(){
  const form = document.getElementById('contactForm');
  const nameEl = form.querySelector('[name="name"]');
  const emailEl = form.querySelector('[name="email"]');
  if(nameEl && !nameEl.value.trim()){ alert('Please enter your name.'); return; }
  if(emailEl && (!emailEl.value.trim() || !emailEl.value.includes('@'))){ alert('Please enter a valid email address.'); return; }
  const btn = document.getElementById('contactSubmitBtn');
  if(btn){ btn.disabled = true; btn.textContent = 'Sending…'; }
  const showSuccess = () => {
    form.querySelectorAll('.form-divider, .form-row, .form-group, #contactSubmitBtn')
        .forEach(el => el.style.display = 'none');
    document.getElementById('contactSuccess').classList.add('show');
  };
  fetch('/', {method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body: encodeForm(form)})
    .then(showSuccess)
    .catch(() => {
      if(isPreview()){ showSuccess(); return; }
      alert('Sorry, something went wrong. Please email info@seairodlogistics.com.');
      if(btn){ btn.disabled = false; btn.textContent = 'Send Message →'; }
    });
}

// FAQ accordion
function toggleFaq(el){
  const item = el.closest('.faq-item');
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
  if(!isOpen) item.classList.add('open');
}

// Nav starts transparent
nav.style.background = 'transparent';
