export type CaptacionVendedor = Readonly<{
	nombre: string;
	telefono: string;
	email?: string;
	tituloPropiedad: string;
	descripcionPropiedad: string;
	precioEstimado?: number;
}>;
