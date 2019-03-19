import { RegistrationError } from './registration-error';

export class FinalizedError extends RegistrationError {
	static getDefaultMessage() {
		return 'Cannot register to a finalized middleware sort';
	}
}
