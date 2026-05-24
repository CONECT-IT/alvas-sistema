CREATE TABLE `integraciones_captaciones_pendientes` (
	`id` text PRIMARY KEY NOT NULL,
	`canal` text NOT NULL,
	`origen` text NOT NULL,
	`nombre` text NOT NULL,
	`telefono` text NOT NULL,
	`email` text NOT NULL,
	`tipo` text NOT NULL,
	`estado` text DEFAULT 'PENDIENTE' NOT NULL,
	`id_propiedad_interes` text,
	`metadata_json` text,
	`razon_duplicado` text,
	`creado_en` text NOT NULL,
	`actualizado_en` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `propiedades` (
	`id` text PRIMARY KEY NOT NULL,
	`titulo` text NOT NULL,
	`descripcion` text NOT NULL,
	`precio` integer NOT NULL,
	`origen` text DEFAULT 'ALVAS' NOT NULL,
	`estado` text DEFAULT 'DISPONIBLE' NOT NULL,
	`id_lead_origen` text,
	`id_cliente_propietario` text,
	`captada_por_asesor_id` text,
	`asesor_responsable_id` text,
	`creado_en` text NOT NULL,
	`actualizado_en` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `usuarios` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`nombre` text DEFAULT 'Usuario' NOT NULL,
	`hash_clave` text NOT NULL,
	`rol` text NOT NULL,
	`estado` text NOT NULL,
	`creado_en` text NOT NULL,
	`actualizado_en` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `usuarios_username_unique` ON `usuarios` (`username`);--> statement-breakpoint
CREATE TABLE `ventas_actividad` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`id_lead` text NOT NULL,
	`evento` text NOT NULL,
	`descripcion` text NOT NULL,
	`fecha` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `ventas_citas` (
	`id` text PRIMARY KEY NOT NULL,
	`id_lead` text NOT NULL,
	`id_propiedad` text,
	`fecha_inicio` text NOT NULL,
	`fecha_fin` text NOT NULL,
	`estado` text NOT NULL,
	`observacion` text
);
--> statement-breakpoint
CREATE TABLE `ventas_clientes` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`email` text NOT NULL,
	`telefono` text NOT NULL,
	`id_asesor` text NOT NULL,
	`id_lead_origen` text,
	`creado_en` text NOT NULL,
	`actualizado_en` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `ventas_contratos` (
	`id` text PRIMARY KEY NOT NULL,
	`id_lead` text,
	`id_cliente` text,
	`id_propiedad` text NOT NULL,
	`fecha_inicio` text NOT NULL,
	`fecha_fin` text NOT NULL,
	`estado` text NOT NULL,
	`creado_en` text NOT NULL,
	`actualizado_en` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `ventas_leads` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`email` text NOT NULL,
	`telefono` text NOT NULL,
	`tipo` text NOT NULL,
	`estado` text NOT NULL,
	`id_asesor` text NOT NULL,
	`id_cliente` text,
	`id_propiedad_interes` text,
	`creado_en` text NOT NULL,
	`actualizado_en` text NOT NULL
);
