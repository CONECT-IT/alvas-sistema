CREATE TABLE `ventas_contratos` (
	`id` text PRIMARY KEY NOT NULL,
	`id_cliente` text NOT NULL,
	`id_propiedad` text NOT NULL,
	`fecha_inicio` text NOT NULL,
	`fecha_fin` text NOT NULL,
	`estado` text NOT NULL,
	`creado_en` text NOT NULL,
	`actualizado_en` text NOT NULL
);
