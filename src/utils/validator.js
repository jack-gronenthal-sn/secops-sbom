const aggregatedInputSchema = require('./schema/aggregatedInputs.json');
const directInputSchema = require('./schema/directInputs.json');
const { validatableSchemas } = require('./schema/schemaUtils');
const Ajv = require('ajv');
const ajv = new Ajv();
const {ValidationError} = require('./ErrorTypes');

function validateInputArguments(arguments, schemaToValidate) {
    let validate = ajv.compile(validatableSchemas.AGGREGATED === schemaToValidate ? aggregatedInputSchema : directInputSchema);
    const valid = validate(arguments);
    if (!valid) {
        throw new ValidationError(`An error occurred while validating the input arguments: ${JSON.stringify(arguments, null, 2)}`, validate.errors);
    }
}

module.exports = {validateInputArguments};