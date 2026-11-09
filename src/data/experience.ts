export interface Role {
  company: string;
  role: string;
  start: string;
  startISO: string;
  /** Fin en formato AAAA-MM (vacío si es el trabajo actual). */
  endISO?: string;
  end: string;
  current: boolean;
  summary: string;
}

export const experience: Role[] = [
  {
    company: 'Tandem Digital',
    role: 'Full Stack Developer',
    start: 'Abr 2025',
    startISO: '2025-04',
    end: 'Actualidad',
    current: true,
    summary: 'Sistemas web para el sector salud. Vue.js, Node.js, Express y SQL Server.',
  },
  {
    company: 'Freelance',
    role: 'Full Stack Developer',
    start: 'Sep 2024',
    startISO: '2024-09',
    end: 'Actualidad',
    current: true,
    summary: 'Relevamiento de requerimientos y desarrollo full stack para clientes.',
  },
  {
    company: 'SUINFI',
    role: 'Frontend Developer',
    start: 'Ene 2024',
    startISO: '2024-01',
    end: 'Ago 2024',
    endISO: '2024-08',
    current: false,
    summary: 'Aplicaciones web, landing pages y sistemas de gestión con React y Angular.',
  },
];
