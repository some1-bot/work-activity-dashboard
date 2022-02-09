/**
 * @typedef {import('@prisma/client').PrismaClient} Prisma
 */

/**
 * Context for the resolvers
 * @typedef {Object} context
 * @property {Prisma} prisma
 */
require('dotenv').config()
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { ApolloServer } = require('apollo-server-express');
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const Query = require('./graphql/resolvers/Query');
const Mutation = require('./graphql/resolvers/Mutation');

const prisma = new PrismaClient();

const typeDefs = fs.readFileSync(
    path.join(__dirname, 'graphql', 'schema.graphql'),
    'utf-8'
);

const resolvers = {
    Query,
    Mutation
};
/**
 * Create the context for resolvers
 * @param {express.Request} req Express Request
 * @param {express.Response} res Express ResponseData
 * @returns {context} context
 */
function createContext(req, res) {

    return { prisma };
}

async function startApolloServer(app, httpServer) {
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        context: ({ req, res }) => createContext(req, res),
        plugins: [ApolloServerPluginDrainHttpServer({ httpServer })]
    });


    await server.start();
    server.applyMiddleware({
        app
    });

    return server;
}

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = { app, startApolloServer };
