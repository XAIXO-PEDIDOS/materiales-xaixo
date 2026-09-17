// Datos reales de la empresa y configuración de páginas.
// Lo usan generate-pages.mjs (HTML final) y cualquier otro script de build.

export const site = {
  name: 'XAIXO Materiales de Construcción',
  legalName: 'Materiales Xaixo Home S.L.',
  cif: 'B10533552',
  domain: 'https://materialesxaixo.com',
  address: {
    street: 'Gran Via del Castell de Bairen, 20',
    locality: 'Gandia',
    region: 'Valencia',
    postalCode: '46701',
    country: 'ES',
  },
  email: 'javierxaixo@gmail.com',
  whatsapp: '689248559', // formato local, sin espacios
  whatsappDisplay: '689 248 559',
  whatsappIntl: '34689248559',
  phone: '615439842', // formato local, sin espacios
  phoneDisplay: '615 439 842',
  phoneTel: '+34615439842',
  schedule: 'Lunes a viernes, 7:00 – 19:00',
  scheduleClosed: 'Sábados cerrado',
  xaixoHomeUrl: 'https://www.xaixohome.com',
};

// Marcas de la cinta de la home. slug → public/img/marcas/<slug>.png,
// generado por scripts/generate-assets.mjs a partir de assets/logos/<slug>.*.
// Si el archivo no existe, generate-pages.mjs muestra "name" como texto.
export const brands = [
  { slug: 'puma', name: 'Grupo Puma' },
  { slug: 'sika', name: 'Sika' },
  { slug: 'chova', name: 'Chova' },
  { slug: 'capa', name: 'Capa' },
  { slug: 'escandella', name: 'La Escandella' },
  { slug: 'elitecementos', name: 'Élite Cementos' },
  { slug: 'laterlite', name: 'Laterlite' },
  { slug: 'tejasborja', name: 'Tejas Borja' },
];

// slug: nombre de archivo final (sin extensión, "index" -> index.html)
// contentFile: fragmento HTML en src/pages/
// nav: si aparece en el menú principal, y con qué etiqueta
export const pages = [
  {
    slug: 'index',
    path: '/',
    contentFile: 'index.html',
    title: 'Materiales de construcción en Gandia | XAIXO',
    description: 'Almacén de materiales de construcción en Gandia: obra y cemento, tabiquería, cubiertas, pavimentos, ferretería y pintura. Entrega a pie de obra en toda la Comunidad Valenciana y a toda España en obras grandes.',
    nav: 'Inicio',
    navOrder: 0,
    showInNav: false,
  },
  {
    slug: 'productos',
    path: '/productos.html',
    contentFile: 'productos.html',
    title: 'Materiales de construcción por familias | XAIXO Gandia',
    description: 'Catálogo de familias de materiales de construcción en Gandia: cemento y obra, tabiquería, cubiertas, pavimentos, ferretería, pinturas, herramienta y protección laboral.',
    nav: 'Productos',
    navOrder: 1,
    showInNav: true,
  },
  {
    slug: 'xaixo-plack',
    path: '/xaixo-plack.html',
    contentFile: 'xaixo-plack.html',
    title: 'Xaixo Plack: placa de yeso y tabiquería en Gandia | XAIXO',
    description: 'Xaixo Plack, la zona especializada de XAIXO en tabiquería en seco, placa de yeso, perfilería y aislamiento, con stock propio y asesoramiento técnico en Gandia.',
    nav: 'Xaixo Plack',
    navOrder: 2,
    showInNav: true,
  },
  {
    slug: 'servicios',
    path: '/servicios.html',
    contentFile: 'servicios.html',
    title: 'Servicios para constructoras y profesionales | XAIXO Gandia',
    description: 'Entrega a pie de obra con camiones propios en toda la Comunidad Valenciana, suministro a toda España en obras grandes, cuenta de cliente y asesoramiento técnico para constructoras y autónomos.',
    nav: 'Servicios',
    navOrder: 3,
    showInNav: true,
  },
  {
    slug: 'almacen',
    path: '/almacen.html',
    contentFile: 'almacen.html',
    title: 'Almacén de materiales de construcción en Gandia | XAIXO',
    description: 'Visita nuestro almacén de materiales de construcción en Gran Via del Castell de Bairen, 20, Gandia. Horario, contacto y cómo llegar.',
    nav: 'Almacén',
    navOrder: 4,
    showInNav: true,
  },
  {
    slug: 'contacto',
    path: '/contacto.html',
    contentFile: 'contacto.html',
    title: 'Contacto | XAIXO Materiales de Construcción Gandia',
    description: 'Pide presupuesto o resuelve tus dudas: WhatsApp, email y dirección del almacén de XAIXO en Gandia. Te respondemos el mismo día.',
    nav: 'Contacto',
    navOrder: 5,
    showInNav: true,
  },
  {
    slug: 'aviso-legal',
    path: '/aviso-legal.html',
    contentFile: 'aviso-legal.html',
    title: 'Aviso legal | XAIXO Materiales de Construcción',
    description: 'Aviso legal de Materiales Xaixo Home S.L., titular del sitio web materialesxaixo.com.',
    nav: 'Aviso legal',
    navOrder: 6,
    showInNav: false,
  },
  {
    slug: 'politica-privacidad',
    path: '/politica-privacidad.html',
    contentFile: 'politica-privacidad.html',
    title: 'Política de privacidad | XAIXO Materiales de Construcción',
    description: 'Cómo trata Materiales Xaixo Home S.L. los datos personales de las personas usuarias de materialesxaixo.com.',
    nav: 'Privacidad',
    navOrder: 7,
    showInNav: false,
  },
  {
    slug: 'cookies',
    path: '/cookies.html',
    contentFile: 'cookies.html',
    title: 'Política de cookies | XAIXO Materiales de Construcción',
    description: 'Qué cookies y almacenamiento local utiliza materialesxaixo.com y cómo gestionarlas.',
    nav: 'Cookies',
    navOrder: 8,
    showInNav: false,
  },
];
