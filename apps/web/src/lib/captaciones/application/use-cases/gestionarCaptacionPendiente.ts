import type { CaptacionRepository } from '../ports/CaptacionRepository';

export function revisarCaptacion(repository: CaptacionRepository, idCaptacion: string) {
	return repository.revisar(idCaptacion);
}

export function marcarCaptacionDuplicada(
	repository: CaptacionRepository,
	idCaptacion: string,
	razon: string
) {
	return repository.marcarDuplicada(idCaptacion, razon);
}

export function rechazarCaptacion(
	repository: CaptacionRepository,
	idCaptacion: string,
	razon?: string
) {
	return repository.rechazar(idCaptacion, razon);
}

export function convertirCaptacion(
	repository: CaptacionRepository,
	idCaptacion: string,
	idAsesor?: string
) {
	return repository.convertir(idCaptacion, idAsesor);
}
