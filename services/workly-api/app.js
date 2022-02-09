var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { ApolloServer } = require('apollo-server-express');
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core');
const fs = require('fs');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const Query = require('./graphql/resolvers/Query');
const Mutation = require('./graphql/resolvers/Mutation');

const typeDefs = fs.readFileSync(
    path.join(__dirname, 'graphql', 'schema.graphql'),
    'utf-8'
);

const resolvers = {
    Query,
    Mutation
};

async function startApolloServer(app, httpServer) {
    const server = new ApolloServer({
        typeDefs,
        resolvers,
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
