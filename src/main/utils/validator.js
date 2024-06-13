// import aggregatedInputSchema from './schema/aggregatedInputs.json' with { type: "json" };
// import directInputSchema from './schema/directInputs.json' with { type: "json" };
const { default: directInputSchema } = await import("./schema/directInputs.json", {
    assert: { type: "json" },
});
import {validatableSchemas} from './schema/schemaTypes.js';
import Ajv from 'ajv';
const ajv = new Ajv();
import {SbomGitHubActionValidationError} from './errorTypes.js';

export function validateInputArguments(args) {
    let validate = ajv.compile(directInputSchema);
    const valid = validate(args);
    if (!valid) {
        throw new SbomGitHubActionValidationError(`An error occurred while validating the input arguments: ${JSON.stringify(args, null, 2)}`, validate.errors);
    }
}

async function validateSpdxDocument(document, version) {
    return true;
}

async function validateCyclonedxDocument(document, version) {
    return true;
}

export async function validateDocument(document) {
    const type = Object.hasOwn(document, "bomFormat") ? "CycloneDX" :
        (Object.hasOwn(document, "SPDXID") ? "SPDX" : undefined);
    if(type === undefined) { throw new Error('Invalid SBOM document type provided. SBOM Workspace only accepts the SPDX and CycloneDX specifications.'); }
    const version = type === "CycloneDX" ? document.specVersion : document.spdxVersion;
    const isValid = type === "CycloneDX" ?
        await validateCyclonedxDocument(document, version) :
        await validateSpdxDocument(document, version);
    return isValid;
}