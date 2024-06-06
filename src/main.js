const core = require('@actions/core');
const {validateInputArguments} = require('./utils/validator');
const {validatableSchemas} = require('./utils/schema/schemaUtils');
const {checkout} = require('./utils/checkout');
const {upload} = require('./api/upload');

/**
 * @description This function executes the SBOM Workspace GitHub Action Sequence.
 * @note The action expects arguments to either come aggregated or non-aggregated. When the `args` input is asserted, its values are prioritized. Otherwise, the expected input structure is recreated for validation purposes.
 */
async function main() {
    try {
        // Validate the inputs
        let args = core.getInput('args'), schemaToValidate = validatableSchemas.AGGREGATED;
        const secretParameters = ['sn-sbom-user', 'sn-sbom-password', 'sn-instance-url', 'gh-token'];
        const secrets = secretParameters.reduce((acc, arg) => ({...acc, [arg]: core.getInput(arg)}), {});
        if (!args) {
            const parameters = ['provider', 'repository', 'path', 'gh-account-owner'];
            args = parameters.reduce((acc, arg) => ({...acc, [arg]: core.getInput(arg)}), {});
            schemaToValidate = validatableSchemas.DIRECT;
        }
        validateInputArguments(args, schemaToValidate);

        if (args.provider === 'repository') {
            // Clone repository contents
            const token = core.getInput('gh-token');
            const checkoutOptions = {
                token,
                repo: args.repository,
                path: args.path,
                owner: args["gh-account-owner"]
            }
            const document = await checkout(checkoutOptions);
            const uploadOptions = {
                document,
                snInstanceUrl: secrets['sn-instance-url'],
                snUsername: secrets['sn-sbom-user'],
                snPassword: secrets['sn-sbom-password']
            };
            const data = await upload(uploadOptions);
            console.log(`output: ${JSON.stringify(data)}`);
        }

        core.setOutput("time", "ABC");
    } catch (error) {
        core.setFailed(error.message);
    }
}

main().then(resp => console.log(resp));
