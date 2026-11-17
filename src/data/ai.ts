/**
 * Sección IA. Pensada para crecer: hoy tiene el flujo de trabajo; más adelante pueden sumarse
 * cursos o proyectos con IA como nuevas subsecciones (05.2, 05.3…).
 */

export const aiIntro = {
  title: 'La IA acelera.',
  titleEm: 'El criterio decide.',
  lede: 'Sigo de cerca la evolución de las herramientas y los flujos de trabajo con IA, y adopto los que mejoran el resultado. Hoy trabajo con Claude Code orquestando agentes que planifican, implementan y prueban en paralelo, siempre bajo mi revisión. El objetivo no es escribir más código, sino entregar software más sólido en menos tiempo.',
};

export interface Principle {
  title: string;
  body: string;
}

export const principles: Principle[] = [
  {
    title: 'Contexto preciso',
    body: 'Cada agente recibe solo la información que necesita: respuestas más certeras y un uso eficiente de los recursos del modelo.',
  },
  {
    title: 'Trabajo en paralelo',
    body: 'Planificación, implementación y pruebas avanzan a la vez, coordinadas por un orquestador.',
  },
  {
    title: 'Revisión humana',
    body: 'Nada se integra sin mi revisión: la IA propone, yo decido.',
  },
  {
    title: 'Código mantenible',
    body: 'Cambios consistentes, probados y documentados, para no acumular deuda técnica.',
  },
];

/* ---------- Simulación de la consola (ilustrativa, no son métricas reales) ---------- */

export const demoTask = 'claude "agregar filtros y exportación a CSV al listado de pedidos"';

export interface Lane {
  id: string;
  role: string;
  log: string[];
  /** Porcentaje de contexto que usa al terminar: chico a propósito (contexto acotado). */
  ctx: number;
}

export const lanes: Lane[] = [
  {
    id: 'plan',
    role: 'Analiza y define el alcance',
    log: ['lee src/pedidos/ · 14 archivos', 'detecta 3 puntos de cambio', 'plan listo'],
    ctx: 18,
  },
  {
    id: 'ui',
    role: 'Interfaz',
    log: ['crea PedidosFiltros.vue', 'sincroniza filtros con la URL', 'componente listo'],
    ctx: 24,
  },
  {
    id: 'api',
    role: 'Backend',
    log: ['GET /pedidos?estado&desde', 'exporta CSV en streaming', 'endpoint listo'],
    ctx: 21,
  },
  {
    id: 'tests',
    role: 'Pruebas',
    log: ['escribe 12 casos nuevos', 'corre la suite · 48/48', 'cobertura 91 %'],
    ctx: 15,
  },
];

export const demoReview = 'diff +212 −41 · lint ✓ · tipos ✓ · tests 48/48 ✓';
export const demoVerdict = 'revisado y aprobado por Santiago → main';
