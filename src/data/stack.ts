export type TechId =
  | 'javascript' | 'typescript' | 'vuejs' | 'react' | 'angular' | 'tailwindcss' | 'html5' | 'css3'
  | 'nodejs' | 'express' | 'postgresql' | 'microsoftsqlserver' | 'mongodb' | 'prisma'
  | 'git' | 'github' | 'jira' | 'slack' | 'notion' | 'trello' | 'claude';

export interface Tech {
  id: TechId;
  name: string;
  /** Tecnología principal: va al centro de la órbita. */
  main?: boolean;
}

export interface TechGroup {
  key: string;
  label: string;
  /** Anillo de la órbita donde se ubica el grupo (1 = el más cercano al centro). */
  ring: 1 | 2 | 3;
  items: Tech[];
}

export const stackGroups: TechGroup[] = [
  {
    key: 'front',
    label: 'Frontend',
    ring: 1,
    items: [
      { id: 'vuejs', name: 'Vue.js', main: true },
      { id: 'react', name: 'React' },
      { id: 'tailwindcss', name: 'Tailwind CSS' },
      { id: 'html5', name: 'HTML5' },
      { id: 'css3', name: 'CSS3' },
      { id: 'angular', name: 'Angular' },
    ],
  },
  {
    key: 'lang',
    label: 'Lenguajes',
    ring: 2,
    items: [
      { id: 'javascript', name: 'JavaScript' },
      { id: 'typescript', name: 'TypeScript' },
    ],
  },
  {
    key: 'back',
    label: 'Backend',
    ring: 2,
    items: [
      { id: 'nodejs', name: 'Node.js' },
      { id: 'express', name: 'Express.js' },
    ],
  },
  {
    key: 'data',
    label: 'Datos',
    ring: 2,
    items: [
      { id: 'postgresql', name: 'PostgreSQL' },
      { id: 'microsoftsqlserver', name: 'SQL Server' },
      { id: 'mongodb', name: 'MongoDB' },
      { id: 'prisma', name: 'Prisma ORM' },
    ],
  },
  {
    key: 'tools',
    label: 'Herramientas',
    ring: 3,
    items: [
      { id: 'git', name: 'Git' },
      { id: 'github', name: 'GitHub' },
      { id: 'jira', name: 'Jira' },
      { id: 'slack', name: 'Slack' },
      { id: 'notion', name: 'Notion' },
      { id: 'trello', name: 'Trello' },
    ],
  },
  {
    key: 'ai',
    label: 'IA',
    ring: 3,
    items: [{ id: 'claude', name: 'Claude Code' }],
  },
];

/** Cómo trabajo con IA. */
export const workflow = {
  title: 'Aprendiendo a trabajar mejor con IA',
  body: 'Me gusta seguir aprendiendo cómo sumar la IA a mi forma de trabajar. Hoy uso Claude Code con un enfoque de Spec-Driven Development, y voy probando y adaptando nuevas formas de ordenar los proyectos y ser más eficiente, sin perder el criterio propio.',
  tags: ['Claude Code', 'Spec-Driven Development', 'Orden', 'Eficiencia'],
};
