  window.addEventListener('scroll', () => {
    document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 40);
  });
  function toggleNav() { document.getElementById('navLinks').classList.toggle('open'); }
  document.querySelectorAll('.nav-links a').forEach(a => a.addEventListener('click', () => document.getElementById('navLinks').classList.remove('open')));
  function openModal(e, c) { document.getElementById('me').textContent=e; document.getElementById('mc').textContent=c; document.getElementById('modal').classList.add('open'); }
  function closeModal(ev) { if(!ev||ev.target===document.getElementById('modal')||ev.currentTarget.classList.contains('m-cls')) document.getElementById('modal').classList.remove('open'); }
  // ════════════════════════════════════════════
  //  EMAILJS CONFIG
  //  ► Completa estos 3 valores desde
  //    dashboard.emailjs.com (son gratuitos)
  // ════════════════════════════════════════════
  const EJS = {
    publicKey:   'wn2xNubqOXxSQ9j2c',    // Account → API Keys → Public Key
    serviceId:   'service_0x6p6jg',    // Email Services → tu servicio Gmail
    templateId:  'template_7ha3mxm'   // Email Templates → tu plantilla
  };

  // Inicializar EmailJS
  (function() {
    try { emailjs.init({ publicKey: EJS.publicKey }); }
    catch(e) { console.warn('EmailJS no inicializado:', e); }
  })();

  function sendForm() {
    const nombre  = document.getElementById('cf-nombre').value.trim();
    const email   = document.getElementById('cf-email').value.trim();
    const tel     = document.getElementById('cf-tel').value.trim();
    const motivo  = document.getElementById('cf-motivo').value;
    const mensaje = document.getElementById('cf-mensaje').value.trim();
    const errEl   = document.getElementById('cf-error');
    const btn     = document.getElementById('cf-btn');

    // Validación
    errEl.style.display = 'none';
    if (!nombre) { showErr('Por favor ingresa tu nombre.'); return; }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showErr('Ingresa un correo electrónico válido.'); return; }
    if (!mensaje) { showErr('Por favor escribe tu mensaje.'); return; }

    // Estado cargando
    btn.disabled    = true;
    btn.textContent = '⏳ Enviando...';
    btn.style.background = 'rgba(91,155,213,.4)';

    // Parámetros que se inyectan en la plantilla de EmailJS
    const params = {
      from_name:    nombre,
      from_email:   email,
      phone:        tel || 'No proporcionado',
      subject:      motivo || 'Contacto desde la página web',
      message:      mensaje,
      reply_to:     email,
      to_email:     'igldiosesamor@gmail.com'
    };

    emailjs.send(EJS.serviceId, EJS.templateId, params)
      .then(() => {
        // Éxito
        document.getElementById('fw').style.display = 'none';
        document.getElementById('fs').style.display  = 'block';
      })
      .catch(err => {
        console.error('EmailJS error:', err);
        showErr('Ocurrió un error al enviar. Intenta de nuevo o escríbenos directo a igldiosesamor@gmail.com');
        btn.disabled    = false;
        btn.textContent = 'Enviar Mensaje';
        btn.style.background = '';
      });
  }

  function showErr(msg) {
    const el = document.getElementById('cf-error');
    el.textContent = '⚠ ' + msg;
    el.style.display = 'block';
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function resetForm() {
    ['cf-nombre','cf-email','cf-tel','cf-mensaje'].forEach(id => {
      document.getElementById(id).value = '';
    });
    document.getElementById('cf-motivo').value = '';
    document.getElementById('cf-error').style.display = 'none';
    const btn = document.getElementById('cf-btn');
    btn.disabled = false;
    btn.textContent = 'Enviar Mensaje';
    btn.style.background = '';
    document.getElementById('fw').style.display = 'block';
    document.getElementById('fs').style.display  = 'none';
  }