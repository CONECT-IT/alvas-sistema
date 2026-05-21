export interface LoginRequestDTO {
	username: string;
	clave: string;
}

export interface LoginResponseDTO {
	authToken: string;
	refreshToken: string;
	usuario: {
		id: string;
		username: string;
		rol: 'admin' | 'asesor';
	};
}
