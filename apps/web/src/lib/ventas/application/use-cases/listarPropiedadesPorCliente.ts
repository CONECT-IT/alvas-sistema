import { httpClient } from '$lib/shared/http/httpClient';

export async function listarPropiedadesPorCliente(repository: any, idLead: string) {
	// Para simplificar, hacemos el fetch directo ya que el repo no tiene este método aún
	const res = await httpClient.get<{ success: boolean; data: { id: string }[] }>(
		`/api/propiedades?leadId=${encodeURIComponent(idLead)}`
	);
	return (res.data ?? []).map((p) => p.id);
}
