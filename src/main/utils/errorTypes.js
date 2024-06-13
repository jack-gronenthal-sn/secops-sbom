export class SbomGitHubActionValidationError extends Error {
    constructor(message, errors) {
        super(message);
        console.error(`AJV Validation Error: ${JSON.stringify({errors}, null, 2)}`);
        this.name = this.constructor.name;
        this.validationErrors = errors;
        Error.captureStackTrace(this, this.constructor);
    }
}