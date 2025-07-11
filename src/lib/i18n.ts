// Safe i18n utility for Workforce Management Platform
// No React context, pure functions for maximum compatibility

export type Locale = 'en' | 'de' | 'fr' | 'es' | 'it';

export interface LocaleConfig {
  code: Locale;
  name: string;
  flag: string;
}

export const locales: LocaleConfig[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
];

// Event system for language changes
const languageChangeListeners: (() => void)[] = [];

export function addLanguageChangeListener(listener: () => void) {
  languageChangeListeners.push(listener);
}

export function removeLanguageChangeListener(listener: () => void) {
  const index = languageChangeListeners.indexOf(listener);
  if (index > -1) {
    languageChangeListeners.splice(index, 1);
  }
}

function notifyLanguageChange() {
  languageChangeListeners.forEach(listener => listener());
}



// Translation keys for Workforce Management Platform
const translations: Record<Locale, Record<string, string>> = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.attendance': 'Attendance',
    'nav.schedule': 'Schedule',
    'nav.leave': 'Leave Management',
    'nav.grantLeave': 'Grant Leave',
    'nav.journey': 'Journey Planning',
    'nav.tasks': 'To-Do Tasks',
    'nav.members': 'Member Management',
    'nav.groups': 'Groups',
    'nav.workplaces': 'Workplaces',
    'nav.settings': 'Settings',
    'nav.admin': 'Admin',
    'nav.postingBoard': 'Posting Board',
    'nav.aiAssistant': 'AI Assistant',
    'nav.users': 'Users',
    'nav.overtime': 'Overtime',
    'nav.noticeSurvey': 'Notice & Survey',
    'nav.reports': 'Reports & Analytics',
    'nav.logout': 'Logout',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.welcome': 'Welcome to Workforce Management',
    'dashboard.welcomeBack': 'Welcome back! Here\'s what\'s happening today.',
    'dashboard.overview': 'Platform Overview',
    'dashboard.quickStats': 'Quick Statistics',
    'dashboard.quickActions': 'Quick Actions',
    'dashboard.recentActivity': 'Recent Activity',
    'dashboard.totalEmployees': 'Total Employees',
    'dashboard.presentToday': 'Present Today',
    'dashboard.onLeave': 'On Leave',
    'dashboard.tasksCompleted': 'Tasks Completed',
    'dashboard.pendingRequests': 'Pending Requests',
    'dashboard.addEmployee': 'Add Employee',
    'dashboard.registerNewMember': 'Register new team member',
    'dashboard.exportReport': 'Export Report',
    'dashboard.downloadAttendanceData': 'Download attendance data',
    'dashboard.sendNotification': 'Send Notification',
    'dashboard.notifyTeamMembers': 'Notify team members',
    
    // Schedule
    'schedule.title': 'Schedule Management',
    'schedule.description': 'Manage employee schedules and shifts with drag & drop',
    
    // Attendance
    'attendance.title': 'Attendance Management',
    'attendance.description': 'Track employee attendance with advanced features',
    'attendance.personal': 'Personal',
    'attendance.team': 'Team',
    'attendance.attendanceRate': 'Attendance Rate',
    'attendance.avgWorkHours': 'Avg Work Hours',
    'attendance.overtimeHours': 'Overtime Hours',
    'attendance.presentToday': 'Present Today',
    
    // Members
    'members.title': 'Member Management',
    'members.description': 'Manage employee roles, groups, and administrative rights. Admins have full access, leaders manage their groups, and employees have basic access.',
    'members.totalMembers': 'Total Members',
    'members.admins': 'Admins',
    'members.leaders': 'Leaders',
    'members.employees': 'Employees',
    'members.tabMembers': 'Members',
    'members.tabGroups': 'Groups',
    'members.tabRoleManagement': 'Role Management',
    'members.tabAdmin': 'Admin',
    'members.searchPlaceholder': 'Search members...',
    'members.allRoles': 'All Roles',
    'members.roleAdmin': 'Admin',
    'members.roleLeader': 'Leader',
    'members.roleEmployee': 'Employee',
    'members.allStatus': 'All Status',
    'members.statusActive': 'Active',
    'members.statusInactive': 'Inactive',
    'members.statusSuspended': 'Suspended',
    'members.statusTerminated': 'Terminated',
    'members.addMember': 'Add Member',
    
    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.export': 'Export',
    'common.import': 'Import',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.ok': 'OK',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.warning': 'Warning',
    'common.info': 'Information',
    'common.adminUser': 'Admin User',
    'common.adminEmail': 'admin@company.com',
  },
  
  de: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.attendance': 'Anwesenheit',
    'nav.schedule': 'Zeitplan',
    'nav.leave': 'Urlaubsverwaltung',
    'nav.grantLeave': 'Urlaub gewähren',
    'nav.journey': 'Reiseplanung',
    'nav.tasks': 'Aufgaben',
    'nav.members': 'Mitgliederverwaltung',
    'nav.groups': 'Gruppen',
    'nav.workplaces': 'Arbeitsplätze',
    'nav.settings': 'Einstellungen',
    'nav.admin': 'Administration',
    'nav.postingBoard': 'Anschlagbrett',
    'nav.aiAssistant': 'KI-Assistent',
    'nav.users': 'Benutzer',
    'nav.overtime': 'Überstunden',
    'nav.noticeSurvey': 'Mitteilungen & Umfragen',
    'nav.reports': 'Berichte & Analysen',
    'nav.logout': 'Abmelden',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.welcome': 'Willkommen bei der Personalverwaltung',
    'dashboard.welcomeBack': 'Willkommen zurück! Hier ist was heute passiert.',
    'dashboard.overview': 'Plattform-Übersicht',
    'dashboard.quickStats': 'Schnellstatistiken',
    'dashboard.quickActions': 'Schnellaktionen',
    'dashboard.recentActivity': 'Letzte Aktivitäten',
    'dashboard.totalEmployees': 'Gesamtmitarbeiter',
    'dashboard.presentToday': 'Heute anwesend',
    'dashboard.onLeave': 'Im Urlaub',
    'dashboard.tasksCompleted': 'Aufgaben erledigt',
    'dashboard.pendingRequests': 'Ausstehende Anfragen',
    'dashboard.addEmployee': 'Mitarbeiter hinzufügen',
    'dashboard.registerNewMember': 'Neues Teammitglied registrieren',
    'dashboard.exportReport': 'Bericht exportieren',
    'dashboard.downloadAttendanceData': 'Anwesenheitsdaten herunterladen',
    'dashboard.sendNotification': 'Benachrichtigung senden',
    'dashboard.notifyTeamMembers': 'Teammitglieder benachrichtigen',
    
    // Schedule
    'schedule.title': 'Zeitplanverwaltung',
    'schedule.description': 'Verwalten Sie Mitarbeiterzeitpläne und Schichten mit Drag & Drop',
    
    // Attendance
    'attendance.title': 'Anwesenheitsverwaltung',
    'attendance.description': 'Verfolgen Sie die Mitarbeiteranwesenheit mit erweiterten Funktionen',
    'attendance.personal': 'Persönlich',
    'attendance.team': 'Team',
    'attendance.attendanceRate': 'Anwesenheitsrate',
    'attendance.avgWorkHours': 'Durchschn. Arbeitsstunden',
    'attendance.overtimeHours': 'Überstunden',
    'attendance.presentToday': 'Heute anwesend',
    
    // Members
    'members.title': 'Mitgliederverwaltung',
    'members.description': 'Verwalten Sie Mitarbeiterrollen, Gruppen und administrative Rechte. Admins haben vollen Zugriff, Führungskräfte verwalten ihre Gruppen und Mitarbeiter haben grundlegenden Zugriff.',
    'members.totalMembers': 'Gesamtmitglieder',
    'members.admins': 'Admins',
    'members.leaders': 'Führungskräfte',
    'members.employees': 'Mitarbeiter',
    'members.tabMembers': 'Mitglieder',
    'members.tabGroups': 'Gruppen',
    'members.tabRoleManagement': 'Rollenverwaltung',
    'members.tabAdmin': 'Admin',
    'members.searchPlaceholder': 'Mitglieder suchen...',
    'members.allRoles': 'Alle Rollen',
    'members.roleAdmin': 'Admin',
    'members.roleLeader': 'Führungskraft',
    'members.roleEmployee': 'Mitarbeiter',
    'members.allStatus': 'Alle Status',
    'members.statusActive': 'Aktiv',
    'members.statusInactive': 'Inaktiv',
    'members.statusSuspended': 'Suspendiert',
    'members.statusTerminated': 'Beendet',
    'members.addMember': 'Mitglied hinzufügen',
    
    // Common
    'common.loading': 'Laden...',
    'common.save': 'Speichern',
    'common.cancel': 'Abbrechen',
    'common.delete': 'Löschen',
    'common.edit': 'Bearbeiten',
    'common.add': 'Hinzufügen',
    'common.search': 'Suchen',
    'common.filter': 'Filter',
    'common.export': 'Exportieren',
    'common.import': 'Importieren',
    'common.yes': 'Ja',
    'common.no': 'Nein',
    'common.ok': 'OK',
    'common.error': 'Fehler',
    'common.success': 'Erfolg',
    'common.warning': 'Warnung',
    'common.info': 'Information',
    'common.adminUser': 'Administrator',
    'common.adminEmail': 'admin@firma.com',
  },
  
  fr: {
    // Navigation
    'nav.dashboard': 'Tableau de bord',
    'nav.attendance': 'Présence',
    'nav.schedule': 'Planning',
    'nav.leave': 'Gestion des congés',
    'nav.grantLeave': 'Accorder un congé',
    'nav.journey': 'Planification de voyage',
    'nav.tasks': 'Tâches à faire',
    'nav.members': 'Gestion des membres',
    'nav.groups': 'Groupes',
    'nav.workplaces': 'Lieux de travail',
    'nav.settings': 'Paramètres',
    'nav.admin': 'Administration',
    'nav.postingBoard': 'Tableau d\'affichage',
    'nav.aiAssistant': 'Assistant IA',
    'nav.users': 'Utilisateurs',
    'nav.overtime': 'Heures supplémentaires',
    'nav.noticeSurvey': 'Avis et sondages',
    'nav.reports': 'Rapports et analyses',
    'nav.logout': 'Déconnexion',
    
    // Dashboard
    'dashboard.title': 'Tableau de bord',
    'dashboard.welcome': 'Bienvenue dans la gestion de la main-d\'œuvre',
    'dashboard.welcomeBack': 'Bon retour ! Voici ce qui se passe aujourd\'hui.',
    'dashboard.overview': 'Aperçu de la plateforme',
    'dashboard.quickStats': 'Statistiques rapides',
    'dashboard.quickActions': 'Actions rapides',
    'dashboard.recentActivity': 'Activité récente',
    'dashboard.totalEmployees': 'Total des employés',
    'dashboard.presentToday': 'Présents aujourd\'hui',
    'dashboard.onLeave': 'En congé',
    'dashboard.tasksCompleted': 'Tâches terminées',
    'dashboard.pendingRequests': 'Demandes en attente',
    'dashboard.addEmployee': 'Ajouter un employé',
    'dashboard.registerNewMember': 'Enregistrer un nouveau membre d\'équipe',
    'dashboard.exportReport': 'Exporter le rapport',
    'dashboard.downloadAttendanceData': 'Télécharger les données de présence',
    'dashboard.sendNotification': 'Envoyer une notification',
    'dashboard.notifyTeamMembers': 'Notifier les membres de l\'équipe',
    
    // Schedule
    'schedule.title': 'Gestion des plannings',
    'schedule.description': 'Gérez les horaires et les équipes des employés avec glisser-déposer',
    
    // Attendance
    'attendance.title': 'Gestion de la présence',
    'attendance.description': 'Suivez la présence des employés avec des fonctionnalités avancées',
    'attendance.personal': 'Personnel',
    'attendance.team': 'Équipe',
    'attendance.attendanceRate': 'Taux de présence',
    'attendance.avgWorkHours': 'Heures moyennes',
    'attendance.overtimeHours': 'Heures supplémentaires',
    'attendance.presentToday': 'Présents aujourd\'hui',
    
    // Members
    'members.title': 'Gestion des membres',
    'members.description': 'Gérez les rôles des employés, les groupes et les droits administratifs. Les admins ont un accès complet, les leaders gèrent leurs groupes et les employés ont un accès de base.',
    'members.totalMembers': 'Total des membres',
    'members.admins': 'Admins',
    'members.leaders': 'Leaders',
    'members.employees': 'Employés',
    'members.tabMembers': 'Membres',
    'members.tabGroups': 'Groupes',
    'members.tabRoleManagement': 'Gestion des rôles',
    'members.tabAdmin': 'Admin',
    'members.searchPlaceholder': 'Rechercher des membres...',
    'members.allRoles': 'Tous les rôles',
    'members.roleAdmin': 'Admin',
    'members.roleLeader': 'Leader',
    'members.roleEmployee': 'Employé',
    'members.allStatus': 'Tous les statuts',
    'members.statusActive': 'Actif',
    'members.statusInactive': 'Inactif',
    'members.statusSuspended': 'Suspendu',
    'members.statusTerminated': 'Terminé',
    'members.addMember': 'Ajouter un membre',
    
    // Common
    'common.loading': 'Chargement...',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.add': 'Ajouter',
    'common.search': 'Rechercher',
    'common.filter': 'Filtrer',
    'common.export': 'Exporter',
    'common.import': 'Importer',
    'common.yes': 'Oui',
    'common.no': 'Non',
    'common.ok': 'OK',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.warning': 'Avertissement',
    'common.info': 'Information',
    'common.adminUser': 'Utilisateur Admin',
    'common.adminEmail': 'admin@entreprise.com',
  },
  
  es: {
    // Navigation
    'nav.dashboard': 'Panel de control',
    'nav.attendance': 'Asistencia',
    'nav.schedule': 'Horario',
    'nav.leave': 'Gestión de permisos',
    'nav.grantLeave': 'Conceder permiso',
    'nav.journey': 'Planificación de viajes',
    'nav.tasks': 'Tareas pendientes',
    'nav.members': 'Gestión de miembros',
    'nav.groups': 'Grupos',
    'nav.workplaces': 'Lugares de trabajo',
    'nav.settings': 'Configuración',
    'nav.admin': 'Administración',
    'nav.postingBoard': 'Tablero de anuncios',
    'nav.aiAssistant': 'Asistente IA',
    'nav.users': 'Usuarios',
    'nav.overtime': 'Horas extra',
    'nav.noticeSurvey': 'Avisos y encuestas',
    'nav.reports': 'Informes y análisis',
    'nav.logout': 'Cerrar sesión',
    
    // Dashboard
    'dashboard.title': 'Panel de control',
    'dashboard.welcome': 'Bienvenido a la gestión de personal',
    'dashboard.welcomeBack': '¡Bienvenido de vuelta! Aquí está lo que está pasando hoy.',
    'dashboard.overview': 'Resumen de la plataforma',
    'dashboard.quickStats': 'Estadísticas rápidas',
    'dashboard.quickActions': 'Acciones rápidas',
    'dashboard.recentActivity': 'Actividad reciente',
    'dashboard.totalEmployees': 'Total de empleados',
    'dashboard.presentToday': 'Presentes hoy',
    'dashboard.onLeave': 'De permiso',
    'dashboard.tasksCompleted': 'Tareas completadas',
    'dashboard.pendingRequests': 'Solicitudes pendientes',
    'dashboard.addEmployee': 'Agregar empleado',
    'dashboard.registerNewMember': 'Registrar nuevo miembro del equipo',
    'dashboard.exportReport': 'Exportar informe',
    'dashboard.downloadAttendanceData': 'Descargar datos de asistencia',
    'dashboard.sendNotification': 'Enviar notificación',
    'dashboard.notifyTeamMembers': 'Notificar a miembros del equipo',
    
    // Schedule
    'schedule.title': 'Gestión de horarios',
    'schedule.description': 'Gestiona horarios y turnos de empleados con arrastrar y soltar',
    
    // Attendance
    'attendance.title': 'Gestión de asistencia',
    'attendance.description': 'Rastrea la asistencia de empleados con funciones avanzadas',
    'attendance.personal': 'Personal',
    'attendance.team': 'Equipo',
    'attendance.attendanceRate': 'Tasa de asistencia',
    'attendance.avgWorkHours': 'Horas promedio',
    'attendance.overtimeHours': 'Horas extra',
    'attendance.presentToday': 'Presentes hoy',
    
    // Members
    'members.title': 'Gestión de miembros',
    'members.description': 'Gestiona roles de empleados, grupos y derechos administrativos. Los admins tienen acceso completo, los líderes gestionan sus grupos y los empleados tienen acceso básico.',
    'members.totalMembers': 'Total de miembros',
    'members.admins': 'Admins',
    'members.leaders': 'Líderes',
    'members.employees': 'Empleados',
    'members.tabMembers': 'Miembros',
    'members.tabGroups': 'Grupos',
    'members.tabRoleManagement': 'Gestión de roles',
    'members.tabAdmin': 'Admin',
    'members.searchPlaceholder': 'Buscar miembros...',
    'members.allRoles': 'Todos los roles',
    'members.roleAdmin': 'Admin',
    'members.roleLeader': 'Líder',
    'members.roleEmployee': 'Empleado',
    'members.allStatus': 'Todos los estados',
    'members.statusActive': 'Activo',
    'members.statusInactive': 'Inactivo',
    'members.statusSuspended': 'Suspendido',
    'members.statusTerminated': 'Terminado',
    'members.addMember': 'Agregar miembro',
    
    // Common
    'common.loading': 'Cargando...',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.add': 'Agregar',
    'common.search': 'Buscar',
    'common.filter': 'Filtrar',
    'common.export': 'Exportar',
    'common.import': 'Importar',
    'common.yes': 'Sí',
    'common.no': 'No',
    'common.ok': 'OK',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.warning': 'Advertencia',
    'common.info': 'Información',
    'common.adminUser': 'Usuario Admin',
    'common.adminEmail': 'admin@empresa.com',
  },
  
  it: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.attendance': 'Presenza',
    'nav.schedule': 'Programma',
    'nav.leave': 'Gestione permessi',
    'nav.grantLeave': 'Concedi permesso',
    'nav.journey': 'Pianificazione viaggi',
    'nav.tasks': 'Attività da fare',
    'nav.members': 'Gestione membri',
    'nav.groups': 'Gruppi',
    'nav.workplaces': 'Luoghi di lavoro',
    'nav.settings': 'Impostazioni',
    'nav.admin': 'Amministrazione',
    'nav.postingBoard': 'Bacheca',
    'nav.aiAssistant': 'Assistente IA',
    'nav.users': 'Utenti',
    'nav.overtime': 'Straordinari',
    'nav.noticeSurvey': 'Avvisi e sondaggi',
    'nav.reports': 'Report e analisi',
    'nav.logout': 'Disconnetti',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.welcome': 'Benvenuto nella gestione del personale',
    'dashboard.welcomeBack': 'Bentornato! Ecco cosa sta succedendo oggi.',
    'dashboard.overview': 'Panoramica piattaforma',
    'dashboard.quickStats': 'Statistiche rapide',
    'dashboard.quickActions': 'Azioni rapide',
    'dashboard.recentActivity': 'Attività recenti',
    'dashboard.totalEmployees': 'Totale dipendenti',
    'dashboard.presentToday': 'Presenti oggi',
    'dashboard.onLeave': 'In permesso',
    'dashboard.tasksCompleted': 'Attività completate',
    'dashboard.pendingRequests': 'Richieste in attesa',
    'dashboard.addEmployee': 'Aggiungi dipendente',
    'dashboard.registerNewMember': 'Registra nuovo membro del team',
    'dashboard.exportReport': 'Esporta report',
    'dashboard.downloadAttendanceData': 'Scarica dati presenze',
    'dashboard.sendNotification': 'Invia notifica',
    'dashboard.notifyTeamMembers': 'Notifica membri del team',
    
    // Schedule
    'schedule.title': 'Gestione programmi',
    'schedule.description': 'Gestisci orari e turni dei dipendenti con drag & drop',
    
    // Attendance
    'attendance.title': 'Gestione presenze',
    'attendance.description': 'Traccia le presenze dei dipendenti con funzionalità avanzate',
    'attendance.personal': 'Personale',
    'attendance.team': 'Squadra',
    'attendance.attendanceRate': 'Tasso di presenza',
    'attendance.avgWorkHours': 'Ore medie',
    'attendance.overtimeHours': 'Ore straordinarie',
    'attendance.presentToday': 'Presenti oggi',
    
    // Members
    'members.title': 'Gestione membri',
    'members.description': 'Gestisci ruoli dipendenti, gruppi e diritti amministrativi. Gli admin hanno accesso completo, i leader gestiscono i loro gruppi e i dipendenti hanno accesso base.',
    'members.totalMembers': 'Totale membri',
    'members.admins': 'Admin',
    'members.leaders': 'Leader',
    'members.employees': 'Dipendenti',
    'members.tabMembers': 'Membri',
    'members.tabGroups': 'Gruppi',
    'members.tabRoleManagement': 'Gestione ruoli',
    'members.tabAdmin': 'Admin',
    'members.searchPlaceholder': 'Cerca membri...',
    'members.allRoles': 'Tutti i ruoli',
    'members.roleAdmin': 'Admin',
    'members.roleLeader': 'Leader',
    'members.roleEmployee': 'Dipendente',
    'members.allStatus': 'Tutti gli stati',
    'members.statusActive': 'Attivo',
    'members.statusInactive': 'Inattivo',
    'members.statusSuspended': 'Sospeso',
    'members.statusTerminated': 'Terminato',
    'members.addMember': 'Aggiungi membro',
    
    // Common
    'common.loading': 'Caricamento...',
    'common.save': 'Salva',
    'common.cancel': 'Annulla',
    'common.delete': 'Elimina',
    'common.edit': 'Modifica',
    'common.add': 'Aggiungi',
    'common.search': 'Cerca',
    'common.filter': 'Filtra',
    'common.export': 'Esporta',
    'common.import': 'Importa',
    'common.yes': 'Sì',
    'common.no': 'No',
    'common.ok': 'OK',
    'common.error': 'Errore',
    'common.success': 'Successo',
    'common.warning': 'Avviso',
    'common.info': 'Informazione',
    'common.adminUser': 'Utente Admin',
    'common.adminEmail': 'admin@azienda.com',
  },
};

// Get current locale from localStorage or default to 'en'
export function getCurrentLocale(): Locale {
  try {
    const saved = localStorage.getItem('locale');
    return (saved as Locale) || 'en';
  } catch {
    return 'en';
  }
}

// Set current locale
export function setCurrentLocale(locale: Locale): void {
  try {
    localStorage.setItem('locale', locale);
    notifyLanguageChange(); // Notify listeners of language change
  } catch {
    // Silently fail if localStorage is not available
  }
}

// Get translation for a key
export function t(key: string, locale?: Locale): string {
  const currentLocale = locale || getCurrentLocale();
  const localeTranslations = translations[currentLocale];
  
  if (!localeTranslations) {
    return key; // Fallback to key if locale not found
  }
  
  const translation = localeTranslations[key];
  if (!translation) {
    // Fallback to English if translation not found
    const englishTranslation = translations.en[key];
    return englishTranslation || key;
  }
  
  return translation;
}

// Get locale config
export function getLocaleConfig(locale: Locale): LocaleConfig | undefined {
  return locales.find(l => l.code === locale);
}

// Get all available locales
export function getAvailableLocales(): LocaleConfig[] {
  return locales;
}
