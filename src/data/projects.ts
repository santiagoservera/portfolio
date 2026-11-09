import type { ImageMetadata } from 'astro';
import motorosShot from '../assets/projects/motoros.png';
import diParolaShot from '../assets/projects/di-parola.png';
import kodloopShot from '../assets/projects/kodloop.png';
import lubricentroShot from '../assets/projects/lubricentro.png';

export interface Project {
  slug: string;
  name: string;
  url: string;
  domain: string;
  kind: string;
  summary: string;
  /**
   * Captura real del proyecto (recomendado: 1600×1000, .webp o .png).
   * Agregarla en src/assets/projects/<slug>.webp e importarla acá.
   * Mientras sea undefined se renderiza un placeholder ASCII.
   */
  image?: ImageMetadata;
}

export const projects: Project[] = [
  {
    slug: 'kodloop',
    name: 'KodLoop',
    // El dominio sin www no responde; www.kodloop.com sí.
    url: 'https://www.kodloop.com/',
    domain: 'kodloop.com',
    kind: 'Sitio web',
    summary: 'Mi presentación digital ante los clientes de mis trabajos freelance.',
    image: kodloopShot,
  },
  {
    slug: 'motoros',
    name: 'MotorOS',
    url: 'https://motoros.tech/',
    domain: 'motoros.tech',
    kind: 'Sistema de gestión',
    summary: 'Gestión para concesionarias: inventario, clientes, leads, reservas, ventas y procesos internos.',
    image: motorosShot,
  },
  {
    slug: 'di-parola',
    name: 'Di Parola Automotores',
    url: 'https://diparolaautomotores.com/',
    domain: 'diparolaautomotores.com',
    kind: 'Sitio web',
    summary: 'Sitio de una concesionaria automotriz: su marca, sus vehículos y su presencia online.',
    image: diParolaShot,
  },
  {
    slug: 'lubricentro',
    name: 'Lubricentro M&A',
    url: 'https://lubricentromya.vercel.app/',
    domain: 'lubricentromya.vercel.app',
    kind: 'Demo',
    summary: 'Demo que hice para mostrarle a un cliente cómo podía ser el sitio de su lubricentro.',
    image: lubricentroShot,
  },
];
