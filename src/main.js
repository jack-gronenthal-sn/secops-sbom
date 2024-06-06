const core = require('@actions/core');
const github = require('@actions/github');
const { validateInputArguments } = require('./utils/validator');

/**
 * @description This function executes the SBOM Workspace GitHub Action Sequence.
 * @note The action expects arguments to either come aggregated or non-aggregated. When the `args` input is asserted, its values are prioritized. Otherwise, the expected input structure is recreated for validation purposes.
 */
function main() {
    try {
        const parameters = [ 'provider', 'repository', 'path' ];

        let arguments = core.getInput('args');
        if(!arguments) {
            arguments = parameters.reduce((acc, arg) => ({ ...acc, [arg]: core.getInput(arg) }), {});
        }

        validateInputArguments(arguments);
        core.setOutput("time", "ABC");
    } catch (error) {
        core.setFailed(error.message);
    }
}

main();
