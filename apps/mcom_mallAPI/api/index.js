const main = require('../dist/main');

module.exports = async (req, res) => {
    // This loads the compiled NestJS app
    const bootstrap = main.default || main;

    // This executes the serverless handler we created in main.ts
    return bootstrap(req, res);
};