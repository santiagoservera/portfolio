export const profile = {
  name: 'Santiago Servera',
  firstName: 'Santiago',
  lastName: 'Servera',
  role: 'Full Stack Developer',
  location: 'San Juan, Argentina',
  coords: '31.53°S · 68.52°O',
  email: 'santiagoservera21@gmail.com',
  links: {
    github: 'https://github.com/santiagoservera',
    linkedin: 'https://www.linkedin.com/in/santiago-servera/',
  },
  /** Ruta del CV dentro de /public. Si el archivo no existe, el enlace se muestra como "próximamente". */
  cvPath: '/cv/santiago-servera-cv.pdf',
  description:
    'Santiago Servera — Full Stack Developer en San Juan, Argentina. Desarrollo aplicaciones web y sistemas de gestión con Vue.js, Node.js y TypeScript.',
} as const;

export const nav = [
  { id: 'sobre-mi', label: 'Sobre mí' },
  { id: 'experiencia', label: 'Experiencia' },
  { id: 'proyectos', label: 'Proyectos' },
  { id: 'tecnologias', label: 'Tecnologías' },
  { id: 'contacto', label: 'Contacto' },
] as const;
