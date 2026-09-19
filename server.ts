import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

// Body parsing with generous limits for JSON
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Directories setup
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const UPLOADS_VIDEOS_DIR = path.join(UPLOADS_DIR, 'videos');
const UPLOADS_THUMBS_DIR = path.join(UPLOADS_DIR, 'thumbnails');

[DATA_DIR, UPLOADS_DIR, UPLOADS_VIDEOS_DIR, UPLOADS_THUMBS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Seed data
const defaultCategories = [
  {
    id: 'sagas',
    name: 'Sagas',
    slug: 'sagas',
    description: 'Sagas completas, arcos argumentales y episodios destacados.',
    icon: 'ball-1',
    order: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 'peliculas',
    name: 'Películas',
    slug: 'peliculas',
    description: 'Películas completas, largometrajes y OVAs remasterizadas.',
    icon: 'ball-2',
    order: 2,
    createdAt: new Date().toISOString()
  },
  {
    id: 'mangas',
    name: 'Mangas',
    slug: 'mangas',
    description: 'Capítulos narrados, mangas a color y comparativas con la animación.',
    icon: 'ball-3',
    order: 3,
    createdAt: new Date().toISOString()
  },
  {
    id: 'videos',
    name: 'Videos',
    slug: 'videos',
    description: 'Clips épicos, mejores batallas, curiosidades y ediciones especiales.',
    icon: 'ball-4',
    order: 4,
    createdAt: new Date().toISOString()
  },
  {
    id: 'imagenes',
    name: 'Imágenes',
    slug: 'imagenes',
    description: 'Showcases de ilustraciones, galerías animadas y arte oficial.',
    icon: 'ball-5',
    order: 5,
    createdAt: new Date().toISOString()
  },
  {
    id: 'canciones',
    name: 'Canciones',
    slug: 'canciones',
    description: 'Openings, endings legendarios, covers y bandas sonoras originales.',
    icon: 'ball-6',
    order: 6,
    createdAt: new Date().toISOString()
  },
  {
    id: 'juegos',
    name: 'Juegos',
    slug: 'juegos',
    description: 'Cinemáticas, tráilers, torneos y gameplays de videojuegos clásicos y modernos.',
    icon: 'ball-7',
    order: 7,
    createdAt: new Date().toISOString()
  },
  {
    id: 'rincon-akira',
    name: 'Rincón Akira',
    slug: 'rincon-akira',
    description: 'Homenaje al maestro Akira Toriyama, entrevistas, bocetos y legado eterno.',
    icon: 'akira',
    order: 8,
    createdAt: new Date().toISOString()
  }
];

const defaultVideos = [
  {
    id: 'vid-1',
    title: 'Saga de los Saiyans: La Batalla Decisiva en la Tierra',
    shortDescription: 'Goku se enfrenta a Vegeta en un combate que cambiará el destino del universo.',
    description: 'El primer choque monumental entre Goku y el príncipe de los Saiyans, Vegeta. Una exhibición magistral de artes marciales y técnicas prohibidas como el Kaio-ken y el Kamehameha multiplicado.',
    categoryId: 'sagas',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200&auto=format&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    sourceType: 'external',
    duration: '24:30',
    fileSizeBytes: 209715200,
    orderIndex: 1,
    views: 1420,
    createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    tags: ['Saga Saiyan', 'Goku', 'Vegeta', 'Kaio-Ken'],
    featured: true
  },
  {
    id: 'vid-2',
    title: 'Saga de Freezer: El Despertar del Legendario Super Saiyan',
    shortDescription: 'La furia contenida de Goku despierta al legendario guerrero dorado en Namek.',
    description: 'Tras la pérdida de su mejor amigo Krilin en el moribundo planeta Namek, Goku desata una ira milenaria transformándose por primera vez en Super Saiyan frente al temible emperador Freezer.',
    categoryId: 'sagas',
    thumbnailUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1200&auto=format&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    sourceType: 'external',
    duration: '28:15',
    fileSizeBytes: 240000000,
    orderIndex: 2,
    views: 2890,
    createdAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
    tags: ['Super Saiyan', 'Freezer', 'Namek', 'Goku'],
    featured: true
  },
  {
    id: 'vid-3',
    title: 'Película: Fusión Renacida - Gogeta vs Janemba',
    shortDescription: 'El nacimiento de la fusión definitiva para restablecer el orden en el infierno.',
    description: 'Cuando la maldad acumulada en el infierno se personifica en Janemba, Goku y Vegeta deben dejar de lado su orgullo y sincronizar la danza de la metamorfosis para dar vida al invencible Gogeta.',
    categoryId: 'peliculas',
    thumbnailUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=1200&auto=format&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    sourceType: 'external',
    duration: '50:40',
    fileSizeBytes: 314572800,
    orderIndex: 1,
    views: 3120,
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    tags: ['Gogeta', 'Janemba', 'Fusión', 'Películas']
  },
  {
    id: 'vid-4',
    title: 'Película: El Guerrero Legendario Broly',
    shortDescription: 'El Saiyan cuya fuerza crece sin límites desafía a todos los Guerreros Z.',
    description: 'En el nuevo planeta Vegeta, una trampa del rey Paragus revela la presencia de Broly, el demonio guerrero cuyo poder desmesurado estremece toda la galaxia.',
    categoryId: 'peliculas',
    thumbnailUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1200&auto=format&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    sourceType: 'external',
    duration: '1:12:00',
    fileSizeBytes: 420000000,
    orderIndex: 2,
    views: 4530,
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    tags: ['Broly', 'Saiyan Legendario', 'Película']
  },
  {
    id: 'vid-5',
    title: 'Manga Motion: El Arco de Moro y la Magia Milenaria',
    shortDescription: 'La batalla estelar narrada y coloreada directamente de las páginas del manga.',
    description: 'Adaptación animada y con banda sonora del capítulo donde Goku domina los principios del Ultra Instinto perfeccionado frente al consumidor de planetas Moro.',
    categoryId: 'mangas',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    sourceType: 'external',
    duration: '18:50',
    fileSizeBytes: 180000000,
    orderIndex: 1,
    views: 980,
    createdAt: new Date(Date.now() - 3600000 * 24 * 6).toISOString(),
    tags: ['Manga', 'Moro', 'Ultra Instinto']
  },
  {
    id: 'vid-6',
    title: 'Top 10 Combates Más Espectaculares y Coreografías',
    shortDescription: 'Recopilación con la mejor animación, dinamismo y momentos cumbre.',
    description: 'Un análisis visual de las mejores escenas de lucha dirigidas por animadores icónicos como Naotoshi Shida y Katsuyoshi Nakatsuru.',
    categoryId: 'videos',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    sourceType: 'external',
    duration: '14:22',
    fileSizeBytes: 155000000,
    orderIndex: 1,
    views: 1850,
    createdAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
    tags: ['Combates', 'Animación', 'Shida']
  },
  {
    id: 'vid-7',
    title: 'Galería Dinámica: Las Mejores Portadas e Ilustraciones a Color',
    shortDescription: 'Ilustraciones históricas en alta definición con música ambiental.',
    description: 'Paseo interactivo por los lienzos originales creados para las portadas de la Shonen Jump y los volúmenes Daizenshuu.',
    categoryId: 'imagenes',
    thumbnailUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1200&auto=format&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    sourceType: 'external',
    duration: '10:15',
    fileSizeBytes: 120000000,
    orderIndex: 1,
    views: 640,
    createdAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
    tags: ['Arte', 'Ilustración', 'Galería']
  },
  {
    id: 'vid-8',
    title: 'Chala Head Chala y Dan Dan Kokoro: Concierto Sinfónico',
    shortDescription: 'Interpretación orquestal de las canciones más queridas de la infancia.',
    description: 'Los himnos atemporales compuestos por Hironobu Kageyama y Shunsuke Kikuchi interpretados con coro y orquesta sinfónica completa.',
    categoryId: 'canciones',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    sourceType: 'external',
    duration: '08:45',
    fileSizeBytes: 95000000,
    orderIndex: 1,
    views: 3490,
    createdAt: new Date(Date.now() - 3600000 * 24 * 8).toISOString(),
    tags: ['Música', 'Openings', 'Chala Head Chala']
  },
  {
    id: 'vid-9',
    title: 'Budokai Tenkaichi & Sparking Zero: Mejores Cinemáticas',
    shortDescription: 'Evolución gráfica de los combates en 3D a través de las generaciones.',
    description: 'Un repaso emocionante a los combos definitivos, cinemáticas cinematográficas y gráficos hiperrealistas en videojuegos.',
    categoryId: 'juegos',
    thumbnailUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=1200&auto=format&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    sourceType: 'external',
    duration: '21:10',
    fileSizeBytes: 215000000,
    orderIndex: 1,
    views: 2210,
    createdAt: new Date(Date.now() - 3600000 * 24 * 9).toISOString(),
    tags: ['Videojuegos', 'Sparking Zero', 'Tenkaichi']
  },
  {
    id: 'vid-10',
    title: 'Especial Akira Toriyama: El Maestro que Marcó a Generaciones',
    shortDescription: 'Un viaje emotivo por la vida, bocetos inéditos y filosofía de Akira Toriyama.',
    description: 'Documental y recopilación de entrevistas, homenajes de mangakas y el impacto cultural global dejado por el genio creativo Akira Toriyama.',
    categoryId: 'rincon-akira',
    thumbnailUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=1200&auto=format&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    sourceType: 'external',
    duration: '35:20',
    fileSizeBytes: 290000000,
    orderIndex: 1,
    views: 5820,
    createdAt: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
    tags: ['Akira Toriyama', 'Tributo', 'Biografía', 'Legado'],
    featured: true
  }
];

interface DatabaseSchema {
  admin: {
    username: string;
    passwordHash: string; // SHA-256 hash
    salt: string;
  };
  categories: typeof defaultCategories;
  videos: typeof defaultVideos;
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

function initDatabase(): DatabaseSchema {
  if (!fs.existsSync(DB_FILE)) {
    const salt = crypto.randomBytes(16).toString('hex');
    const initialDb: DatabaseSchema = {
      admin: {
        username: 'admin',
        passwordHash: hashPassword('dragon2026', salt),
        salt: salt
      },
      categories: defaultCategories,
      videos: defaultVideos
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
    return initialDb;
  }

  try {
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    // Ensure all keys exist
    if (!parsed.admin || !parsed.categories || !parsed.videos) {
      throw new Error('Incomplete db file');
    }
    return parsed;
  } catch {
    const salt = crypto.randomBytes(16).toString('hex');
    const resetDb: DatabaseSchema = {
      admin: {
        username: 'admin',
        passwordHash: hashPassword('dragon2026', salt),
        salt: salt
      },
      categories: defaultCategories,
      videos: defaultVideos
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(resetDb, null, 2), 'utf-8');
    return resetDb;
  }
}

let db = initDatabase();

function saveDatabase() {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

// Memory session tokens
const activeSessions = new Set<string>();

function generateSessionToken(): string {
  const token = crypto.randomBytes(32).toString('hex');
  activeSessions.add(token);
  return token;
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado. Debes iniciar sesión como administrador.' });
  }
  const token = authHeader.substring(7);
  if (!activeSessions.has(token)) {
    return res.status(401).json({ error: 'Sesión expirada o inválida.' });
  }
  next();
}

// Multer storage configuration
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_VIDEOS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.mp4';
    const unique = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
    cb(null, unique);
  }
});

const thumbStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_THUMBS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const unique = `thumb-${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`;
    cb(null, unique);
  }
});

// Max 600MB video file support
const uploadVideo = multer({
  storage: videoStorage,
  limits: { fileSize: 600 * 1024 * 1024 }
});

// Max 25MB thumbnail support
const uploadThumb = multer({
  storage: thumbStorage,
  limits: { fileSize: 25 * 1024 * 1024 }
});

// -------------------------------------------------------------
// STREAMING ENDPOINT WITH HTTP 206 PARTIAL CONTENT
// Allows instant playback and seeking for large 200MB+ videos
// -------------------------------------------------------------
app.get('/uploads/videos/:filename', (req: Request, res: Response) => {
  const filename = path.basename(req.params.filename);
  const filePath = path.join(UPLOADS_VIDEOS_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Video file not found' });
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize) {
      res.status(416).send('Requested range not satisfiable\n' + start + ' >= ' + fileSize);
      return;
    }

    const chunksize = end - start + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4'
    };

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
      'Accept-Ranges': 'bytes'
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
});

// Serve uploaded thumbnails statically
app.use('/uploads/thumbnails', express.static(UPLOADS_THUMBS_DIR));

// -------------------------------------------------------------
// AUTHENTICATION ROUTES
// -------------------------------------------------------------
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
  }

  const matchesUser = username.trim().toLowerCase() === db.admin.username.toLowerCase();
  const testHash = hashPassword(password, db.admin.salt);
  const matchesPass = testHash === db.admin.passwordHash;

  if (!matchesUser || !matchesPass) {
    return res.status(401).json({ error: 'Credenciales inválidas. Comprueba tu usuario y contraseña.' });
  }

  const token = generateSessionToken();
  res.json({
    success: true,
    token,
    admin: {
      username: db.admin.username
    }
  });
});

app.get('/api/auth/check', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.json({ authenticated: false });
  }
  const token = authHeader.substring(7);
  const isValid = activeSessions.has(token);
  res.json({
    authenticated: isValid,
    username: isValid ? db.admin.username : null
  });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    activeSessions.delete(token);
  }
  res.json({ success: true });
});

// Update username and/or password
app.put('/api/auth/settings', requireAdmin, (req: Request, res: Response) => {
  const { newUsername, newPassword, currentPassword } = req.body;

  // Verify current password if changing password
  if (newPassword) {
    if (!currentPassword) {
      return res.status(400).json({ error: 'Debes ingresar tu contraseña actual para cambiarla.' });
    }
    const currentHash = hashPassword(currentPassword, db.admin.salt);
    if (currentHash !== db.admin.passwordHash) {
      return res.status(401).json({ error: 'La contraseña actual no es correcta.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres.' });
    }
    const newSalt = crypto.randomBytes(16).toString('hex');
    db.admin.salt = newSalt;
    db.admin.passwordHash = hashPassword(newPassword, newSalt);
  }

  if (newUsername && newUsername.trim().length > 0) {
    db.admin.username = newUsername.trim();
  }

  saveDatabase();
  res.json({
    success: true,
    message: 'Configuración de administrador actualizada correctamente.',
    username: db.admin.username
  });
});

// -------------------------------------------------------------
// CATEGORIES ROUTES
// -------------------------------------------------------------
app.get('/api/categories', (req: Request, res: Response) => {
  const sorted = [...db.categories].sort((a, b) => (a.order || 0) - (b.order || 0));
  res.json(sorted);
});

app.post('/api/categories', requireAdmin, (req: Request, res: Response) => {
  const { name, description, icon } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'El nombre de la categoría es requerido.' });
  }

  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const id = `cat-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const maxOrder = db.categories.reduce((max, cat) => Math.max(max, cat.order || 0), 0);

  const newCategory = {
    id,
    name: name.trim(),
    slug,
    description: description ? description.trim() : '',
    icon: icon || 'ball-1',
    order: maxOrder + 1,
    createdAt: new Date().toISOString()
  };

  db.categories.push(newCategory);
  saveDatabase();

  res.status(201).json(newCategory);
});

app.put('/api/categories/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, icon, order } = req.body;

  const catIndex = db.categories.findIndex((c) => c.id === id);
  if (catIndex === -1) {
    return res.status(404).json({ error: 'Categoría no encontrada' });
  }

  if (name && name.trim()) {
    db.categories[catIndex].name = name.trim();
    db.categories[catIndex].slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  if (description !== undefined) {
    db.categories[catIndex].description = description.trim();
  }

  if (icon) {
    db.categories[catIndex].icon = icon;
  }

  if (typeof order === 'number') {
    db.categories[catIndex].order = order;
  }

  saveDatabase();
  res.json(db.categories[catIndex]);
});

app.delete('/api/categories/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { reassignToId, deleteVideos } = req.query;

  const catIndex = db.categories.findIndex((c) => c.id === id);
  if (catIndex === -1) {
    return res.status(404).json({ error: 'Categoría no encontrada' });
  }

  // Handle videos in this category
  if (deleteVideos === 'true') {
    db.videos = db.videos.filter((v) => v.categoryId !== id);
  } else if (reassignToId && typeof reassignToId === 'string') {
    const targetExists = db.categories.some((c) => c.id === reassignToId);
    if (targetExists) {
      db.videos.forEach((v) => {
        if (v.categoryId === id) {
          v.categoryId = reassignToId;
        }
      });
    } else {
      db.videos = db.videos.filter((v) => v.categoryId !== id);
    }
  } else {
    // If other categories exist, reassign to first remaining, otherwise remove orphan videos
    const remaining = db.categories.filter((c) => c.id !== id);
    if (remaining.length > 0) {
      db.videos.forEach((v) => {
        if (v.categoryId === id) {
          v.categoryId = remaining[0].id;
        }
      });
    } else {
      db.videos = db.videos.filter((v) => v.categoryId !== id);
    }
  }

  db.categories.splice(catIndex, 1);
  saveDatabase();
  res.json({ success: true, message: 'Categoría eliminada con éxito.' });
});

// Bulk clean starter/demo data if admin desires
app.post('/api/videos/bulk/clear-demo', requireAdmin, (req: Request, res: Response) => {
  const demoIds = ['vid-1', 'vid-2', 'vid-3', 'vid-4', 'vid-5', 'vid-6', 'vid-7', 'vid-8', 'vid-9', 'vid-10'];
  db.videos = db.videos.filter((v) => !demoIds.includes(v.id));
  saveDatabase();
  res.json({ success: true, message: 'Videos de ejemplo iniciales eliminados.', count: db.videos.length });
});

// -------------------------------------------------------------
// VIDEOS ROUTES
// -------------------------------------------------------------
app.get('/api/videos', (req: Request, res: Response) => {
  const { categoryId, search, sort } = req.query;
  let list = [...db.videos];

  if (categoryId && typeof categoryId === 'string' && categoryId !== 'all') {
    list = list.filter((v) => v.categoryId === categoryId);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter(
      (v) =>
        v.title.toLowerCase().includes(q) ||
        (v.description && v.description.toLowerCase().includes(q)) ||
        (v.tags && v.tags.some((t) => t.toLowerCase().includes(q)))
    );
  }

  if (sort === 'views') {
    list.sort((a, b) => b.views - a.views);
  } else if (sort === 'title') {
    list.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sort === 'order') {
    list.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  } else {
    // default: by orderIndex then by createdAt desc
    list.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  res.json(list);
});

app.get('/api/videos/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const video = db.videos.find((v) => v.id === id);
  if (!video) {
    return res.status(404).json({ error: 'Video no encontrado' });
  }

  // Increment views counter
  video.views = (video.views || 0) + 1;
  saveDatabase();

  res.json(video);
});

app.post('/api/videos', requireAdmin, (req: Request, res: Response) => {
  const {
    title,
    description,
    shortDescription,
    categoryId,
    thumbnailUrl,
    videoUrl,
    sourceType,
    duration,
    fileSizeBytes,
    tags,
    featured
  } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'El título del video es obligatorio.' });
  }
  if (!videoUrl || !videoUrl.trim()) {
    return res.status(400).json({ error: 'La URL o archivo del video es obligatorio.' });
  }
  if (!categoryId) {
    return res.status(400).json({ error: 'Debes seleccionar una categoría.' });
  }

  const categoryExists = db.categories.some((c) => c.id === categoryId);
  if (!categoryExists) {
    return res.status(400).json({ error: 'La categoría seleccionada no existe.' });
  }

  const id = `vid-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const maxOrder = db.videos
    .filter((v) => v.categoryId === categoryId)
    .reduce((max, v) => Math.max(max, v.orderIndex || 0), 0);

  const newVideo = {
    id,
    title: title.trim(),
    description: description ? description.trim() : '',
    shortDescription: shortDescription ? shortDescription.trim() : '',
    categoryId,
    thumbnailUrl: thumbnailUrl ? thumbnailUrl.trim() : 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop',
    videoUrl: videoUrl.trim(),
    sourceType: sourceType || 'upload',
    duration: duration || '00:00',
    fileSizeBytes: Number(fileSizeBytes) || 209715200,
    orderIndex: maxOrder + 1,
    views: 0,
    createdAt: new Date().toISOString(),
    tags: Array.isArray(tags) ? tags : [],
    featured: Boolean(featured)
  };

  db.videos.unshift(newVideo);
  saveDatabase();

  res.status(201).json(newVideo);
});

app.put('/api/videos/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const index = db.videos.findIndex((v) => v.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Video no encontrado' });
  }

  const current = db.videos[index];
  const {
    title,
    description,
    shortDescription,
    categoryId,
    thumbnailUrl,
    videoUrl,
    sourceType,
    duration,
    fileSizeBytes,
    orderIndex,
    tags,
    featured
  } = req.body;

  if (title !== undefined) current.title = title.trim();
  if (description !== undefined) current.description = description.trim();
  if (shortDescription !== undefined) current.shortDescription = shortDescription.trim();
  if (categoryId !== undefined) current.categoryId = categoryId;
  if (thumbnailUrl !== undefined) current.thumbnailUrl = thumbnailUrl.trim();
  if (videoUrl !== undefined) current.videoUrl = videoUrl.trim();
  if (sourceType !== undefined) current.sourceType = sourceType;
  if (duration !== undefined) current.duration = duration;
  if (fileSizeBytes !== undefined) current.fileSizeBytes = Number(fileSizeBytes);
  if (orderIndex !== undefined) current.orderIndex = Number(orderIndex);
  if (tags !== undefined) current.tags = Array.isArray(tags) ? tags : [];
  if (featured !== undefined) current.featured = Boolean(featured);

  saveDatabase();
  res.json(current);
});

app.delete('/api/videos/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const index = db.videos.findIndex((v) => v.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Video no encontrado' });
  }

  const video = db.videos[index];

  // If it was a local upload in /uploads/videos, remove file if exists
  if (video.videoUrl.startsWith('/uploads/videos/')) {
    const filename = path.basename(video.videoUrl);
    const filePath = path.join(UPLOADS_VIDEOS_DIR, filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error('Error deleting video file:', err);
      }
    }
  }

  // If local thumbnail, remove as well
  if (video.thumbnailUrl.startsWith('/uploads/thumbnails/')) {
    const filename = path.basename(video.thumbnailUrl);
    const filePath = path.join(UPLOADS_THUMBS_DIR, filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error('Error deleting thumbnail file:', err);
      }
    }
  }

  db.videos.splice(index, 1);
  saveDatabase();

  res.json({ success: true, message: 'Video eliminado correctamente.' });
});

// Reorder videos API
app.post('/api/videos/reorder', requireAdmin, (req: Request, res: Response) => {
  const { orderedIds } = req.body;
  if (!Array.isArray(orderedIds)) {
    return res.status(400).json({ error: 'orderedIds debe ser un array de IDs' });
  }

  orderedIds.forEach((id: string, index: number) => {
    const vid = db.videos.find((v) => v.id === id);
    if (vid) {
      vid.orderIndex = index + 1;
    }
  });

  saveDatabase();
  res.json({ success: true, message: 'Orden actualizado' });
});

// -------------------------------------------------------------
// FILE UPLOAD ENDPOINTS
// -------------------------------------------------------------
app.post('/api/upload/video', requireAdmin, uploadVideo.single('video'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se recibió ningún archivo de video.' });
  }

  const relativeUrl = `/uploads/videos/${req.file.filename}`;
  res.json({
    success: true,
    url: relativeUrl,
    filename: req.file.filename,
    originalName: req.file.originalname,
    fileSizeBytes: req.file.size
  });
});

app.post('/api/upload/thumbnail', requireAdmin, uploadThumb.single('thumbnail'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se recibió ningún archivo de imagen.' });
  }

  const relativeUrl = `/uploads/thumbnails/${req.file.filename}`;
  res.json({
    success: true,
    url: relativeUrl,
    filename: req.file.filename,
    originalName: req.file.originalname,
    fileSizeBytes: req.file.size
  });
});

// -------------------------------------------------------------
// STORAGE OVERVIEW STATS
// -------------------------------------------------------------
app.get('/api/storage/stats', (req: Request, res: Response) => {
  const totalVideos = db.videos.length;
  const totalCategories = db.categories.length;

  let localVideoCount = 0;
  let externalVideoCount = 0;
  let totalBytes = 0;

  db.videos.forEach((v) => {
    if (v.videoUrl.startsWith('/uploads/videos/')) {
      localVideoCount++;
      const filename = path.basename(v.videoUrl);
      const filePath = path.join(UPLOADS_VIDEOS_DIR, filename);
      if (fs.existsSync(filePath)) {
        try {
          totalBytes += fs.statSync(filePath).size;
        } catch {}
      } else {
        totalBytes += v.fileSizeBytes || 200 * 1024 * 1024;
      }
    } else {
      externalVideoCount++;
      totalBytes += v.fileSizeBytes || 200 * 1024 * 1024;
    }
  });

  const totalMB = Math.round(totalBytes / (1024 * 1024));
  const totalGB = parseFloat((totalBytes / (1024 * 1024 * 1024)).toFixed(2));

  res.json({
    totalVideos,
    totalCategories,
    localVideoCount,
    externalVideoCount,
    totalStorageBytes: totalBytes,
    totalStorageMB: totalMB,
    totalStorageGB: totalGB
  });
});

// -------------------------------------------------------------
// START SERVER WITH VITE
// -------------------------------------------------------------
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Dragon Video Stream server running on http://0.0.0.0:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
});
