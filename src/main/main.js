import core from '@actions/core';
import {validateInputArguments} from './utils/validator.js';
import {providerTypes} from './utils/providerTypes.js';
import {checkout} from './utils/checkout.js';
import dotenv from "dotenv";
dotenv.config();

export default class SbomGithubAction {

    /**
     * @description This function executes the SBOM Workspace GitHub Action Sequence.
     * @note The action expects arguments to either come aggregated or non-aggregated. When the `args` input is asserted, its values are prioritized. Otherwise, the expected input structure is recreated for validation purposes.
     */
    async main() {
        try {
            let args = this.collectArguments()
            validateInputArguments(args);

            let document, errorMessage;
            switch(args.provider) { // Allows for easily extending to more provider options.
                case providerTypes.REPOSITORY:
                    document = await this.repository({
                        token: args['gh-token'],
                        repository: args['repository'],
                        path: args['path'],
                        ghAccountOwner: args['gh-account-owner'],
                    });
                    break;

                case providerTypes.REMOTE:
                    errorMessage = "Current version (v1.0.0) does not support remote provider type.";

                default:
                    errorMessage = errorMessage ?? `Unsupported provider type observed (${args.provider}).`
                    throw new Error(errorMessage);

            }

            const uploadOptions = {
                document,
                snInstanceUrl: args['sn-instance-url'],
                snUsername: args['sn-sbom-user'],
                snPassword: args['sn-sbom-password']
            };
            return await this.upload(uploadOptions);
        } catch (error) {
            core.setFailed(error.message);
            throw error;
        }
    }

    /**
     * Assembles the requisite input arguments provided to the GitHub Action.
     * @returns {*} An object of secret and public arguments.
     */
    collectArguments() {
        const secretParameters = ['sn-sbom-user', 'sn-sbom-password', 'sn-instance-url', 'gh-token'];
        const secrets = secretParameters.reduce((acc, arg) => ({...acc, [arg]: core.getInput(arg)}), {});
        const publicParameters = ['provider', 'repository', 'path', 'gh-account-owner' ];
        const parameters = publicParameters.reduce((acc, arg) => ({...acc, [arg]: core.getInput(arg)}), {});
        return { ...secrets, ...parameters }
    }

    /**
     * Checks out the provider GitHub repository and returns the specified SBOM document.
     * @returns {Promise<*>} The SBOM document pointed to by the configured file path.
     */
    async repository ({ token, repository, path, ghAccountOwner }) {
        // Clone repository contents
        const checkoutOptions = {
            token,
            repo: repository,
            path: path,
            owner: ghAccountOwner
        }

        // Only perform checkout if all required inputs are provided
        if(Object.values(checkoutOptions).reduce((acc, cur) => acc && (cur !== undefined), true)) {
            return await checkout(checkoutOptions);
        }
    }

    /**
     * Performs the upload to the SBOM Workspace.
     * @param document
     * @param snInstanceUrl
     * @param snUsername
     * @param snPassword
     * @returns {Promise<any>}
     */
    async upload({ document, snInstanceUrl, snUsername, snPassword }) {
        let baseUrl = new URL(snInstanceUrl);
        let uploadUrl = new URL('/api/sbom/core/upload', baseUrl);

        return await fetch(uploadUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${Buffer.from(snUsername + ":" + snPassword).toString('base64')}`
            },
            body: JSON.stringify(document)
        })
            .then(response => response.json())
            .then(data => data)
            .catch(error => {
                console.log(error);
                throw error;
            })
    }
}

if(process.env.NODE_ENV != 'test') {
    let action = new SbomGithubAction();
    action.main().then(resp => console.log(resp));
}