/* SOS360 — Critical precision system.
   Light-theme interactive prototype: search → results → detail. */

const { useState, useEffect, useRef, useMemo } = React;

/* ---------- Lucide bridge ---------- */
function kebabToCamel(s) { return s.replace(/-([a-z])/g, (_, c) => c.toUpperCase()); }
function reactAttrs(a) { const o = {}; for (const k in a) o[kebabToCamel(k)] = a[k]; return o; }
function Icon({ name, size = 18, className = '', strokeWidth = 1.75, style }) {
  const node = window.lucide && window.lucide.icons && window.lucide.icons[name];
  if (!node) return <span className={className} style={{ width: size, height: size, display: 'inline-block' }} />;
  const [, attrs, children] = node;
  return (
    <svg {...reactAttrs(attrs)} width={size} height={size} strokeWidth={strokeWidth} className={className} style={style} aria-hidden="true">
      {children.map((c, i) => React.createElement(c[0], { key: i, ...reactAttrs(c[1]) }))}
    </svg>
  );
}

/* ---------- Data ---------- */
const CATEGORIES = [
  { id: 'medicas',   name: 'Médicas y de salud',     priority: 'Alta',  subtitle: 'Lesiones, paros, traumas', icon: 'HeartPulse',  photo: 'photo-desmayo' },
  { id: 'hogar',     name: 'Hogar y estructuras',    priority: 'Alta',  subtitle: 'Incendios, Inundaciones',  icon: 'Home',        photo: 'photo-incendio' },
  { id: 'naturales', name: 'Fenómenos naturales',    priority: 'Alta',  subtitle: 'Sismos, Tormentas',        icon: 'Tornado',     photo: 'photo-sismo' },
  { id: 'seguridad', name: 'Seguridad',              priority: 'Media', subtitle: 'Policía, Protección',      icon: 'ShieldAlert', photo: 'photo-robo' },
  { id: 'misc',      name: 'Misceláneas',            priority: 'Baja',  subtitle: 'Otros incidentes',         icon: 'CircleEllipsis', photo: 'photo-llanta' },
];

const PROTOCOLS = [
  {
    id: 'incendio',
    title: 'Incendio en casa',
    category: 'hogar',
    priority: 'Alta',
    severity: 'critical',
    blurb: 'Fuego activo dentro del hogar que puede propagarse rápido y generar humo tóxico.',
    description:
      'El humo es la primera causa de muerte en incendios domésticos. Mantén la calma, evacúa con la cabeza baja y cierra puertas a tu paso para reducir la propagación del oxígeno.',
    photo: 'photo-incendio',
    keywords: ['incendio', 'fuego', 'humo', 'flama', 'casa'],
    doNow: [
      'Agáchate y cúbrete la boca',
      'Sal cerrando puertas a tu paso',
      'Llama al 911 desde fuera',
    ],
    indicators: [
      { icon: 'Cloud',  text: 'El humo llena la habitación rápidamente.' },
      { icon: 'Flame',  text: 'Las llamas exceden una habitación o están en el techo/paredes.' },
      { icon: 'Volume2', text: 'Escuchas crujidos estructurales o explosiones.' },
    ],
    softTips: {
      heading: 'Cómo mejorar la situación (si no es grave)',
      kicker: 'USO DE EXTINTORES',
      body: 'Usa solo si el fuego es pequeño. Apunta a la base de las llamas, no al tope.',
      icon: 'FlameKindling',
    },
    suggestions: [
      { id: 'incendio-electrico', label: 'Incendio eléctrico' },
      { id: 'incendio-aceite',    label: 'Incendio de aceite' },
      { id: 'inundacion',         label: 'Fuga de gas' },
    ],
    triage: [
      { q: '¿El fuego cabe en menos de una habitación?', opts: ['Sí', 'No', 'No estoy seguro'] },
      { q: '¿Tienes una salida segura sin atravesar humo denso?', opts: ['Sí', 'No'] },
    ],
    verdict: { level: 'EVACUAR YA', body: 'Sal del inmueble y llama al 911 desde fuera.' },
  },
  {
    id: 'desmayo',
    title: 'Desmayo',
    category: 'medicas',
    priority: 'Alta',
    severity: 'critical',
    blurb: 'Pérdida súbita de conciencia con recuperación rápida en la mayoría de casos.',
    description:
      'El síncope es una pérdida breve del conocimiento por reducción del flujo cerebral. La mayoría de los casos son benignos pero requieren observación inmediata para descartar paro cardíaco.',
    photo: 'photo-desmayo',
    keywords: ['desmayo', 'sincope', 'inconsciente', 'desplom', 'paro'],
    doNow: [
      'Acuesta a la persona boca arriba',
      'Eleva sus piernas 30 cm',
      'Verifica respiración cada 15s',
    ],
    indicators: [
      { icon: 'Wind',     text: 'No respira o lo hace con dificultad.' },
      { icon: 'EyeOff',   text: 'No responde tras 60 segundos.' },
      { icon: 'Droplets', text: 'Labios o uñas con color azulado.' },
    ],
    softTips: {
      heading: 'Cómo mejorar la situación (si no es grave)',
      kicker: 'RECUPERACIÓN',
      body: 'Una vez consciente, ofrece agua a sorbos. Mantén la zona ventilada y evita levantar a la persona.',
      icon: 'Droplet',
    },
    suggestions: [
      { id: 'fractura',  label: 'Golpe en la cabeza' },
      { id: 'quemadura', label: 'Hipoglucemia' },
    ],
    triage: [
      { q: '¿La persona respira con normalidad?', opts: ['Sí', 'No', 'No estoy seguro'] },
      { q: '¿Responde al hablarle o tocarle el hombro?', opts: ['Sí, responde', 'No responde'] },
      { q: '¿Hay sospecha de lesión en cabeza o cuello?', opts: ['No', 'Sí'] },
    ],
    verdict: { level: 'ALERTA ROJA', body: 'Llama a Emergencias. Posible paro respiratorio.' },
  },
  {
    id: 'sismo',
    title: 'Sismo en curso',
    category: 'naturales',
    priority: 'Alta',
    severity: 'critical',
    blurb: 'Movimiento sísmico activo. Protégete bajo estructura sólida hasta que cese.',
    description:
      'Durante un sismo lo prioritario es no salir corriendo. La mayoría de las lesiones ocurren al moverse entre objetos que caen. Espera al cese del movimiento para evacuar.',
    photo: 'photo-sismo',
    keywords: ['sismo', 'terremoto', 'temblor'],
    doNow: [
      'Agáchate, cúbrete y sujétate',
      'Aléjate de ventanas y libreros',
      'Espera al cese antes de evacuar',
    ],
    indicators: [
      { icon: 'AlertTriangle', text: 'Estás cerca de muros que ya muestran fisuras.' },
      { icon: 'Building',      text: 'Escuchas crujidos profundos del edificio.' },
      { icon: 'Zap',           text: 'Olor a gas tras el movimiento.' },
    ],
    softTips: {
      heading: 'Después del sismo',
      kicker: 'REVISIÓN',
      body: 'Cierra llaves de gas, revisa heridos y mantente alejado de muros agrietados durante 24h.',
      icon: 'ShieldCheck',
    },
    suggestions: [
      { id: 'incendio',    label: 'Fuga de gas' },
      { id: 'inundacion',  label: 'Daño estructural' },
    ],
    triage: [
      { q: '¿El movimiento sigue activo?',   opts: ['Sí', 'No'] },
      { q: '¿Estás bajo techo sólido?',      opts: ['Sí', 'No'] },
    ],
    verdict: { level: 'PROTEGERSE', body: 'Continúa en posición fetal hasta que cese el movimiento.' },
  },
  {
    id: 'fractura',
    title: 'Fractura de brazo',
    category: 'medicas',
    priority: 'Media',
    severity: 'normal',
    blurb: 'Inmoviliza la extremidad sin recolocar el hueso. Aplica frío indirecto.',
    description:
      'Una fractura puede ser cerrada o expuesta. En ambos casos lo prioritario es inmovilizar la zona y evitar movimientos que agraven la lesión antes del traslado.',
    photo: 'photo-fractura',
    keywords: ['fractura', 'hueso', 'brazo', 'roto'],
    doNow: [
      'Inmoviliza con férula improvisada',
      'No recoloques el hueso',
      'Aplica frío envuelto 15 min',
    ],
    indicators: [
      { icon: 'AlertCircle', text: 'Hueso visible o atravesando la piel.' },
      { icon: 'Hand',        text: 'No puede mover los dedos.' },
      { icon: 'Activity',    text: 'Hormigueo o pérdida de sensibilidad.' },
    ],
    softTips: {
      heading: 'Cómo mejorar la situación (si no es grave)',
      kicker: 'FÉRULA EN CASA',
      body: 'Usa revista enrollada o cartón rígido como soporte. Asegura con tela, no con cinta directa a la piel.',
      icon: 'Bandage',
    },
    suggestions: [
      { id: 'corte',     label: 'Herida abierta' },
      { id: 'quemadura', label: 'Esguince de muñeca' },
    ],
    triage: [
      { q: '¿Hay hueso expuesto o sangrado abundante?', opts: ['No', 'Sí'] },
      { q: '¿La persona puede mover los dedos?', opts: ['Sí', 'Con dolor', 'No'] },
    ],
    verdict: { level: 'TRASLADO', body: 'Acude a urgencias en las próximas 2 horas.' },
  },
  {
    id: 'quemadura',
    title: 'Quemadura de 2° grado',
    category: 'medicas',
    priority: 'Media',
    severity: 'normal',
    blurb: 'Enjuaga con agua corriente 10–20 minutos. No revientes las ampollas.',
    description:
      'Las quemaduras de segundo grado afectan epidermis y dermis. La hidratación local con agua reduce profundidad y previene infecciones.',
    photo: 'photo-quemadura',
    keywords: ['quemadura', 'ampolla', 'fuego', 'piel'],
    doNow: [
      'Aleja a la persona del calor',
      'Enjuaga con agua corriente 10–20 min',
      'Cubre con apósito limpio',
    ],
    indicators: [
      { icon: 'AlertOctagon', text: 'Cubre más del 10% del cuerpo.' },
      { icon: 'Eye',          text: 'Afecta cara, manos o genitales.' },
      { icon: 'Snowflake',    text: 'La persona tirita o entra en shock.' },
    ],
    softTips: {
      heading: 'Cuidado posterior',
      kicker: 'HIDRATACIÓN',
      body: 'Mantén apósito limpio y seco. Cambia cada 24h. No apliques pomadas caseras.',
      icon: 'Sparkles',
    },
    suggestions: [
      { id: 'corte',     label: 'Corte profundo' },
      { id: 'incendio',  label: 'Incendio en casa' },
    ],
    triage: [
      { q: '¿La quemadura cubre más del 10% del cuerpo?', opts: ['Sí', 'No'] },
      { q: '¿Afecta cara, manos o genitales?', opts: ['Sí', 'No'] },
    ],
    verdict: { level: 'EVALUACIÓN', body: 'Acude al servicio médico para revisar profundidad.' },
  },
  {
    id: 'corte',
    title: 'Corte profundo',
    category: 'medicas',
    priority: 'Media',
    severity: 'normal',
    blurb: 'Presión directa con apósito limpio. Eleva la extremidad sobre el corazón.',
    description:
      'Las heridas profundas que exponen tejido requieren sutura o adhesivos en menos de 6 horas para reducir riesgo de cicatriz e infección.',
    photo: 'photo-corte',
    keywords: ['corte', 'herida', 'sangrado', 'cuchillo'],
    doNow: [
      'Lava tus manos antes de tocar',
      'Aplica presión directa con tela',
      'Eleva la extremidad',
    ],
    indicators: [
      { icon: 'Droplets',    text: 'El sangrado no se detiene tras 10 min.' },
      { icon: 'AlertCircle', text: 'Se ve hueso, tendón o grasa.' },
      { icon: 'Activity',    text: 'Pulso débil o piel fría.' },
    ],
    softTips: {
      heading: 'Cómo mejorar la situación (si no es grave)',
      kicker: 'LIMPIEZA',
      body: 'Enjuaga con suero o agua hervida fría. No uses alcohol directo en la herida.',
      icon: 'Droplet',
    },
    suggestions: [
      { id: 'fractura',  label: 'Lesión de tendón' },
      { id: 'quemadura', label: 'Astilla profunda' },
    ],
    triage: [
      { q: '¿El sangrado se detiene con presión?', opts: ['Sí', 'No'] },
      { q: '¿Se ve hueso, tendón o grasa?', opts: ['No', 'Sí'] },
    ],
    verdict: { level: 'TRASLADO', body: 'Requiere sutura en menos de 6 horas.' },
  },
  {
    id: 'inundacion',
    title: 'Inundación en hogar',
    category: 'hogar',
    priority: 'Media',
    severity: 'normal',
    blurb: 'Corta electricidad y eleva pertenencias. Evalúa salir si el agua sube rápido.',
    description:
      'Las inundaciones domésticas combinan riesgo de electrocución y contaminación. La prioridad es cortar el flujo eléctrico antes de tocar superficies mojadas.',
    photo: 'photo-inundacion',
    keywords: ['inundacion', 'agua', 'fuga', 'tormenta'],
    doNow: [
      'Corta la electricidad desde la caja',
      'Eleva objetos a más de 50 cm',
      'Cierra la llave de paso general',
    ],
    indicators: [
      { icon: 'Zap',         text: 'Hay aparatos encendidos sumergidos.' },
      { icon: 'TrendingUp',  text: 'El nivel sube más de 10 cm cada 10 min.' },
      { icon: 'Cloud',       text: 'Lluvia sigue activa sin pronóstico de cese.' },
    ],
    softTips: {
      heading: 'Drenaje y secado',
      kicker: 'PREVENCIÓN MOHO',
      body: 'Ventila 48h continuas tras drenar. Desecha alfombras saturadas.',
      icon: 'Wind',
    },
    suggestions: [
      { id: 'incendio',  label: 'Fuga de gas' },
      { id: 'sismo',     label: 'Daño estructural' },
    ],
    triage: [
      { q: '¿Ya cortaste la electricidad?', opts: ['Sí', 'No'] },
      { q: '¿El agua sigue subiendo?',      opts: ['Sí', 'No'] },
    ],
    verdict: { level: 'CONTENER', body: 'Cierra llave de paso y eleva pertenencias.' },
  },
  {
    id: 'robo',
    title: 'Robo en proceso',
    category: 'seguridad',
    priority: 'Alta',
    severity: 'critical',
    blurb: 'No confrontes. Aléjate, observa rasgos y llama al 911 desde lugar seguro.',
    description:
      'En un robo activo, la confrontación es la causa principal de lesiones graves. Tu prioridad es la integridad física, no los bienes materiales.',
    photo: 'photo-robo',
    keywords: ['robo', 'asalto', 'intruso', 'ladron'],
    doNow: [
      'No te enfrentes ni grites',
      'Aléjate a un lugar seguro',
      'Llama al 911 en silencio',
    ],
    indicators: [
      { icon: 'AlertTriangle', text: 'El agresor está armado.' },
      { icon: 'Users',         text: 'Hay menores o adultos mayores en casa.' },
      { icon: 'DoorClosed',    text: 'No tienes salida segura inmediata.' },
    ],
    softTips: {
      heading: 'Después del incidente',
      kicker: 'EVIDENCIA',
      body: 'No toques superficies ni reacomodes. Fotografía la escena al llegar la policía.',
      icon: 'Camera',
    },
    suggestions: [
      { id: 'corte',     label: 'Lesión por defensa' },
      { id: 'desmayo',   label: 'Shock post-evento' },
    ],
    triage: [
      { q: '¿Estás en un lugar seguro ahora?',  opts: ['Sí', 'No'] },
      { q: '¿Puedes hablar en voz alta?',       opts: ['Sí', 'No'] },
    ],
    verdict: { level: 'LLAMAR 911', body: 'Reporta ubicación y permanece en sitio seguro.' },
  },
  {
    id: 'llanta',
    title: 'Cambio de llanta',
    category: 'misc',
    priority: 'Baja',
    severity: 'normal',
    blurb: 'Procedimiento seguro en orilla. Estaciona en plano y activa intermitentes.',
    description:
      'El cambio de neumático debe realizarse fuera del flujo vehicular, a más de 10 m del acotamiento. Verifica la presión de la refacción antes de iniciar.',
    photo: 'photo-llanta',
    keywords: ['llanta', 'neumatico', 'rueda', 'pinchazo'],
    doNow: [
      'Estaciona en superficie plana',
      'Activa intermitentes y freno',
      'Afloja birlos antes de elevar',
    ],
    indicators: [
      { icon: 'Cloud',     text: 'Lluvia intensa o poca visibilidad.' },
      { icon: 'Car',       text: 'Tráfico pesado a menos de 1 m.' },
      { icon: 'AlertCircle', text: 'No tienes refacción inflada o herramientas.' },
    ],
    softTips: {
      heading: 'Después del cambio',
      kicker: 'REAJUSTE',
      body: 'Reaprieta los birlos en cruz tras recorrer 50 km. La refacción es temporal: cámbiala en taller.',
      icon: 'Wrench',
    },
    suggestions: [
      { id: 'corte',  label: 'Lesión con herramienta' },
      { id: 'robo',   label: 'Asistencia en carretera' },
    ],
    triage: [
      { q: '¿Estás en superficie plana y segura?',  opts: ['Sí', 'No', 'Parcialmente'] },
      { q: '¿Tienes gato y llave de cruz?',          opts: ['Sí', 'No'] },
    ],
    verdict: { level: 'PROCEDE', body: 'Condiciones verificadas. Sigue los pasos del protocolo.' },
  },
];

/* ---------- Search ---------- */
function searchProtocols(q) {
  const term = q.trim().toLowerCase();
  if (!term) return [];

  // Synonyms / loose matching to surface more probable results
  const SYN = {
    fuego: ['incendio', 'quemadura'],
    humo: ['incendio'],
    flama: ['incendio', 'quemadura'],
    gas: ['incendio', 'inundacion'],
    agua: ['inundacion'],
    lluvia: ['inundacion'],
    fuga: ['inundacion', 'incendio'],
    temblor: ['sismo'],
    terremoto: ['sismo'],
    sacudida: ['sismo'],
    sangr: ['corte', 'fractura'],
    sangre: ['corte', 'fractura'],
    herida: ['corte', 'quemadura', 'fractura'],
    cuchillo: ['corte'],
    golpe: ['fractura', 'desmayo'],
    caida: ['fractura', 'desmayo'],
    hueso: ['fractura'],
    quema: ['quemadura'],
    ampolla: ['quemadura'],
    asalto: ['robo'],
    ladron: ['robo'],
    intruso: ['robo'],
    arma: ['robo'],
    auto: ['llanta'],
    coche: ['llanta'],
    rueda: ['llanta'],
    ponchadura: ['llanta'],
    inconsciente: ['desmayo'],
    paro: ['desmayo'],
    desplomo: ['desmayo'],
    mareo: ['desmayo'],
    no_respira: ['desmayo'],
  };

  const scored = PROTOCOLS.map(p => {
    let score = 0;
    const hay = (p.title + ' ' + p.blurb + ' ' + p.description).toLowerCase();
    if (p.title.toLowerCase().includes(term)) score += 10;
    if (hay.includes(term))                   score += 4;
    for (const k of p.keywords) {
      if (k === term)            score += 8;
      else if (k.includes(term)) score += 5;
      else if (term.includes(k)) score += 4;
    }
    // Synonym boosts
    for (const syn in SYN) {
      if (term.includes(syn) && SYN[syn].includes(p.id)) score += 6;
    }
    // Token-level matches (search "fuego en casa" → hit fuego)
    for (const tok of term.split(/\s+/)) {
      if (tok.length < 3) continue;
      if (p.keywords.some(k => k.includes(tok) || tok.includes(k))) score += 2;
      if (hay.includes(tok)) score += 1;
      for (const syn in SYN) {
        if (tok.includes(syn) && SYN[syn].includes(p.id)) score += 3;
      }
    }
    return { p, score };
  });

  const direct = scored.filter(x => x.score > 0).sort((a, b) => b.score - a.score).map(x => x.p);
  if (direct.length === 0) return [];

  // Pad with same-category and high-priority items so the results page
  // feels rich even for narrow queries.
  const top = direct[0];
  const haveIds = new Set(direct.map(p => p.id));
  const sameCat = PROTOCOLS.filter(p => p.category === top.category && !haveIds.has(p.id));
  const others  = PROTOCOLS
    .filter(p => !haveIds.has(p.id) && p.category !== top.category)
    .sort((a, b) => (a.priority === 'Alta' ? -1 : 1) - (b.priority === 'Alta' ? -1 : 1));

  const padded = [...direct, ...sameCat, ...others];
  // Cap to a reasonable number
  return padded.slice(0, 9);
}

/* ---------- App ---------- */
function App() {
  const [view, setView] = useState('home');          // 'home' | 'results' | 'categories' | 'category' | 'detail'
  const [stack, setStack] = useState([]);            // navigation history
  const [query, setQuery] = useState('');
  const [activeCat, setActiveCat] = useState(null);
  const [activeProto, setActiveProto] = useState(null);
  const [triageIdx, setTriageIdx] = useState(0);
  const [triagePicks, setTriagePicks] = useState([]);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [plusOpen, setPlusOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState([]); // recent protocol ids

  const proto = useMemo(() => PROTOCOLS.find(p => p.id === activeProto) || null, [activeProto]);
  const alert = proto && proto.severity === 'critical' && view === 'detail';

  function go(next) { setStack(s => [...s, view]); setView(next); }
  function back() {
    if (stack.length === 0) { setView('home'); return; }
    const prev = stack[stack.length - 1];
    setStack(s => s.slice(0, -1));
    setView(prev);
  }
  function home() { setStack([]); setView('home'); setQuery(''); setActiveCat(null); setActiveProto(null); }

  function doSearch(q) {
    const term = (q ?? query).trim();
    if (!term) return;
    setQuery(term);
    setStack(s => [...s, view]);
    setView('results');
  }
  function openProto(id) {
    setActiveProto(id);
    setHistory(prev => [id, ...prev.filter(h => h !== id)].slice(0, 5));
    setTriageIdx(0);
    setTriagePicks([]);
    setStack(s => [...s, view]);
    setView('detail');
  }
  function openCategory(id) {
    setActiveCat(id);
    setStack(s => [...s, view]);
    setView('category');
  }

  function pickTriage(opt) {
    setTriagePicks(prev => [...prev, opt]);
    setTriageIdx(i => i + 1);
  }
  function resetTriage() { setTriageIdx(0); setTriagePicks([]); }

  return (
    <div className="relative w-full h-full flex items-center justify-center p-3 md:p-8">
      {/* Outer ambient labels */}
      <div className="absolute top-5 left-6 hidden md:flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-mono text-zinc-500">
        <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-blip"></span>
        sos360 · sistema de precisión crítica
      </div>
      <div className="absolute top-5 right-6 hidden md:flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-mono text-zinc-500">
        <span>v0.9.4</span>
        <span className="w-1 h-1 rounded-full bg-zinc-400" />
        <span className="tabular">47%</span>
      </div>

      {/* Device shell */}
      <div className={`device-shell relative w-full max-w-[420px] h-[860px] max-h-[94vh] rounded-[42px] overflow-hidden flex flex-col ${alert ? 'alert' : ''}`}>
        {/* Alert pulsing ring */}
        {alert && <div className="pointer-events-none absolute inset-0 rounded-[42px] animate-pulse-ring z-30" />}

        {/* Top header — always present, one button on each side */}
        <Header
          view={view}
          alert={alert}
          onBack={back}
          onHome={home}
          historyOpen={historyOpen}
          onToggleHistory={() => { setHistoryOpen(o => !o); setSettingsOpen(false); }}
          onCloseHistory={() => setHistoryOpen(false)}
          history={history}
          onOpenProto={(id) => { setHistoryOpen(false); openProto(id); }}
          settingsOpen={settingsOpen}
          onToggleSettings={() => { setSettingsOpen(o => !o); setHistoryOpen(false); }}
          onCloseSettings={() => setSettingsOpen(false)}
        />

        {/* Main scroll area */}
        <div className="relative flex-1 overflow-hidden">
          {view === 'home' && (
            <HomeView
              onSearch={doSearch}
              onCategories={() => go('categories')}
              plusOpen={plusOpen}
              onTogglePlus={() => setPlusOpen(o => !o)}
              onClosePlus={() => setPlusOpen(false)}
              onTakePhoto={() => { setPlusOpen(false); setCameraOpen(true); }}
            />
          )}
          {view === 'results' && (
            <ResultsView query={query} onOpen={openProto} onSearch={doSearch} />
          )}
          {view === 'categories' && (
            <CategoriesView onOpen={openCategory} />
          )}
          {view === 'category' && (
            <CategoryView category={CATEGORIES.find(c => c.id === activeCat)} onOpen={openProto} />
          )}
          {view === 'detail' && proto && (
            <DetailView
              proto={proto}
              triageIdx={triageIdx}
              triagePicks={triagePicks}
              onPick={pickTriage}
              onReset={resetTriage}
              onOpen={openProto}
            />
          )}
        </div>

        {/* Corner glyph (subtle brand watermark) */}
        <div className="corner-glyph z-10">sos · {view}</div>
      </div>

      {/* Camera modal */}
      {cameraOpen && <CameraModal onClose={() => setCameraOpen(false)} />}
    </div>
  );
}

/* ---------- Header ---------- */
function Header({ view, alert, onBack, onHome, historyOpen, onToggleHistory, onCloseHistory, history, onOpenProto, settingsOpen, onToggleSettings, onCloseSettings }) {
  const isHome = view === 'home';

  // outside click to close pops
  useEffect(() => {
    function onDown(e) {
      if (!e.target.closest('[data-pop]')) {
        onCloseHistory(); onCloseSettings();
      }
    }
    if (historyOpen || settingsOpen) {
      document.addEventListener('mousedown', onDown);
      return () => document.removeEventListener('mousedown', onDown);
    }
  }, [historyOpen, settingsOpen]);

  return (
    <div className="relative z-20 px-5 pt-5 pb-3 flex items-center justify-between">
      {/* Left: history dropdown on home, ← elsewhere */}
      {isHome ? (
        <div className="relative" data-pop>
          <button
            onClick={onToggleHistory}
            className={`flex items-center justify-center w-9 h-9 rounded-full border transition-colors ${
              historyOpen
                ? 'border-zinc-900 bg-zinc-900 text-white'
                : 'border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700'
            }`}
            aria-label="Historial"
          >
            <Icon name="History" size={15} />
          </button>
          {historyOpen && (
            <div data-pop className="absolute left-0 top-11 w-[280px] rounded-2xl border border-zinc-200 bg-white shadow-xl shadow-black/10 overflow-hidden animate-pop z-30">
              <div className="px-3 py-2 border-b border-zinc-100 flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-zinc-500">historial reciente</span>
                <span className="text-[9px] font-mono text-zinc-400">últimas {Math.min(history.length, 5)}</span>
              </div>
              {history.length === 0 ? (
                <div className="px-3 py-6 text-center">
                  <Icon name="Clock" size={18} className="mx-auto text-zinc-300" />
                  <p className="mt-2 text-[12px] text-zinc-500">Aún no hay búsquedas</p>
                  <p className="mt-0.5 text-[10px] font-mono uppercase tracking-wider text-zinc-400">tus protocolos visitados aparecerán aquí</p>
                </div>
              ) : (
                <ul className="py-1">
                  {history.slice(0, 5).map((id, i) => {
                    const p = PROTOCOLS.find(x => x.id === id);
                    if (!p) return null;
                    const crit = p.severity === 'critical';
                    return (
                      <li key={id}>
                        <button
                          onClick={() => onOpenProto(id)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-50 transition-colors text-left"
                        >
                          <span className="text-[10px] font-mono text-zinc-400 w-4 tabular">{String(i+1).padStart(2,'0')}</span>
                          <span className={`relative w-9 h-9 rounded-lg overflow-hidden ${p.photo} photo-tex flex-shrink-0`} />
                          <span className="flex-1 min-w-0">
                            <span className="block text-[13px] font-medium text-zinc-900 truncate">{p.title}</span>
                            <span className="flex items-center gap-1.5 mt-0.5">
                              <span className={`w-1 h-1 rounded-full ${crit ? 'bg-red-600' : p.priority === 'Media' ? 'bg-amber-500' : 'bg-zinc-400'}`} />
                              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">prioridad {p.priority}</span>
                            </span>
                          </span>
                          <Icon name="ArrowUpRight" size={12} className="text-zinc-400 flex-shrink-0" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={onBack}
          className="flex items-center justify-center w-9 h-9 rounded-full border border-zinc-200 bg-white hover:bg-zinc-50 transition-colors text-zinc-700"
          aria-label="Volver"
        >
          <Icon name="ArrowLeft" size={16} />
        </button>
      )}

      {/* Center: SOS360 wordmark */}
      <button onClick={onHome} className="flex items-center gap-1.5 group">
        <span className={`text-[15px] font-bold tracking-tight ${alert ? 'text-red-700' : 'text-zinc-900'}`}>
          SOS<span className="wordmark-dot bg-clip-text text-transparent">360</span>
        </span>
      </button>

      {/* Right: settings */}
      <div className="relative" data-pop>
        <button
          onClick={onToggleSettings}
          className={`flex items-center justify-center w-9 h-9 rounded-full border transition-colors ${
            settingsOpen
              ? 'border-zinc-900 bg-zinc-900 text-white'
              : 'border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700'
          }`}
          aria-label="Ajustes"
        >
          <Icon name="Settings" size={15} />
        </button>
        {settingsOpen && (
          <div data-pop className="absolute right-0 top-11 w-[240px] rounded-2xl border border-zinc-200 bg-white shadow-xl shadow-black/10 overflow-hidden animate-pop z-30">
            <div className="px-3 py-2 border-b border-zinc-100 flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-zinc-500">ajustes</span>
              <span className="text-[9px] font-mono text-zinc-400">v0.9.4</span>
            </div>
            {[
              { i: 'Globe',     label: 'Idioma',           value: 'Español' },
              { i: 'Bell',      label: 'Alertas',          value: 'Activadas' },
              { i: 'MapPin',    label: 'Ubicación',        value: 'Auto' },
              { i: 'Vibrate',   label: 'Vibración SOS',     value: 'Activada' },
              { i: 'BookOpen',  label: 'Acerca de SOS360', value: '' },
            ].map((it, idx) => (
              <button
                key={it.label}
                onClick={onCloseSettings}
                className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-50 transition-colors text-left ${idx > 0 ? 'border-t border-zinc-100' : ''}`}
              >
                <span className="w-7 h-7 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700">
                  <Icon name={it.i} size={13} />
                </span>
                <span className="flex-1 text-[12.5px] text-zinc-900">{it.label}</span>
                {it.value && <span className="text-[10.5px] font-mono text-zinc-500">{it.value}</span>}
                <Icon name="ChevronRight" size={12} className="text-zinc-400" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Home ---------- */
function HomeView({ onSearch, onCategories, plusOpen, onTogglePlus, onClosePlus, onTakePhoto }) {
  const [val, setVal] = useState('');
  const inputRef = useRef(null);

  // outside click for the in-bar plus dropdown
  useEffect(() => {
    function onDown(e) {
      if (!e.target.closest('[data-pop]')) onClosePlus();
    }
    if (plusOpen) {
      document.addEventListener('mousedown', onDown);
      return () => document.removeEventListener('mousedown', onDown);
    }
  }, [plusOpen]);

  return (
    <div className="h-full flex flex-col items-center justify-center px-6 pt-2 pb-6 page-enter">
      {/* Center hero */}
      <div className="w-full text-center">
        <h1 className="text-[40px] leading-[1.02] font-semibold tracking-tight text-zinc-900 text-balance">
          ¿Cuál es tu<br/>emergencia?
        </h1>

        {/* Search input — premium, with [+] inside */}
        <form
          onSubmit={(e) => { e.preventDefault(); onSearch(val); }}
          className="relative mt-8 flex items-center gap-1.5 h-12 px-1.5 rounded-2xl border border-zinc-200 bg-white shadow-[0_1px_0_rgba(255,255,255,1)_inset,0_8px_24px_-12px_rgba(0,0,0,0.08)] focus-within:border-zinc-400 transition-colors"
        >
          {/* In-bar + button */}
          <div className="relative" data-pop>
            <button
              type="button"
              onClick={onTogglePlus}
              className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-all ${
                plusOpen
                  ? 'border-zinc-900 bg-zinc-900 text-white rotate-45'
                  : 'border-zinc-200 bg-zinc-50 hover:bg-white text-zinc-700'
              }`}
              aria-label="Adjuntar"
            >
              <Icon name="Plus" size={16} strokeWidth={2} />
            </button>
            {plusOpen && (
              <div data-pop className="absolute left-0 bottom-12 w-[230px] rounded-2xl border border-zinc-200 bg-white shadow-xl shadow-black/15 overflow-hidden animate-pop z-30 text-left">
                <div className="px-3 py-2 border-b border-zinc-100">
                  <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-zinc-500">adjuntar evidencia</span>
                </div>
                <button
                  type="button"
                  onClick={onTakePhoto}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-50 transition-colors"
                >
                  <span className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700">
                    <Icon name="Camera" size={14} />
                  </span>
                  <span className="flex-1">
                    <span className="block text-[13px] font-medium text-zinc-900">Tomar foto</span>
                    <span className="block text-[10.5px] text-zinc-500">usar cámara ahora</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={onClosePlus}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-50 transition-colors border-t border-zinc-100"
                >
                  <span className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700">
                    <Icon name="ImagePlus" size={14} />
                  </span>
                  <span className="flex-1">
                    <span className="block text-[13px] font-medium text-zinc-900">Subir foto</span>
                    <span className="block text-[10.5px] text-zinc-500">desde galería</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={onClosePlus}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-50 transition-colors border-t border-zinc-100"
                >
                  <span className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700">
                    <Icon name="FileText" size={14} />
                  </span>
                  <span className="flex-1">
                    <span className="block text-[13px] font-medium text-zinc-900">Subir documento</span>
                    <span className="block text-[10.5px] text-zinc-500">pdf, txt, json</span>
                  </span>
                </button>
              </div>
            )}
          </div>

          <input
            ref={inputRef}
            type="text"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            placeholder="Describe la situación…"
            className="flex-1 bg-transparent outline-none text-[14px] text-zinc-900 placeholder:text-zinc-400 pl-1"
          />
          <button
            type="button"
            className="flex items-center justify-center w-8 h-8 rounded-xl text-zinc-500 hover:bg-zinc-50 transition-colors"
            aria-label="Dictar"
          >
            <Icon name="Mic" size={15} />
          </button>
          <button
            type="submit"
            disabled={!val.trim()}
            className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all ${
              val.trim() ? 'bg-zinc-900 text-white hover:bg-zinc-800' : 'bg-zinc-100 text-zinc-400'
            }`}
            aria-label="Buscar"
          >
            <Icon name="ArrowUp" size={15} strokeWidth={2.25} />
          </button>
        </form>

        {/* Categories pill */}
        <button
          onClick={onCategories}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-zinc-200 bg-zinc-50 hover:bg-white hover:border-zinc-300 transition-colors group"
        >
          <Icon name="LayoutGrid" size={13} className="text-zinc-500" />
          <span className="text-[12.5px] font-medium text-zinc-700">Buscar por categorías</span>
          <Icon name="ArrowRight" size={13} className="text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}

/* ---------- Results ---------- */
function ResultsView({ query, onOpen, onSearch }) {
  const [val, setVal] = useState('');
  const matches = useMemo(() => searchProtocols(query), [query]);
  const hero = matches[0];
  const rest = matches.slice(1, 9);

  if (!hero) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-6 text-center page-enter">
        <Icon name="SearchX" size={28} className="text-zinc-400" />
        <p className="mt-3 text-[14px] text-zinc-700">Sin resultados para "{query}"</p>
        <p className="mt-1 text-[11px] font-mono uppercase tracking-wider text-zinc-400">prueba con otra palabra</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto scroll-pane px-5 pt-1 pb-6 page-enter">
      <div className="mb-1 mt-1">
        <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-zinc-500">resultados de búsqueda</p>
      </div>
      <h2 className="mt-1 text-[22px] font-semibold tracking-tight text-zinc-900 leading-tight">
        Resultados para: <span className="text-zinc-500">{query}</span>
      </h2>

      {/* Hero result */}
      <button
        onClick={() => onOpen(hero.id)}
        className="mt-4 block w-full text-left rounded-2xl overflow-hidden border border-zinc-200 bg-white card-lift relative"
      >
        <div className={`relative h-[200px] ${hero.photo} photo-tex`}>
          {/* Top badge */}
          <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-600 text-white shadow-lg shadow-red-600/30">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-blip" />
            <span className="text-[9px] font-mono uppercase tracking-[0.22em] font-semibold">prioridad: {hero.priority}</span>
          </div>
          {/* Corner badge */}
          <div className="absolute top-3 right-3 w-7 h-7 rounded-md bg-white/95 backdrop-blur flex items-center justify-center shadow-md text-zinc-900">
            <Icon name="ShieldAlert" size={14} />
          </div>
          {/* Title overlay */}
          <div className="absolute left-0 right-0 bottom-0 p-3.5 bg-gradient-to-t from-black/70 to-transparent text-white">
            <h3 className="text-[18px] font-semibold tracking-tight leading-tight">{hero.title}</h3>
            <p className="mt-1 text-[12px] text-white/85 line-clamp-2 leading-snug">{hero.blurb}</p>
          </div>
        </div>
      </button>

      {/* Related grid */}
      {rest.length > 0 && (
        <>
          <div className="mt-5 mb-2 flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.28em] text-zinc-500">también relevantes</span>
            <span className="flex-1 h-px bg-zinc-200" />
            <span className="text-[10px] font-mono text-zinc-400 tabular">{rest.length}</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {rest.map(p => (
              <button
                key={p.id}
                onClick={() => onOpen(p.id)}
                className="text-left rounded-xl overflow-hidden border border-zinc-200 bg-white card-lift"
              >
                <div className={`relative h-[80px] ${p.photo} photo-tex flex items-end p-2`}>
                  <span className={`text-[8px] font-mono uppercase tracking-[0.18em] px-1.5 py-0.5 rounded ${
                    p.priority === 'Alta' ? 'bg-red-600 text-white'
                    : p.priority === 'Media' ? 'bg-amber-500 text-white'
                    : 'bg-zinc-800 text-white'
                  }`}>
                    {p.priority}
                  </span>
                </div>
                <div className="p-2.5">
                  <p className="text-[12px] font-medium text-zinc-900 leading-snug truncate">{p.title}</p>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mt-0.5">
                    prioridad: <span className="text-zinc-700">{p.priority}</span>
                  </p>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Inline search */}
      <form
        onSubmit={(e) => { e.preventDefault(); if (val.trim()) onSearch(val); }}
        className="mt-5 flex items-center gap-2 h-11 px-3 rounded-2xl border border-zinc-200 bg-zinc-50 focus-within:bg-white focus-within:border-zinc-300 transition-colors"
      >
        <Icon name="Search" size={14} className="text-zinc-400" />
        <input
          type="text"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder="¿Buscabas otra cosa?"
          className="flex-1 bg-transparent outline-none text-[13px] text-zinc-800 placeholder:text-zinc-400"
        />
        {val && (
          <button type="submit" className="text-[10px] font-mono uppercase tracking-wider text-zinc-700 hover:text-zinc-900">
            buscar →
          </button>
        )}
      </form>
    </div>
  );
}

/* ---------- Categories ---------- */
function CategoriesView({ onOpen }) {
  return (
    <div className="h-full overflow-y-auto scroll-pane px-5 pt-1 pb-6 page-enter">
      <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-zinc-500">explorar</p>
      <h2 className="mt-1 text-[22px] font-semibold tracking-tight text-zinc-900">
        Categorías de emergencias
      </h2>
      <p className="mt-1.5 text-[12.5px] text-zinc-500 leading-snug">
        Seleccione el tipo de asistencia requerida.
      </p>

      <ul className="mt-4 space-y-2.5">
        {CATEGORIES.map(c => (
          <li key={c.id}>
            <button
              onClick={() => onOpen(c.id)}
              className="w-full flex items-center gap-3 p-2.5 rounded-2xl border border-zinc-200 bg-white card-lift text-left"
            >
              <div className={`relative w-16 h-16 rounded-xl overflow-hidden ${c.photo} photo-tex flex-shrink-0`}>
                <div className="absolute inset-0 flex items-center justify-center text-white/80">
                  <Icon name={c.icon} size={20} strokeWidth={1.5} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-zinc-900 tracking-tight">{c.name}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    c.priority === 'Alta' ? 'bg-red-600' : c.priority === 'Media' ? 'bg-amber-500' : 'bg-zinc-400'
                  }`} />
                  <span className="text-[10.5px] font-mono uppercase tracking-wider text-zinc-500">
                    Prioridad {c.priority}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-zinc-500 truncate">{c.subtitle}</p>
              </div>
              <Icon name="ChevronRight" size={16} className="text-zinc-400 flex-shrink-0" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- Single category list ---------- */
function CategoryView({ category, onOpen }) {
  if (!category) return null;
  const items = PROTOCOLS.filter(p => p.category === category.id);
  return (
    <div className="h-full overflow-y-auto scroll-pane px-5 pt-1 pb-6 page-enter">
      <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-zinc-500">categoría</p>
      <h2 className="mt-1 text-[22px] font-semibold tracking-tight text-zinc-900">{category.name}</h2>
      <p className="mt-1.5 text-[12.5px] text-zinc-500 leading-snug">{category.subtitle}</p>

      <div className="mt-4 space-y-2.5">
        {items.map(p => (
          <button
            key={p.id}
            onClick={() => onOpen(p.id)}
            className="w-full flex items-center gap-3 p-2.5 rounded-2xl border border-zinc-200 bg-white card-lift text-left"
          >
            <div className={`relative w-14 h-14 rounded-xl overflow-hidden ${p.photo} photo-tex flex-shrink-0`} />
            <div className="flex-1 min-w-0">
              <p className="text-[13.5px] font-medium text-zinc-900 tracking-tight truncate">{p.title}</p>
              <p className="text-[11px] text-zinc-500 truncate leading-snug mt-0.5">{p.blurb}</p>
            </div>
            <span className={`text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded ${
              p.priority === 'Alta' ? 'bg-red-50 text-red-700 border border-red-200'
              : p.priority === 'Media' ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
            }`}>{p.priority}</span>
          </button>
        ))}
        {items.length === 0 && (
          <p className="text-[12px] text-zinc-500 font-mono">Sin protocolos en esta categoría.</p>
        )}
      </div>
    </div>
  );
}

/* ---------- Detail ---------- */
function DetailView({ proto, triageIdx, triagePicks, onPick, onReset, onOpen }) {
  const critical = proto.severity === 'critical';
  return (
    <div className="h-full overflow-y-auto scroll-pane px-5 pt-1 pb-6 page-enter">
      {/* Severity row */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border ${
          critical ? 'bg-red-50 border-red-200 text-red-700' : 'bg-zinc-50 border-zinc-200 text-zinc-700'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${critical ? 'bg-red-600 animate-blip' : 'bg-emerald-500'}`} />
          <span className="text-[10px] font-mono uppercase tracking-[0.2em]">
            Severidad: <span className="font-semibold">{critical ? 'Crítica' : 'Moderada'}</span>
          </span>
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-zinc-200 bg-white text-zinc-600">
          <Icon name="Clock" size={11} />
          <span className="text-[10px] font-mono uppercase tracking-wider">{critical ? 'inmediato' : '< 30 min'}</span>
        </span>
      </div>

      {/* Title */}
      <h2 className="mt-3 text-[26px] font-semibold tracking-tight text-zinc-900 leading-tight">
        {proto.title}
      </h2>
      <p className="mt-1.5 text-[13px] text-zinc-500 leading-relaxed text-balance">
        {proto.blurb}
      </p>

      {/* Cosas que tienes que hacer YA — red block (if critical) */}
      {critical ? (
        <DoNowBlock proto={proto} />
      ) : (
        <StepsBlock proto={proto} />
      )}

      {/* Indicators */}
      <Section
        heading="Indicadores de que la situación es grave"
        kicker="alerta"
        kickerTone={critical ? 'red' : 'amber'}
      >
        <ul className="space-y-2">
          {proto.indicators.map((it, i) => (
            <li key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl border border-zinc-200 bg-zinc-50/60">
              <span className="flex items-center justify-center w-7 h-7 rounded-md bg-white border border-zinc-200 text-zinc-700 flex-shrink-0">
                <Icon name={it.icon} size={13} />
              </span>
              <span className="text-[12.5px] leading-snug text-zinc-800 pt-1">{it.text}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* Soft tips */}
      <Section heading={proto.softTips.heading} kicker={proto.softTips.kicker} kickerTone="zinc">
        <div className="flex items-start gap-3 p-3 rounded-xl border border-zinc-200 bg-white">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center text-zinc-600 flex-shrink-0">
            <Icon name={proto.softTips.icon} size={20} strokeWidth={1.6} />
          </div>
          <p className="text-[12.5px] text-zinc-700 leading-relaxed pt-0.5">{proto.softTips.body}</p>
        </div>
      </Section>

      {/* Triage */}
      <TriagePanel
        proto={proto}
        triageIdx={triageIdx}
        triagePicks={triagePicks}
        onPick={onPick}
        onReset={onReset}
      />

      {/* AI Suggestions */}
      <Section heading="Sugerencias IA" kicker="relacionadas" kickerTone="red">
        <div className="space-y-1.5">
          {proto.suggestions.map((s, i) => {
            const target = PROTOCOLS.find(p => p.id === s.id);
            return (
              <button
                key={i}
                onClick={() => target && onOpen(target.id)}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border border-red-200 bg-red-50/60 text-left hover:bg-red-50 hover:border-red-300 transition-colors group"
              >
                <Icon name="Sparkles" size={12} className="text-red-500 flex-shrink-0" />
                <span className="flex-1 text-[12.5px] text-red-800 font-medium">{s.label}</span>
                <Icon name="ArrowUpRight" size={12} className="text-red-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            );
          })}
        </div>
      </Section>

      {/* Footer meta */}
      <div className="mt-5 flex items-center justify-between text-[9px] font-mono uppercase tracking-[0.22em] text-zinc-400">
        <span>fuente: sos360 · cruz roja mx</span>
        <span>actualizado 06-may</span>
      </div>
    </div>
  );
}

function Section({ heading, kicker, kickerTone = 'zinc', children }) {
  const toneClass = kickerTone === 'red'
    ? 'bg-red-50 text-red-700 border-red-200'
    : kickerTone === 'amber'
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : 'bg-zinc-100 text-zinc-700 border-zinc-200';
  return (
    <div className="mt-5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[14.5px] font-semibold text-zinc-900 tracking-tight leading-snug pr-3">
          {heading}
        </h3>
        {kicker && (
          <span className={`text-[9px] font-mono uppercase tracking-[0.22em] px-1.5 py-0.5 rounded border ${toneClass}`}>
            {kicker}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function DoNowBlock({ proto }) {
  return (
    <div className="mt-4 rounded-2xl bg-red-600 text-white p-4 relative overflow-hidden shimmer shadow-lg shadow-red-600/20">
      {/* corner glyphs */}
      <div className="absolute top-2 right-2 text-[9px] font-mono uppercase tracking-[0.22em] text-white/60">priori · YA</div>
      <div className="flex items-center gap-2">
        <span className="flex items-center justify-center w-7 h-7 rounded-md bg-white/15 border border-white/20">
          <Icon name="AlertTriangle" size={14} />
        </span>
        <h3 className="text-[15px] font-bold tracking-tight">Cosas que tienes que hacer YA</h3>
      </div>
      <ol className="mt-3 space-y-1.5">
        {proto.doNow.map((s, i) => (
          <li key={i} className="step-row flex items-start gap-2.5 p-2.5 rounded-lg border border-white/15">
            <span className="flex items-center justify-center w-6 h-6 rounded font-mono text-[10px] tabular bg-white/15 border border-white/20 flex-shrink-0 mt-0.5">
              {String(i+1).padStart(2,'0')}
            </span>
            <span className="text-[13px] leading-snug font-medium pt-0.5">{s}</span>
          </li>
        ))}
      </ol>
      <button className="mt-3 w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-white text-red-700 font-semibold text-[13.5px] tracking-tight hover:bg-red-50 transition-colors">
        <Icon name="PhoneCall" size={14} strokeWidth={2.25} />
        Llamar al 911
      </button>
    </div>
  );
}

function StepsBlock({ proto }) {
  return (
    <div className="mt-4 rounded-2xl bg-white border border-zinc-200 p-3.5">
      <div className="flex items-center gap-2 mb-2">
        <span className="flex items-center justify-center w-7 h-7 rounded-md bg-zinc-100 border border-zinc-200 text-zinc-700">
          <Icon name="ListChecks" size={14} />
        </span>
        <h3 className="text-[14px] font-semibold text-zinc-900 tracking-tight">Pasos a seguir</h3>
        <span className="ml-auto text-[10px] font-mono uppercase tracking-wider text-zinc-500">{proto.doNow.length} acciones</span>
      </div>
      <ol className="space-y-1.5">
        {proto.doNow.map((s, i) => (
          <li key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg border border-zinc-200 bg-zinc-50/60">
            <span className="flex items-center justify-center w-6 h-6 rounded font-mono text-[10px] tabular bg-white border border-zinc-200 text-zinc-700 flex-shrink-0">
              {String(i+1).padStart(2,'0')}
            </span>
            <span className="text-[13px] leading-snug text-zinc-800 pt-0.5">{s}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ---------- Triage ---------- */
function TriagePanel({ proto, triageIdx, triagePicks, onPick, onReset }) {
  const total = proto.triage.length;
  const done = triageIdx >= total;
  const current = proto.triage[triageIdx];
  const critical = proto.severity === 'critical';
  return (
    <div className="mt-5 rounded-2xl border border-zinc-200 bg-white overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-zinc-200">
        <span className={`flex items-center justify-center w-6 h-6 rounded-md ${critical ? 'bg-red-50 text-red-700' : 'bg-zinc-100 text-zinc-700'}`}>
          <Icon name="Sparkles" size={12} />
        </span>
        <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-zinc-800">
          Diagnóstico asistido
        </span>
        <span className="ml-auto text-[10px] font-mono uppercase tracking-wider text-zinc-500 tabular">
          {Math.min(triageIdx + (done ? 0 : 1), total)}/{total}
        </span>
      </div>

      {/* progress */}
      <div className="h-px bg-zinc-100 relative">
        <div
          className={`absolute inset-y-0 left-0 ${critical ? 'bg-red-600' : 'bg-zinc-900'}`}
          style={{ width: `${(triagePicks.length / total) * 100}%`, transition: 'width .4s ease' }}
        />
      </div>

      <div className="p-3">
        {!done ? (
          <div className="animate-pop">
            <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-zinc-500">
              Pregunta {triageIdx + 1}
            </p>
            <p className="mt-1.5 text-[14.5px] leading-snug text-zinc-900 tracking-tight">
              {current.q}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {current.opts.map(opt => (
                <button
                  key={opt}
                  onClick={() => onPick(opt)}
                  className={`flex-1 min-w-[88px] px-3 py-2.5 rounded-xl border text-[13px] font-medium tracking-tight transition-all hover:-translate-y-px ${
                    critical
                      ? 'border-red-200 bg-red-50/50 text-red-800 hover:bg-red-50 hover:border-red-300'
                      : 'border-zinc-200 bg-zinc-50 text-zinc-800 hover:bg-white hover:border-zinc-300'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            {triagePicks.length > 0 && (
              <div className="mt-3 pt-3 border-t border-zinc-100 flex flex-col gap-1">
                {triagePicks.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px]">
                    <Icon name="Check" size={11} className={critical ? 'text-red-600' : 'text-emerald-500'} />
                    <span className="text-zinc-400 font-mono">P{i+1}</span>
                    <span className="text-zinc-700 truncate">{p}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <Verdict proto={proto} onReset={onReset} />
        )}
      </div>
    </div>
  );
}

function Verdict({ proto, onReset }) {
  const critical = proto.severity === 'critical';
  return (
    <div className="animate-pop">
      <div className="flex items-center gap-2">
        <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-[0.22em] ${
          critical ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
        }`}>
          {proto.verdict.level}
        </span>
        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">veredicto final</span>
      </div>
      <p className="mt-2 text-[13px] text-zinc-700 leading-snug">{proto.verdict.body}</p>
      <button className={`mt-3 w-full flex items-center justify-center gap-2 h-12 rounded-xl font-semibold text-[14px] tracking-tight transition-all ${
        critical
          ? 'bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-600/25'
          : 'bg-zinc-900 text-white hover:bg-zinc-800'
      }`}>
        <Icon name={critical ? 'PhoneCall' : 'Check'} size={16} strokeWidth={2.25} />
        {critical ? 'Llamar a Emergencias' : 'Marcar como resuelto'}
      </button>
      <button onClick={onReset} className="mt-2 w-full text-[10px] font-mono uppercase tracking-[0.22em] text-zinc-400 hover:text-zinc-700 py-2 transition-colors">
        ↻ reiniciar diagnóstico
      </button>
    </div>
  );
}

/* ---------- Camera modal ---------- */
function CameraModal({ onClose }) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-6 bg-zinc-900/40 backdrop-blur-sm animate-fade">
      <div className="w-full max-w-[400px] rounded-3xl overflow-hidden border border-zinc-200 bg-white shadow-2xl animate-pop">
        <div className="relative aspect-[3/4] bg-gradient-to-b from-zinc-900 to-zinc-700 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-6 border border-white/15 rounded-2xl" />
          {['tl','tr','bl','br'].map(c => (
            <span key={c} className={`absolute w-6 h-6 border-white/70 ${
              c==='tl'?'top-6 left-6 border-l-2 border-t-2 rounded-tl-lg':
              c==='tr'?'top-6 right-6 border-r-2 border-t-2 rounded-tr-lg':
              c==='bl'?'bottom-6 left-6 border-l-2 border-b-2 rounded-bl-lg':
              'bottom-6 right-6 border-r-2 border-b-2 rounded-br-lg'
            }`} />
          ))}
          <div className="text-center">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-3">
              <Icon name="ScanLine" size={26} className="text-white/80" />
            </div>
            <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-white/70">
              encuadra · analiza · sugiere
            </p>
          </div>
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur border border-white/20">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-blip"></span>
            <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/90">en vivo</span>
          </div>
        </div>
        <div className="p-4 flex items-center justify-between bg-white">
          <button onClick={onClose} className="text-[11px] font-mono uppercase tracking-[0.22em] text-zinc-500 hover:text-zinc-900 transition-colors">
            ← cancelar
          </button>
          <button onClick={onClose} className="w-14 h-14 rounded-full border-[3px] border-zinc-900 bg-white shadow-md hover:scale-95 transition-transform" />
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-zinc-100 text-zinc-700 flex items-center justify-center hover:bg-zinc-200 transition-colors">
            <Icon name="RotateCw" size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- mount ---------- */
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
