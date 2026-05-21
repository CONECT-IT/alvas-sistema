import { HttpPropiedadRepository } from './HttpPropiedadRepository';

const apiUrl = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8787';

export const propiedadRepository = new HttpPropiedadRepository(apiUrl);
