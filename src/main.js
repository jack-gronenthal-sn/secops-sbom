const core = require('@actions/core');
const {validateInputArguments, validateDocument} = require('./utils/validator');
const {validatableSchemas} = require('./utils/schema/schemaTypes');
const {providerTypes} = require('./utils/providerTypes');
const {checkout} = require('./utils/checkout');
const {upload} = require('./api/upload');

/**
 * @description This function executes the SBOM Workspace GitHub Action Sequence.
 * @note The action expects arguments to either come aggregated or non-aggregated. When the `args` input is asserted, its values are prioritized. Otherwise, the expected input structure is recreated for validation purposes.
 */
async function main() {
    try {
        // Validate the inputs
        const secretParameters = ['sn-sbom-user', 'sn-sbom-password', 'sn-instance-url', 'gh-token'];
        const secrets = secretParameters.reduce((acc, arg) => ({...acc, [arg]: core.getInput(arg)}), {});
        const parameters = ['provider', 'repository', 'path', 'gh-account-owner', 'document', 'validateDocument' ];
        const args = parameters.reduce((acc, arg) => ({...acc, [arg]: core.getInput(arg)}), {});
        validateInputArguments(args);

        /**
         * Checks out the provider GitHub repository and returns the specified SBOM document.
         * @returns {Promise<*>} The SBOM document pointed to by the configured file path.
         */
        const repository = async () => {
            // Clone repository contents
            const token = core.getInput('gh-token');
            const checkoutOptions = {
                token,
                repo: args.repository,
                path: args.path,
                owner: args["gh-account-owner"]
            }
            return await checkout(checkoutOptions);
        }

        const payload = () => args.document;

        let document;
        switch(args.provider) { // Allows for easily extending to more provider options.
            case providerTypes.REPOSITORY:
                document = await repository();
                break;

            case providerTypes.PAYLOAD:
                document = payload();
                break;
        }

        if(ags.validateDocument) { validateDocument(document); }

        const uploadOptions = {
            document,
            snInstanceUrl: secrets['sn-instance-url'],
            snUsername: secrets['sn-sbom-user'],
            snPassword: secrets['sn-sbom-password']
        };
        return await upload(uploadOptions);
    } catch (error) {
        core.setFailed(error.message);
    }
}

main().then(resp => console.log(resp));
