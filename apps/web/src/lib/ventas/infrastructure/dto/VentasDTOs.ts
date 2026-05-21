export type ApiSuccessResponse<T> = Readonly<{
	success: true;
	data: T;
}>;

export type LeadPipelineDTO = Readonly<{
	id: string;
	nombre: string;
	estado: string;
	tipo: string;
	citasCount: number;
}>;
