export type UserRol = 'ADMIN' | 'ASESOR';

export class User {
	constructor(
		public readonly id: string,
		public readonly username: string,
		public readonly nombre: string,
		public readonly rol: UserRol,
		public readonly estado: string
	) {}

	get esAdmin(): boolean {
		return this.rol === 'ADMIN';
	}

	get esAsesor(): boolean {
		return this.rol === 'ASESOR';
	}
}
