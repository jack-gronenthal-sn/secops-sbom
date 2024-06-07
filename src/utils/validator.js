const aggregatedInputSchema = require('./schema/aggregatedInputs.json');
const directInputSchema = require('./schema/directInputs.json');
const {validatableSchemas} = require('./schema/schemaTypes');
const Ajv = require('ajv');
const ajv = new Ajv();
const {ValidationError} = require('./errorTypes');

function validateInputArguments(args) {
    let validate = ajv.compile(directInputSchema);
    const valid = validate(args);
    if (!valid) {
        throw new ValidationError(`An error occurred while validating the input arguments: ${JSON.stringify(args, null, 2)}`, validate.errors);
    }
}

async function validateSpdxDocument(document, version) {
    return true;
}

async function validateCyclonedxDocument(document, version) {
    return true;
}

async function validateDocument(document) {
    const type = Object.hasOwn(document, "bomFormat") ? "CycloneDX" :
        (Object.hasOwn(document, "SPDXID") ? "SPDX" : undefined);
    if(type === undefined) { throw new Error('Invalid SBOM document type provided. SBOM Workspace only accepts the SPDX and CycloneDX specifications.'); }
    const version = type === "CycloneDX" ? document.specVersion : document.spdxVersion;
    const isValid = type === "CycloneDX" ?
        await validateCyclonedxDocument(document, version) :
        await validateSpdxDocument(document, version);
    return isValid;
}

module.exports = {validateInputArguments, validateDocument};