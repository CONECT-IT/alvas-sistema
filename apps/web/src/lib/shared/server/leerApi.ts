type ApiResp<T> = { success: true; data: T } | { success: false; message?: string };

export async function leerApi<T>(response: Response, fallback: T | null): Promise<ApiResp<T>> {
	if (!response.ok) {
		console.warn(`leerApi: API respondió ${response.status} en ${response.url}`);
		return { success: true, data: fallback as T };
	}

	try {
		return (await response.json()) as ApiResp<T>;
	} catch {
		const text = await response.text().catch(() => '(no se pudo leer body)');
		console.warn(
			`leerApi: respuesta no JSON en ${response.url} — "${text.slice(0, 200)}"`
		);
		return { success: true, data: fallback as T };
	}
}

export async function leerApiConMsg<T>(
	response: Response,
	fallback: T,
	context: string
): Promise<ApiResp<T>> {
	if (!response.ok) {
		console.warn(`${context}: API respondió ${response.status} en ${response.url}`);
		return { success: false, message: `API respondió ${response.status}` };
	}

	try {
		return (await response.json()) as ApiResp<T>;
	} catch {
		const text = await response.text().catch(() => '(no se pudo leer body)');
		console.warn(`${context}: respuesta no JSON en ${response.url} — "${text.slice(0, 200)}"`);
		return { success: false, message: 'Respuesta inválida del servidor' };
	}
}

export async function fetchJson<T>(
	input: string | URL | globalThis.Request,
	init?: RequestInit,
	fallback?: T
): Promise<ApiResp<T>> {
	try {
		const response = await fetch(input, init);
		return leerApi<T>(response, fallback as T);
	} catch {
		console.warn(`fetchJson: error de red en ${input}`);
		return { success: true, data: fallback as T };
	}
}
