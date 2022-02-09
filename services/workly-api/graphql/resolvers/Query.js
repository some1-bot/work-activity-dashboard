/**
 * @typedef {import('@prisma/client').PrismaClient} Prisma
 */

/**
 * Context for the resolvers
 * @typedef {Object} context
 * @property {Prisma} prisma
 * @property {String} code
 */

const hello = () => "Hello";
/**
 * 
 * @param {any} parent Parent rosolver
 * @param {any} args Args from req
 * @param {context} context 
 * @returns 
 */
const users = async (parent, args, { prisma }) => {
    return prisma.user.findMany();
};

/**
 * 
 * @param {any} parent Parent rosolver
 * @param {any} args Args from req
 * @param {context} context 
 * @returns 
 */
const github = async (parent, args, context) => {

    return context.code
};

module.exports = {
    hello,
    users,
    github
};