export type LanguageCode = 'en' | 'ru';

export interface LanguageInfo {
  code: LanguageCode;
  name: string;
  flag: string;
}

export const LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', flag: 'EN' },
  { code: 'ru', name: 'Русский', flag: 'RU' },
];

export const TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  en: {
    // Navbar
    'nav.editor': 'Editor',
    'nav.gallery': 'Community',
    'nav.players': 'Minecraft Players',
    'nav.trending': 'Trending',
    'nav.templates': 'Templates',
    'nav.server': 'Server Plugin',
    'nav.profile': 'Profile',
    'nav.publish': 'Publish Skin',
    'nav.dms': 'Messages',
    'nav.login': 'Sign In',
    'nav.exit': 'Sign Out',
    'nav.tutorial': 'Guide',

    // Editor Tools
    'editor.tools': 'Tools',
    'editor.pencil': 'Pencil',
    'editor.brush': 'Brush',
    'editor.eraser': 'Eraser',
    'editor.fill': 'Flood Fill',
    'editor.picker': 'Color Picker',
    'editor.line': 'Line',
    'editor.rect': 'Rectangle',
    'editor.circle': 'Circle',
    'editor.noise': 'Texture Noise',
    'editor.modifiers': 'Modifiers',
    'editor.brushSize': 'Brush Size',
    'editor.symmetry': 'Mirror X',
    'editor.targetLayer': 'Layer',
    'editor.baseLayer': 'Base (L1)',
    'editor.outerLayer': 'Overlay (L2)',
    'editor.bothLayers': 'Both',
    'editor.modelGeometry': 'Model',
    'editor.classic': 'Classic (4px)',
    'editor.slim': 'Slim (3px)',
    'editor.colorPalette': 'Colors',
    'editor.transparent': 'Transparent',
    'editor.downloadPng': 'Download 64×64 PNG',
    'editor.importPng': 'Import Skin PNG',
    'editor.starterTemplates': 'Starter Templates',

    // 3D Viewport
    'view3d.idle': 'Idle',
    'view3d.walk': 'Walk',
    'view3d.pose': 'Pose',
    'view3d.layer2': 'Layer 2',
    'view3d.reset': 'Reset Camera',
    'view3d.parts': 'Body Parts',

    // Gallery & Players
    'gallery.title': 'Explore Community Skins',
    'gallery.subtitle': 'Discover skins created by players, inspect in 3D, and download for Minecraft Java Edition.',
    'gallery.search': 'Search community skins...',
    'gallery.popular': 'Popular',
    'gallery.trending': 'Trending',
    'gallery.newest': 'Newest',
    'gallery.downloads': 'Downloads',
    'gallery.empty': 'No community skins published yet. Be the first to create and publish a skin!',
    'gallery.createFirst': 'Create a Skin',

    'players.title': 'Search Minecraft Java Players',
    'players.subtitle': 'Enter any Minecraft username to inspect their skin in 3D and export it.',
    'players.searchPlaceholder': 'Enter player username (e.g. Notch, jeb_, Technoblade)...',
    'players.notFound': 'Player not found. Please verify the Minecraft username.',
    'players.searching': 'Searching Minecraft profile...',

    // Skin Page & Modals
    'modal.rating': 'Community Rating',
    'modal.serverCmd': 'Equip on Minecraft Server',
    'modal.comments': 'Comments',
    'modal.post': 'Post Comment',
    'modal.download': 'Download 64×64 PNG',
    'modal.edit': 'Edit in Studio',
    'modal.signInRequired': 'Sign in to perform this action',
    'modal.signInDesc': 'You need an account to like, rate, comment, follow creators, or publish skins.',

    // Onboarding
    'onboard.welcome': 'Welcome to CreamSkin',
    'onboard.intro': 'A professional 3D skin editor and community platform for Minecraft Java Edition.',
    'onboard.step1Title': '1. Pixel-Accurate Editor',
    'onboard.step1Desc': 'Paint 64×64 Minecraft UV regions with full support for Base (L1) and Outer Overlay (L2) transparency.',
    'onboard.step2Title': '2. Real-Time 3D Viewport',
    'onboard.step2Desc': 'Every pixel updates live on the 3D model. Test idle breathing, walking animation, and toggle body parts.',
    'onboard.step3Title': '3. Download & Server Integration',
    'onboard.step3Desc': 'Download official PNGs or apply skins on your Spigot/Paper server with /skin set <id>.',
    'onboard.getStarted': 'Start Creating',
  },

  ru: {
    // Navbar
    'nav.editor': 'Редактор',
    'nav.gallery': 'Сообщество',
    'nav.players': 'Игроки Minecraft',
    'nav.trending': 'В тренде',
    'nav.templates': 'Шаблоны',
    'nav.server': 'Плагин для сервера',
    'nav.profile': 'Профиль',
    'nav.publish': 'Опубликовать',
    'nav.dms': 'Сообщения',
    'nav.login': 'Войти',
    'nav.exit': 'Выйти',
    'nav.tutorial': 'Гайд',

    // Editor Tools
    'editor.tools': 'Инструменты',
    'editor.pencil': 'Карандаш',
    'editor.brush': 'Кисть',
    'editor.eraser': 'Ластик',
    'editor.fill': 'Заливка',
    'editor.picker': 'Пипетка',
    'editor.line': 'Линия',
    'editor.rect': 'Прямоугольник',
    'editor.circle': 'Круг',
    'editor.noise': 'Шум / Затенение',
    'editor.modifiers': 'Модификаторы',
    'editor.brushSize': 'Размер кисти',
    'editor.symmetry': 'Симметрия X',
    'editor.targetLayer': 'Слой',
    'editor.baseLayer': 'Базовый (L1)',
    'editor.outerLayer': 'Оверлей (L2)',
    'editor.bothLayers': 'Оба',
    'editor.modelGeometry': 'Модель',
    'editor.classic': 'Классическая (4px)',
    'editor.slim': 'Слим (3px)',
    'editor.colorPalette': 'Палитра',
    'editor.transparent': 'Прозрачный',
    'editor.downloadPng': 'Скачать 64×64 PNG',
    'editor.importPng': 'Импортировать скин',
    'editor.starterTemplates': 'Базовые шаблоны',

    // 3D Viewport
    'view3d.idle': 'Дыхание',
    'view3d.walk': 'Ходьба',
    'view3d.pose': 'Поза',
    'view3d.layer2': 'Слой 2',
    'view3d.reset': 'Сбросить камеру',
    'view3d.parts': 'Части тела',

    // Gallery & Players
    'gallery.title': 'Скины сообщества',
    'gallery.subtitle': 'Изучайте работы авторов, осматривайте в 3D и скачивайте для Minecraft Java Edition.',
    'gallery.search': 'Поиск скинов сообщества...',
    'gallery.popular': 'Популярные',
    'gallery.trending': 'В тренде',
    'gallery.newest': 'Новые',
    'gallery.downloads': 'Скачивания',
    'gallery.empty': 'В сообществе пока нет опубликованных скинов. Станьте первым автором!',
    'gallery.createFirst': 'Создать скин',

    'players.title': 'Поиск игроков Minecraft',
    'players.subtitle': 'Введите ник любого игрока Minecraft Java, чтобы осмотреть его скин в 3D и экспортировать.',
    'players.searchPlaceholder': 'Введите ник игрока (например, Notch, jeb_, Technoblade)...',
    'players.notFound': 'Игрок с таким ником не найден. Проверьте правильность написания.',
    'players.searching': 'Поиск профиля Minecraft...',

    // Skin Page & Modals
    'modal.rating': 'Оценка сообщества',
    'modal.serverCmd': 'Применить на сервере',
    'modal.comments': 'Комментарии',
    'modal.post': 'Отправить комментарий',
    'modal.download': 'Скачать 64×64 PNG',
    'modal.edit': 'Редактировать в студии',
    'modal.signInRequired': 'Требуется авторизация',
    'modal.signInDesc': 'Войдите или зарегистрируйтесь, чтобы ставить лайки, оценки, комментарии и публиковать скины.',

    // Onboarding
    'onboard.welcome': 'Добро пожаловать в CreamSkin',
    'onboard.intro': 'Современный 3D-редактор и платформа скинов для Minecraft Java Edition.',
    'onboard.step1Title': '1. Попиксельный холст',
    'onboard.step1Desc': 'Рисуйте в стандартном формате 64×64 с полной поддержкой базового слоя и прозрачности оверлея.',
    'onboard.step2Title': '2. Живая 3D-модель',
    'onboard.step2Desc': 'Каждый пиксель мгновенно обновляется на 3D-персонаже. Проверяйте анимации и отключайте части тела.',
    'onboard.step3Title': '3. Скачивание и команды сервера',
    'onboard.step3Desc': 'Скачивайте официальный PNG или надевайте скин на своём сервере через команду /skin set <id>.',
    'onboard.getStarted': 'Перейти в редактор',
  },
};

export function getTranslation(lang: LanguageCode, key: string): string {
  return TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en[key] || key;
}
