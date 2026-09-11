// Constants for dynamic microcopy
export const TIME_OF_DAY = {
  morning: 'Buenos días',
  afternoon: 'Buenas tardes', 
  evening: 'Buenas noches',
  night: 'Buenas noches'
} as const;

export const DAY_OF_WEEK = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo'
} as const;

export const MICROCOPY_LIBRARY = {
  // Search placeholders
  'search.placeholder': {
    [TIME_OF_DAY.morning]: `Buenos días, ${userName || 'amigo'}. ¿Qué buscas hoy?`,
    [TIME_OF_DAY.afternoon]: `Buenas tardes, ${userName || 'amigo'}. ¿En qué podemos ayudarte?`,
    [TIME_OF_DAY.evening]: `Buenas noches, ${userName || 'amigo'}. ¿Qué necesitas?`,
    [TIME_OF_DAY.night]: `Buenas noches, ${userName || 'amigo'}. ¿Qué buscas?`
  },
  // Status messages
  'status.searching': {
    [TIME_OF_DAY.morning]: 'Buscando las mejores opciones para ti...',
    [TIME_OF_DAY.afternoon]: 'Analizando tu solicitud...',
    [TIME_OF_DAY.evening]: 'Procesando tu pedido...',
    [TIME_OF_DAY.night]: 'Buscando en nuestra base de datos...'
  },
  'status.no_results': {
    [TIME_OF_DAY.morning]: 'No encontramos resultados. Intenta con otros términos.',
    [TIME_OF_DAY.afternoon]: 'No hay resultados disponibles. Intenta más tarde.',
    [TIME_OF_DAY.evening]: 'No hay coincidencias. ¿Quieres probar otra búsqueda?',
    [TIME_OF_DAY.night]: 'Sin resultados. Intenta con diferentes palabras clave.'
  },
  'status.found': {
    [TIME_OF_DAY.morning]: '¡Perfecto! Encontramos exactamente lo que buscas.',
    [TIME_OF_DAY.afternoon]: '¡Excelente! Hemos encontrado lo que necesitas.',
    [TIME_OF_DAY.evening]: '¡Genial! Ya está disponible para ti.',
    [TIME_OF_DAY.night]: '¡Fantástico! Lo tenemos en stock.'
  },
  // Welcome messages
  'welcome.returning': {
    [TIME_OF_DAY.morning]: `¡Bienvenido de vuelta, ${userName || 'amigo'}!`,
    [TIME_OF_DAY.afternoon]: `¡Hola de nuevo, ${userName || 'amigo'}!`,
    [TIME_OF_DAY.evening]: `¡Buenas noches, ${userName || 'amigo'}!`,
    [TIME_OF_DAY.night]: `¡Qué bueno verte, ${userName || 'amigo'}!`
  },
  'welcome.new': {
    [TIME_OF_DAY.morning]: `¡Bienvenido a GÜELL, ${userName || 'amigo'}!`,
    [TIME_OF_DAY.afternoon]: `¡Hola y bienvenido, ${userName || 'amigo'}!`,
    [TIME_OF_DAY.evening]: `¡Buenas noches y bienvenido, ${userName || 'amigo'}!`,
    [TIME_OF_DAY.night]: `¡Qué bueno conocerte, ${userName || 'amigo'}!`
  }
} as const;
