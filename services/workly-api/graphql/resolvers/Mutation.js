/**
 * @typedef {import('@prisma/client').PrismaClient} Prisma
 */

/**
 * Context for the resolvers
 * @typedef {Object} context
 * @property {Prisma} prisma
 */


/**
 * 
 * @param {any} parent Parent rosolver
 * @param {any} args Args from req
 * @param {context} context 
 * @returns 
 */
const loginWithGithub = (parent, args, context) => {
    return "Not implemented";
};


module.exports = {
    loginWithGithub
};