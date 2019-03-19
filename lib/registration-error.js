import { JpiError } from 'jpi-errors';

export class RegistrationError extends JpiError {
	static getDefaultMessage() {
		return 'Middleware registration error';
	}
}
