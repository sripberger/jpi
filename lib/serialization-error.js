import { JpiError } from 'jpi-errors';

export class SerializationError extends JpiError {
	static getDefaultMessage() {
		return 'Response could not be serialized to JSON';
	}
}
