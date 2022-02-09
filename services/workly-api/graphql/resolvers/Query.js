const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const hello = () => "Hello";

const users = async () => {
    return prisma.user.findMany();
};

module.exports = {
    hello,
    users
};