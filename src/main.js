const core = require('@actions/core');
const github = require('@actions/github');
const { validateInputArguments } = require('./utils/validator');
const { validatableSchemas } = require('./utils/schema/schemaUtils');

/**
 * @description This function executes the SBOM Workspace GitHub Action Sequence.
 * @note The action expects arguments to either come aggregated or non-aggregated. When the `args` input is asserted, its values are prioritized. Otherwise, the expected input structure is recreated for validation purposes.
 */
function main() {
    try {
        const parameters = [ 'provider', 'repository', 'path' ];

        let arguments = core.getInput('args'), schemaToValidate = validatableSchemas.AGGREGATED;
        if(!arguments) {
            arguments = parameters.reduce((acc, arg) => ({ ...acc, [arg]: core.getInput(arg) }), {});
            schemaToValidate = validatableSchemas.DIRECT;
        }

        validateInputArguments(arguments, schemaToValidate);
        core.setOutput("time", "ABC");
    } catch (error) {
        core.setFailed(error.message);
    }
}

main();
