const core = require('@actions/core');
const github = require('@actions/github');
const { validateInputArguments } = require('./utils/validator');

function main() {
    try {
        const parameters = [ 'args', 'provider', 'repository', 'path' ];
        const arguments = parameters.reduce((acc, arg) => ({ ...acc, [arg]: core.getInput(arg) }), {});
        validateInputArguments(arguments);
        core.setOutput("time", "ABC");
    } catch (error) {
        core.setFailed(error.message);
    }
}

main();
