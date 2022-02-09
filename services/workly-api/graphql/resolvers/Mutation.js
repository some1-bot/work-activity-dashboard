/**
 * @typedef {import('@prisma/client').PrismaClient} Prisma
 */

/**
 * Context for the resolvers
 * @typedef {Object} context
 * @property {Prisma} prisma
 * @property {String} code
 */
const { GitHubClient } = require('../../utils/githubClient');
const client = new GitHubClient(
    process.env.GITHUB_CLIENTNAME,
    process.env.GITHUB_CLIENTID,
    process.env.GITHUB_SECRET
);

/**
 * 
 * @param {any} parent Parent rosolver
 * @param {any} args Args from req
 * @param {context} context 
 * @returns 
 */
const loginWithGithub = (parent, args, context) => {
    const scopes = [
        "user",
        "public_repo",
        "repo",
        "repo_deployment",
        "repo:status",
        "read:repo_hook",
        "read:org",
        "read:public_key",
        "read:gpg_key",
    ];
    const availableScopes = args.scopes.filter((scope) => scopes.includes(scope));

    return args.isLoggedIn === false
        || args.isLoggedIn === undefined
        || args.isLoggedIn === null
        ? client.getLoginURL(availableScopes)
        : "Not possible!!";
};

module.exports = {
    loginWithGithub
};