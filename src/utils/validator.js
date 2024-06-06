const schema = require('./schema/inputs.json');
const Ajv = require('ajv');
const ajv = new Ajv();
const validate = ajv.compile(schema);
const {ValidationError} = require('./ErrorTypes');

function validateInputArguments(arguments) {
    console.log(arguments);
    const valid = validate(arguments);
    if (!valid) {
        throw new ValidationError(`An error occurred while validating the input arguments: ${JSON.stringify(arguments, null, 2)}`, validate.errors);
    }
}

module.exports = {validateInputArguments};