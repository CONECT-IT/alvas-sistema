export type UserRol = 'admin' | 'asesor';

export class User {
	constructor(
		public readonly id: string,
		public readonly username: string,
		public readonly nombre: string,
		public readonly rol: UserRol,
		public readonly estado: string
	) {}

	get esAdmin(): boolean {
		return this.rol === 'admin';
	}

	get esAsesor(): boolean {
		return this.rol === 'asesor';
	}
}
