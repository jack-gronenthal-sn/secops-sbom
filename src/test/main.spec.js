import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import SbomGithubAction from "../main/main.js";
import sinon from 'sinon';
import { SbomGitHubActionValidationError } from '../main/utils/errorTypes.js';
chai.use(chaiAsPromised);
chai.should();

function mockCollectArguments(argsToInvalidate) {
    let validArgs = {
        "sn-sbom-user": "username",
        "sn-sbom-password": "password",
        "sn-instance-url": "https://service-now.com/",
        "gh-token": "secret-github-token",
        "provider": "repository",
        "repository": "sample-repository",
        "path": "path/in/repo",
        "gh-account-owner": "github-username",
    }
    return sinon.stub(() =>
        Object.keys(validArgs).filter(key => !argsToInvalidate?.includes(key)).reduce((acc, key) => ({ ...acc, [key]: validArgs[key] }), {}));
}

const sampleCheckedOutJson = { sample: "document" };

describe('main.js',  () => {

    afterEach(() => {
        sinon.restore();
    })

    describe('#Providers', () => {

        describe('Repository', () => {
            const repositoryInputArgs = {
                token: "secret-github-token",
                repository: "sample-repository",
                path: "path/in/repo",
                ghAccountOwner: "github-username"
            };
            let mockedAction;

            before(() => {
                mockedAction = new SbomGithubAction();
                let mockedRepositoryProvider = sinon.stub();
                mockedRepositoryProvider.withArgs({
                    token: sinon.match.any,
                    repository: sinon.match.any,
                    path: sinon.match.any,
                    ghAccountOwner: sinon.match.any
                }).returns(sampleCheckedOutJson);
                mockedRepositoryProvider.returns(undefined);
                mockedAction.repository = mockedRepositoryProvider;
            });

            it('Valid arguments', () => {
                let results = mockedAction.repository(repositoryInputArgs);
                results.should.deep.equal(sampleCheckedOutJson);
            });

            ["token", "repository", "path", "ghAccountOwner"].forEach(paramToInvalidate => {
                let invalidRepositoryInputs =
                    Object.entries(repositoryInputArgs)
                        .filter(([key, _]) => paramToInvalidate !== key)
                        .reduce((acc, cur) => ({ ...acc, [cur[0]]: cur[1] }), {})
                it(`Invalid arguments: Missing ${paramToInvalidate}`, () => {
                    let results = mockedAction.repository(invalidRepositoryInputs);
                    (typeof results).should.equal('undefined')
                })
            })


        })
    })

    describe('#Arguments', () => {
        describe('Valid arguments', () => {
            it('All valid arguments', () => {
                let mockedCollectArguments = mockCollectArguments();
                let mockedAction = new SbomGithubAction();
                mockedAction.collectArguments = mockedCollectArguments;
                let results = mockedAction.collectArguments()
                results.should.have.property("sn-sbom-user").eql("username");
                results.should.have.property("sn-sbom-password").eql("password");
                results.should.have.property("sn-instance-url").eql("https://service-now.com/");
                results.should.have.property("gh-token").eql("secret-github-token");
                results.should.have.property("provider").eql("repository");
                results.should.have.property("repository").eql("sample-repository");
                results.should.have.property("path").eql("path/in/repo");
                results.should.have.property("gh-account-owner").eql("github-username");
            })
        })
        describe('Invalid arguments', () => {
            it('Missing sn-sbom-user', () => { // A test to check helper function is valid
                let mockedCollectArguments = mockCollectArguments(['sn-sbom-user']);
                let mockedAction = new SbomGithubAction();
                mockedAction.collectArguments = mockedCollectArguments;
                let results = mockedAction.collectArguments()
                results.should.not.have.property("sn-sbom-user").eql("username");
            });

            describe('Assert all required parameters fail validation if missing', () => {
                const commonRequiredParameters = ["sn-sbom-user", "provider", "sn-sbom-password", "sn-instance-url"];
                const repositoryProviderTypeRequiredParameters = ["gh-account-owner", "repository", "path", "gh-token"];
                ["repository"].forEach(providerType => {
                    let providerTypeSpecificParameters = providerType === "repository" ? repositoryProviderTypeRequiredParameters : [];
                    const allRequiredParameters = [...commonRequiredParameters, ...providerTypeSpecificParameters];

                    describe(`Provider Type: ${providerType}`, () => {
                        allRequiredParameters.forEach((requiredParameter, idx) => {
                            it(`Fails validation Check: ${requiredParameter}`, async () => { // A test to check if a required property is missing, validation fails
                                let mockedCollectArguments = mockCollectArguments([requiredParameter]);
                                let mockedAction = new SbomGithubAction();
                                mockedAction.collectArguments = mockedCollectArguments;
                                await mockedAction.main().catch(error => {
                                    error.should.be.an.instanceOf(SbomGitHubActionValidationError)
                                    error.validationErrors.should.satisfy(validationErrors => validationErrors.some(obj => obj.params.missingProperty === requiredParameter))
                                })
                            })
                        })
                    })
                });
            })
        })
    })

    describe('#Upload', () => {

        const uploadInputArgs = {
            document: sampleCheckedOutJson,
            snInstanceUrl: "https://service-now.com/",
            snUsername: "username",
            snPassword: "password"
        }
        const successfulUploadResponseBody = {
            "result": {
                "status": "success",
                "message": "Queued for processing.",
                "bomRecordId": "b44a32f48776c610c9ca0d07cebb35c0"
            }
        }
        let mockedAction;

        beforeEach(() => {
           let uploadMock = sinon.stub();
           uploadMock.withArgs({
               document: sinon.match.any,
               snInstanceUrl: sinon.match.any,
               snUsername: sinon.match.any,
               snPassword: sinon.match.any,
           }).resolves(successfulUploadResponseBody);
           uploadMock.resolves({});
           mockedAction = new SbomGithubAction();
           mockedAction.upload = uploadMock;
        });

        it('Valid arguments', async () => {
            let results = await mockedAction.upload(uploadInputArgs);
            results.result.should.have.ownProperty('status');
            results.result.status.should.equal('success');
        });

        ["document", "snInstanceUrl", "snUsername", "snPassword"].forEach(paramToInvalidate => {
            let invalidRepositoryInputs =
                Object.entries(uploadInputArgs)
                    .filter(([key, _]) => paramToInvalidate !== key)
                    .reduce((acc, cur) => ({ ...acc, [cur[0]]: cur[1] }), {})
            it(`Invalid arguments: Missing ${paramToInvalidate}`, async () => {
                let results = mockedAction.repository(invalidRepositoryInputs);
                results.should.eventually.eql({});
            })
        })
    })
});