const core = require('@actions/core');
const github = require('@actions/github');

try {
    // `who-to-greet` input defined in action metadata file
    const providerType = core.getInput('provider');


    const arguments = { providerType };

    console.log(`Arguments ${JSON.stringify(arguments, null, 2)}`);
    core.setOutput("time", "ABC");

    // Get the JSON webhook payload for the event that triggered the workflow
    // const payload = JSON.stringify(github.context.payload, undefined, 2)
    // console.log(`The event payload: ${payload}`);
} catch (error) {
    core.setFailed(error.message);
}
