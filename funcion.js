// ══════════════════════════════════════════════
//  FIREBASE CONFIG
//  ► Reemplaza estos valores con los de tu
//    proyecto en console.firebase.google.com
// ══════════════════════════════════════════════
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBKnk6d8IHD64BEvOCdmEBHKJaUxuIe7hk",
  authDomain: "iglesia-dios-es-amor.firebaseapp.com",
  projectId: "iglesia-dios-es-amor",
  storageBucket: "iglesia-dios-es-amor.firebasestorage.app",
  messagingSenderId: "450327432620",
  appId: "1:450327432620:web:c94c84889a4b00cbffbe09"
};

// ── Inicializar Firebase ──────────────────────
let db = null;
let fbReady = false;

function initFirebase() {
  try {
    if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
    db = firebase.firestore();
    fbReady = true;
    console.log("✅ Firebase conectado");
  } catch(e) {
    console.warn("⚠️ Firebase no configurado, usando localStorage:", e.message);
    fbReady = false;
  }
}

// ══════════════════════════════════════════════
//  CONTRASEÑA
// ══════════════════════════════════════════════
const ADMIN_PASS = 'iglesia2025';

function checkPass() {
  const v   = document.getElementById('adminPass').value;
  const err = document.getElementById('loginErr');
  if (v === ADMIN_PASS) {
    document.getElementById('adminLogin').style.display = 'none';
    document.getElementById('adminPass').value = '';
    err.style.display = 'none';
    openPanel();
  } else {
    err.style.display = 'block';
    document.getElementById('adminPass').focus();
  }
}

function openAdmin() {
  document.getElementById('adminLogin').style.display = 'flex';
  setTimeout(() => document.getElementById('adminPass').focus(), 100);
}

function openPanel() {
  const p = document.getElementById('adminPanel');
  p.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  loadAll();
}

function closeAdmin() {
  document.getElementById('adminPanel').style.display = 'none';
  document.body.style.overflow = '';
}

// ══════════════════════════════════════════════
//  TABS
// ══════════════════════════════════════════════
function showTab(name, btn) {
  document.querySelectorAll('.adm-content').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.adm-tab').forEach(b => {
    b.classList.remove('active');
    b.style.color = '#6B8FAE';
    b.style.background = 'none';
    b.style.borderLeftColor = 'transparent';
  });
  document.getElementById('tab-' + name).style.display = 'block';
  btn.classList.add('active');
}

// ══════════════════════════════════════════════
//  DATOS DEFAULT (primer arranque)
// ══════════════════════════════════════════════
const DEFAULT = {
  noticias: [
    { id:'n1', tag:'Evento Especial', fecha:'20 de mayo, 2025', titulo:'Gran Campaña Evangelística: La Gracia que Transforma', desc:'Tres noches de prédicas, alabanza y testimonios que cambiarán vidas.', emoji:'🌟', orden:1 },
    { id:'n2', tag:'Ministerio',      fecha:'12 de mayo, 2025', titulo:'Inauguración del salón infantil Pequeños Guerreros', desc:'Nuevo espacio renovado para la formación espiritual de nuestros niños.', emoji:'👶', orden:2 },
    { id:'n3', tag:'Comunidad',       fecha:'5 de mayo, 2025',  titulo:'Jornada de servicio comunitario en el barrio norte', desc:'Más de 60 voluntarios en limpieza, asistencia médica y distribución de víveres.', emoji:'🤝', orden:3 }
  ],
  ministerios: [
    { id:'m1', emoji:'🎵', nombre:'Ministerio de Alabanza',  desc:'Un equipo apasionado que conduce a la congregación a la presencia de Dios.', horario:'Ensayos: Sábados 4 PM',  orden:1 },
    { id:'m2', emoji:'👧', nombre:'Ministerio Infantil',      desc:'Enseñamos a los niños de 3 a 12 años los valores del Reino.', horario:'Domingos durante culto', orden:2 },
    { id:'m3', emoji:'🔥', nombre:'Ministerio de Jóvenes',   desc:'Un espacio de encuentro, identidad y propósito para jóvenes de 13 a 30 años.', horario:'Viernes 7 PM', orden:3 },
    { id:'m4', emoji:'💒', nombre:'Ministerio Matrimonios',   desc:'Fortalecemos los matrimonios con talleres, retiros y consejería bíblica.', horario:'2do Sábado del mes', orden:4 },
    { id:'m5', emoji:'🌍', nombre:'Ministerio de Misiones',  desc:'Apoyamos y enviamos misioneros a comunidades de difícil acceso.', horario:'Reunión mensual', orden:5 },
    { id:'m6', emoji:'💛', nombre:'Ministerio Social',        desc:'Extendemos la mano amiga a familias en necesidad.', horario:'Sábados 9 AM', orden:6 }
  ],
  avisos: [
    { id:'a1', dia:'25', mes:'May', titulo:'Ayuno y oración congregacional', desc:'Este sábado a las 8 AM nos reuniremos para un tiempo de ayuno y oración.', urgente:true,  orden:1 },
    { id:'a2', dia:'01', mes:'Jun', titulo:'Cambio de horario en culto dominical', desc:'A partir del 1 de junio el culto dominical pasará a las 10:30 AM.', urgente:false, orden:2 },
    { id:'a3', dia:'15', mes:'Jun', titulo:'Retiro anual de mujeres "Coronadas"', desc:'Inscripciones abiertas. Lugar: Rancho El Refugio. Cupo limitado.', urgente:false, orden:3 },
    { id:'a4', dia:'22', mes:'Jun', titulo:'Bautismos en agua', desc:'Próximo servicio de bautismos el 22 de junio.', urgente:false, orden:4 }
  ]
};

// ══════════════════════════════════════════════
//  CAPA DE DATOS  (Firebase ↔ localStorage)
// ══════════════════════════════════════════════

// ── Leer colección ────────────────────────────
async function getCollection(col) {
  if (fbReady) {
    try {
      const snap = await db.collection(col).orderBy('orden').get();
      if (snap.empty) {
        // Primera vez: seed desde DEFAULT
        await seedCollection(col);
        return DEFAULT[col];
      }
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch(e) {
      console.warn('Firestore read error, fallback localStorage', e);
    }
  }
  // fallback: localStorage
  try { return JSON.parse(localStorage.getItem('adm_' + col)) || DEFAULT[col]; }
  catch(e) { return DEFAULT[col]; }
}

// ── Seed inicial en Firestore ─────────────────
async function seedCollection(col) {
  if (!fbReady) return;
  const batch = db.batch();
  DEFAULT[col].forEach(item => {
    const { id, ...data } = item;
    batch.set(db.collection(col).doc(id), data);
  });
  await batch.commit();
}

// ── Guardar documento ─────────────────────────
async function saveDoc(col, id, data) {
  // Siempre salvar en localStorage como respaldo
  const all = await getCollection(col);
  const idx = all.findIndex(x => x.id === id);
  if (idx >= 0) all[idx] = { id, ...data };
  localStorage.setItem('adm_' + col, JSON.stringify(all));

  if (fbReady) {
    try {
      const { id: _id, ...fields } = { id, ...data };
      await db.collection(col).doc(id).set(fields);
      return true;
    } catch(e) {
      console.warn('Firestore write error:', e);
    }
  }
  return false;
}

// ── Eliminar documento ────────────────────────
async function deleteDoc(col, id) {
  const all = await getCollection(col);
  const filtered = all.filter(x => x.id !== id);
  // Renumerar orden
  filtered.forEach((x,i) => x.orden = i+1);
  localStorage.setItem('adm_' + col, JSON.stringify(filtered));

  if (fbReady) {
    try {
      await db.collection(col).doc(id).delete();
      // Update orders
      const batch = db.batch();
      filtered.forEach(x => {
        const { id: xid, ...data } = x;
        batch.update(db.collection(col).doc(xid), { orden: data.orden });
      });
      await batch.commit();
      return true;
    } catch(e) { console.warn('Firestore delete error:', e); }
  }
  return false;
}

// ── Agregar documento ─────────────────────────
async function addDoc(col, data) {
  const all = await getCollection(col);
  const newId = col[0] + Date.now();
  const newItem = { id: newId, ...data, orden: all.length + 1 };
  all.push(newItem);
  localStorage.setItem('adm_' + col, JSON.stringify(all));

  if (fbReady) {
    try {
      const { id: _id, ...fields } = newItem;
      await db.collection(col).doc(newId).set(fields);
    } catch(e) { console.warn('Firestore add error:', e); }
  }
  return newItem;
}

// ── Escuchar cambios en tiempo real ──────────
function listenRealtime() {
  if (!fbReady) return;
  ['noticias','ministerios','avisos'].forEach(col => {
    db.collection(col).orderBy('orden').onSnapshot(snap => {
      if (snap.empty) return;
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      localStorage.setItem('adm_' + col, JSON.stringify(items));
      // Re-render the section on the public page
      if      (col === 'noticias')    renderNoticias(items);
      else if (col === 'ministerios') renderMinisterios(items);
      else if (col === 'avisos')      renderAvisos(items);
    }, err => console.warn('Snapshot error:', err));
  });
}

// ══════════════════════════════════════════════
//  RENDER PÁGINA PÚBLICA
// ══════════════════════════════════════════════
function renderNoticias(items) {
  const g = document.querySelector('.news-g');
  if (!g) return;
  const bgs = [
    'linear-gradient(135deg,#0b1d35,#0a47cc)',
    'linear-gradient(135deg,#0a1d40,#1a3a6a)',
    'linear-gradient(135deg,#0b1d35,#5b9bd5)'
  ];
  g.innerHTML = items.slice(0,3).map((n,i) => {
    const fallbackBg = bgs[i%3];
    const emo = n.emoji||'📰';
    const thumb = n.imagen
      ? `<div class="nc-thumb" style="padding:0;"><img src="${n.imagen}" style="width:100%;height:100%;object-fit:cover;object-position:center;display:block;transition:transform .5s;" alt="${n.titulo}" onerror="this.parentElement.style.background='${fallbackBg}';this.parentElement.style.fontSize='2.5rem';this.parentElement.style.display='flex';this.parentElement.style.alignItems='center';this.parentElement.style.justifyContent='center';this.outerHTML='${emo}';"></div>`
      : `<div class="nc-thumb" style="background:${fallbackBg};font-size:2.5rem;display:flex;align-items:center;justify-content:center;">${emo}</div>`;
    return `
    <a href="#" class="nc" onclick="openNewsModal(event,'${n.id}')">
      ${thumb}
      <div class="nc-body">
        <p class="nc-tag">${n.tag}</p>
        <p class="nc-date">${n.fecha}</p>
        <h3>${n.titulo}</h3>
        <p>${n.desc}</p>
        <span class="nc-more">Leer más</span>
      </div>
    </a>`;
  }).join('');
}

function renderMinisterios(items) {
  const g = document.querySelector('.min-g');
  if (!g) return;
  g.innerHTML = items.map((m,i) => `
    <div class="mc">
      <div class="mc-n">0${i+1}</div>
      <span class="mc-i">${m.emoji}</span>
      <h3>${m.nombre}</h3>
      <p>${m.desc}</p>
      <p class="mc-s">${m.horario}</p>
    </div>`).join('');
}

function renderAvisos(items) {
  const g = document.querySelector('.av-list');
  if (!g) return;
  g.innerHTML = items.map(a => `
    <div class="av-item${a.urgente?' urg':''}">
      <div class="av-dt"><span class="d">${a.dia}</span><span class="m">${a.mes}</span></div>
      <div class="av-bdy">
        ${a.urgente ? '<span class="urg-tag">Urgente</span>' : ''}
        <h4>${a.titulo}</h4>
        <p>${a.desc}</p>
      </div>
    </div>`).join('');
}

async function renderAll() {
  const [n, m, a] = await Promise.all([
    getCollection('noticias'),
    getCollection('ministerios'),
    getCollection('avisos')
  ]);
  renderNoticias(n);
  renderMinisterios(m);
  renderAvisos(a);
}

// ══════════════════════════════════════════════
//  PANEL ADMIN — CARGAR LISTAS
// ══════════════════════════════════════════════
async function loadAll() {
  showLoading(true);
  const [n, m, a] = await Promise.all([
    getCollection('noticias'),
    getCollection('ministerios'),
    getCollection('avisos')
  ]);
  loadNoticias(n);
  loadMinisterios(m);
  loadAvisos(a);
  showLoading(false);
}

function showLoading(on) {
  let el = document.getElementById('adm-loading');
  if (!el) {
    el = document.createElement('div');
    el.id = 'adm-loading';
    el.style.cssText = 'position:fixed;top:64px;right:1rem;z-index:99999;font-family:"Barlow Condensed",sans-serif;font-size:.75rem;letter-spacing:.15em;text-transform:uppercase;color:#7EB3E2;background:#0F2540;border:1px solid rgba(91,155,213,.2);padding:.4rem .9rem;border-radius:2px;';
    el.textContent = '⏳ Conectando con Firebase...';
    document.body.appendChild(el);
  }
  el.style.display = on ? 'block' : 'none';
}

function fbStatus() {
  // Status badge in panel sidebar
  const badge = document.getElementById('fb-status');
  if (!badge) return;
  if (fbReady) {
    badge.innerHTML = '<span style="color:#4CAF50;">● Firebase</span>';
    badge.title = 'Conectado a Firestore — cambios en la nube';
  } else {
    badge.innerHTML = '<span style="color:#FF9800;">● Local</span>';
    badge.title = 'Sin Firebase — cambios solo en este navegador';
  }
}

// ── Render tarjetas admin ─────────────────────
function loadNoticias(items) {
  const list = document.getElementById('noticias-list');
  list.innerHTML = '';
  items.forEach(n => {
    const card = document.createElement('div');
    card.className = 'adm-card';
    const imgVal = n.imagen || '';
    card.innerHTML = `
      <div class="adm-card-head" onclick="toggleCard(this)">
        <span style="font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.95rem;text-transform:uppercase;color:#FAF3E0;display:flex;align-items:center;gap:.6rem;">
          ${imgVal ? '<span style="width:32px;height:22px;border-radius:2px;background:'+imgVal.substring(0,6)+'... no-repeat center/cover;overflow:hidden;flex-shrink:0;"><img src="'+imgVal+'" style="width:100%;height:100%;object-fit:cover;"></span>' : '<span style="font-size:1.2rem;">'+(n.emoji||'📰')+'</span>'}
          ${n.titulo.substring(0,40)}${n.titulo.length>40?'…':''}
        </span>
        <span style="color:#6B8FAE;font-size:.8rem;">▾</span>
      </div>
      <div class="adm-card-body">
        <div class="adm-row">
          <div><label class="adm-label">Emoji (sin imagen)</label><input class="adm-field" data-field="emoji" value="${n.emoji||''}"></div>
          <div><label class="adm-label">Etiqueta</label><input class="adm-field" data-field="tag" value="${n.tag}"></div>
        </div>
        <div><label class="adm-label">Fecha</label><input class="adm-field" data-field="fecha" value="${n.fecha}"></div>
        <div><label class="adm-label">Título</label><input class="adm-field" data-field="titulo" value="${n.titulo}"></div>
        <div><label class="adm-label">Descripción corta (tarjeta)</label><textarea class="adm-field" data-field="desc" rows="2">${n.desc}</textarea></div>
        <div><label class="adm-label">Contenido completo (al dar clic "Leer más")</label><textarea class="adm-field" data-field="cuerpo" rows="5" placeholder="Escribe aquí el texto completo de la noticia. Puedes usar saltos de línea para separar párrafos.">${n.cuerpo||''}</textarea></div>

        <!-- Imagen -->
        <div>
          <label class="adm-label">Imagen de la noticia</label>
          <div style="display:flex;flex-direction:column;gap:.6rem;">

            <!-- Upload desde dispositivo -->
            <div class="img-preview-wrap" id="ipw_${n.id}" onclick="document.getElementById('ifile_${n.id}').click()">
              <img id="ipreview_${n.id}" src="${imgVal}" alt="preview" ${imgVal?'style="display:block;"':''}
                onerror="this.style.display='none';document.getElementById('ihint_${n.id}').style.display='flex';">
              <div class="upload-hint" id="ihint_${n.id}" ${imgVal?'style="display:none;"':''}><span>🖼️</span>Subir imagen desde dispositivo</div>
              <div class="img-overlay-btn">🔄 Cambiar imagen</div>
            </div>
            <input type="file" id="ifile_${n.id}" accept="image/*" style="display:none;" onchange="previewImg(this,'${n.id}')">

            <!-- O pegar URL -->
            <div style="display:flex;align-items:center;gap:.5rem;">
              <div style="flex:1;height:1px;background:rgba(91,155,213,.15);"></div>
              <span style="font-family:'Barlow Condensed',sans-serif;font-size:.6rem;letter-spacing:.15em;color:#3A5C82;text-transform:uppercase;">O pegar URL</span>
              <div style="flex:1;height:1px;background:rgba(91,155,213,.15);"></div>
            </div>
            <div style="display:flex;gap:.5rem;">
              <input class="adm-field" id="iurl_${n.id}" placeholder="https://..." value="${imgVal&&imgVal.startsWith('http')?imgVal:''}" style="flex:1;">
              <button onclick="applyUrl('${n.id}')" style="font-family:'Barlow Condensed',sans-serif;font-size:.7rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;background:#0A47CC;color:#FAF3E0;border:none;padding:9px 14px;cursor:pointer;border-radius:2px;white-space:nowrap;">Aplicar</button>
            </div>
            <input type="hidden" id="idata_${n.id}" data-field="imagen" value="${imgVal}">
          </div>
        </div>

        <div style="display:flex;gap:.6rem;justify-content:flex-end;margin-top:.4rem;">
          <button class="del-btn" onclick="handleDelete('noticias','${n.id}')">🗑 Eliminar</button>
          <button class="save-btn" onclick="handleSave('noticias','${n.id}',this)">💾 Guardar</button>
        </div>
      </div>`;
    list.appendChild(card);
  });
}

function loadMinisterios(items) {
  const list = document.getElementById('ministerios-list');
  list.innerHTML = '';
  items.forEach(m => {
    const card = document.createElement('div');
    card.className = 'adm-card';
    card.innerHTML = `
      <div class="adm-card-head" onclick="toggleCard(this)">
        <span style="font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.95rem;text-transform:uppercase;color:#FAF3E0;display:flex;align-items:center;gap:.6rem;">
          <span style="font-size:1.2rem;">${m.emoji}</span> ${m.nombre}
        </span>
        <span style="color:#6B8FAE;font-size:.8rem;">▾</span>
      </div>
      <div class="adm-card-body">
        <div class="adm-row">
          <div><label class="adm-label">Emoji</label><input class="adm-field" data-field="emoji" value="${m.emoji}"></div>
          <div><label class="adm-label">Horario</label><input class="adm-field" data-field="horario" value="${m.horario}"></div>
        </div>
        <div><label class="adm-label">Nombre del ministerio</label><input class="adm-field" data-field="nombre" value="${m.nombre}"></div>
        <div><label class="adm-label">Descripción</label><textarea class="adm-field" data-field="desc" rows="3">${m.desc}</textarea></div>
        <div><label class="adm-label">Orden (número)</label><input class="adm-field" data-field="orden" type="number" value="${m.orden||1}" min="1"></div>
        <div style="display:flex;gap:.6rem;justify-content:flex-end;margin-top:.4rem;">
          <button class="save-btn" onclick="handleSave('ministerios','${m.id}',this)">💾 Guardar</button>
        </div>
      </div>`;
    list.appendChild(card);
  });
}

function loadAvisos(items) {
  const list = document.getElementById('avisos-list');
  list.innerHTML = '';
  items.forEach(a => {
    const card = document.createElement('div');
    card.className = 'adm-card';
    card.innerHTML = `
      <div class="adm-card-head" onclick="toggleCard(this)">
        <span style="font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.95rem;text-transform:uppercase;color:${a.urgente?'#e57373':'#FAF3E0'};display:flex;align-items:center;gap:.6rem;">
          ${a.urgente?'🔴 ':'📌 '}${a.titulo.substring(0,38)}${a.titulo.length>38?'…':''}
        </span>
        <span style="color:#6B8FAE;font-size:.8rem;">▾</span>
      </div>
      <div class="adm-card-body">
        <div class="adm-row">
          <div><label class="adm-label">Día</label><input class="adm-field" data-field="dia" value="${a.dia}"></div>
          <div><label class="adm-label">Mes (abrev.)</label><input class="adm-field" data-field="mes" value="${a.mes}"></div>
        </div>
        <div><label class="adm-label">Título del aviso</label><input class="adm-field" data-field="titulo" value="${a.titulo}"></div>
        <div><label class="adm-label">Descripción</label><textarea class="adm-field" data-field="desc" rows="2">${a.desc}</textarea></div>
        <div style="display:flex;align-items:center;gap:.6rem;">
          <input type="checkbox" id="urg_${a.id}" data-field="urgente" ${a.urgente?'checked':''} style="accent-color:#C0392B;width:14px;height:14px;">
          <label for="urg_${a.id}" style="font-family:'Barlow Condensed',sans-serif;font-size:.72rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#e57373;cursor:pointer;">Marcar como URGENTE</label>
        </div>
        <div style="display:flex;gap:.6rem;justify-content:flex-end;margin-top:.4rem;">
          <button class="del-btn" onclick="handleDelete('avisos','${a.id}')">🗑 Eliminar</button>
          <button class="save-btn" onclick="handleSave('avisos','${a.id}',this)">💾 Guardar</button>
        </div>
      </div>`;
    list.appendChild(card);
  });
}

// ══════════════════════════════════════════════
//  ACCIONES CRUD
// ══════════════════════════════════════════════
function toggleCard(head) {
  const body  = head.nextElementSibling;
  const arrow = head.querySelector('span:last-child');
  const open  = body.style.display !== 'none';
  body.style.display  = open ? 'none' : 'flex';
  arrow.textContent   = open ? '▾' : '▴';
}

async function handleSave(col, id, btn) {
  const card = btn.closest('.adm-card');
  const all  = await getCollection(col);
  const item = all.find(x => x.id === id);
  if (!item) return;

  btn.textContent = '⏳';
  btn.disabled = true;

  // Leer todos los campos editables
  card.querySelectorAll('[data-field]').forEach(f => {
    const field = f.dataset.field;
    if (f.type === 'checkbox') {
      item[field] = f.checked;
    } else if (f.type === 'number') {
      item[field] = parseInt(f.value) || 1;
    } else if (f.type === 'hidden') {
      // Hidden inputs (ej. imagen en base64 o URL procesada)
      if (f.value && f.value.trim() !== '') item[field] = f.value.trim();
    } else {
      item[field] = f.value;
    }
  });

  // Normalizar URL de Google Drive si aplica
  if (item.imagen) {
    item.imagen = normalizeImageUrl(item.imagen);
  }

  const ok = await saveDoc(col, id, item);

  // Actualizar encabezado de la tarjeta
  if (col === 'noticias' || col === 'ministerios') {
    const head = card.querySelector('.adm-card-head span:first-child');
    const name = col === 'noticias' ? item.titulo : item.nombre;
    head.innerHTML = `<span style="font-size:1.2rem;">${item.emoji||'📰'}</span> ${name.substring(0,40)}`;
  }

  // Re-renderizar sección pública
  const all2 = await getCollection(col);
  if (col === 'noticias')    renderNoticias(all2);
  if (col === 'ministerios') renderMinisterios(all2);
  if (col === 'avisos')      renderAvisos(all2);

  btn.textContent = ok ? '✓ Guardado' : '✓ Local';
  btn.style.background = '#1A7A3C';
  setTimeout(() => {
    btn.textContent = '💾 Guardar';
    btn.style.background = '#0A47CC';
    btn.disabled = false;
  }, 2000);
  showToast(ok ? '✅ Guardado en Firebase' : '💾 Guardado localmente');
  if (col === 'noticias') _newsCache = []; // invalidar caché modal
}

async function handleDelete(col, id) {
  if (!confirm('¿Eliminar este elemento?')) return;
  await deleteDoc(col, id);
  const all = await getCollection(col);
  if (col === 'noticias')    { _newsCache = []; renderNoticias(all); loadNoticias(all); }
  if (col === 'ministerios') { renderMinisterios(all); loadMinisterios(all); }
  if (col === 'avisos')      { renderAvisos(all);      loadAvisos(all); }
  showToast('🗑 Elemento eliminado');
}

async function addNoticia() {
  const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const now = new Date();
  const item = await addDoc('noticias', {
    emoji: '📰', tag: 'General',
    fecha: `${now.getDate()} de ${['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'][now.getMonth()]}, ${now.getFullYear()}`,
    titulo: 'Nueva Noticia', desc: 'Descripción de la noticia...'
  });
  const all = await getCollection('noticias');
  renderNoticias(all);
  loadNoticias(all);
  showToast('✅ Nueva noticia creada');
}

async function addAviso() {
  const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const now = new Date();
  const item = await addDoc('avisos', {
    dia: String(now.getDate()).padStart(2,'0'),
    mes: meses[now.getMonth()],
    titulo: 'Nuevo Aviso',
    desc: 'Descripción del aviso...',
    urgente: false
  });
  const all = await getCollection('avisos');
  renderAvisos(all);
  loadAvisos(all);
  showToast('✅ Nuevo aviso creado');
}

// ── Toast ─────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg || '✓ Cambios guardados';
  t.style.opacity = '1';
  setTimeout(() => t.style.opacity = '0', 2600);
}

// ══════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════
// ── NEWS MODAL ──────────────────────────────────
let _newsCache = [];

async function openNewsModal(e, id) {
  e.preventDefault();
  if (!_newsCache.length) _newsCache = await getCollection('noticias');
  const n = _newsCache.find(x => x.id === id);
  if (!n) return;

  // Image
  const imgWrap = document.getElementById('nmImgWrap');
  if (n.imagen) {
    imgWrap.innerHTML = `<img src="${n.imagen}" class="nm-img" alt="${n.titulo}" onerror="this.outerHTML='<div class=nm-img-placeholder>${n.emoji||'📰'}</div>'">`;
  } else {
    imgWrap.innerHTML = `<div class="nm-img-placeholder">${n.emoji||'📰'}</div>`;
  }

  document.getElementById('nmTag').textContent   = n.tag;
  document.getElementById('nmDate').textContent  = n.fecha;
  document.getElementById('nmTitle').textContent = n.titulo;
  document.getElementById('nmBody').textContent  = n.cuerpo || n.desc;

  const ov = document.getElementById('nmOverlay');
  ov.classList.add('open');
  document.body.style.overflow = 'hidden';
  // Scroll modal to top
  document.getElementById('nmBox').scrollTop = 0;
}

function closeNewsModal(ev) {
  if (!ev || ev.target === document.getElementById('nmOverlay') || ev.currentTarget.classList.contains('nm-close')) {
    document.getElementById('nmOverlay').classList.remove('open');
    document.body.style.overflow = '';
  }
}

// ── IMAGE UPLOAD HELPERS ─────────────────────
function previewImg(input, id) {
  const file = input.files[0];
  if (!file) return;

  // Redimensionar imagen antes de guardar para ahorrar espacio
  const reader = new FileReader();
  reader.onload = e => {
    const original = new Image();
    original.onload = () => {
      // Máx 1200px de ancho, aspect ratio 16:9 recortado al centro
      const MAX_W = 1200;
      const MAX_H = 675; // 16:9
      let w = original.width;
      let h = original.height;

      // Escalar manteniendo proporción
      const scale = Math.min(MAX_W / w, MAX_H / h, 1);
      w = Math.round(w * scale);
      h = Math.round(h * scale);

      const canvas = document.createElement('canvas');
      canvas.width  = MAX_W;
      canvas.height = MAX_H;
      const ctx = canvas.getContext('2d');

      // Centrar y recortar a 16:9
      const srcAspect = original.width / original.height;
      const dstAspect = MAX_W / MAX_H;
      let sx, sy, sw, sh;
      if (srcAspect > dstAspect) {
        sh = original.height;
        sw = Math.round(sh * dstAspect);
        sx = Math.round((original.width - sw) / 2);
        sy = 0;
      } else {
        sw = original.width;
        sh = Math.round(sw / dstAspect);
        sx = 0;
        sy = Math.round((original.height - sh) / 2);
      }
      ctx.drawImage(original, sx, sy, sw, sh, 0, 0, MAX_W, MAX_H);

      const data = canvas.toDataURL('image/jpeg', 0.82);

      const img    = document.getElementById('ipreview_' + id);
      const hint   = document.getElementById('ihint_' + id);
      const hidden = document.getElementById('idata_' + id);
      img.src = data;
      img.style.display = 'block';
      if (hint) hint.style.display = 'none';
      hidden.value = data;

      const kb = Math.round(data.length * 0.75 / 1024);
      showToast(kb > 800
        ? `⚠️ Imagen ${kb}KB — considera usar URL externa si Firebase falla`
        : `✅ Imagen lista (${kb}KB) — presiona Guardar`);
    };
    original.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// ── Normalizar URLs de distintos orígenes ─────
function normalizeImageUrl(url) {
  if (!url) return '';
  url = url.trim();

  // Google Drive: /file/d/ID/view → direct link
  // Formatos: drive.google.com/file/d/ID/view?usp=sharing
  //           drive.google.com/open?id=ID
  const gdMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (gdMatch) {
    return `https://drive.google.com/uc?export=view&id=${gdMatch[1]}`;
  }
  const gdOpen = url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
  if (gdOpen) {
    return `https://drive.google.com/uc?export=view&id=${gdOpen[1]}`;
  }

  // Dropbox: ?dl=0 → ?raw=1
  if (url.includes('dropbox.com') && url.includes('dl=0')) {
    return url.replace('dl=0', 'raw=1');
  }

  // OneDrive: 1drv.ms / sharepoint embed
  // (OneDrive no soporta direct embed fácilmente; avisar)

  return url; // retornar tal cual para otros casos
}

function applyUrl(id) {
  const raw = document.getElementById('iurl_' + id).value.trim();
  if (!raw) return;
  const url    = normalizeImageUrl(raw);
  const img    = document.getElementById('ipreview_' + id);
  const hint   = document.getElementById('ihint_' + id);
  const hidden = document.getElementById('idata_' + id);

  img.onerror = () => {
    img.style.display = 'none';
    if (hint) hint.style.display = 'flex';
    hidden.value = '';
    showToast('❌ No se pudo cargar la imagen. Verifica que sea pública.');
  };
  img.onload = () => {
    img.style.display = 'block';
    if (hint) hint.style.display = 'none';
    hidden.value = url;
    // Update the URL field with normalized value
    document.getElementById('iurl_' + id).value = url;
    showToast('✅ Imagen cargada — presiona Guardar para confirmar');
  };
  img.src = url;
}

function initAdmin() {
  initFirebase();

  // Mostrar botón admin si URL tiene #admin
  const showBtn = () => {
    document.getElementById('adminBtn').style.display =
      window.location.hash === '#admin' ? 'block' : 'none';
  };
  showBtn();
  window.addEventListener('hashchange', showBtn);

  // Status badge Firebase
  setTimeout(fbStatus, 500);

  // Cargar datos en la página pública
  renderAll().then(() => {
    // Activar escucha en tiempo real cuando Firebase esté listo
    if (fbReady) listenRealtime();
  });
}

document.addEventListener('DOMContentLoaded', initAdmin);
