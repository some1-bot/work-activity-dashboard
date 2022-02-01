var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { ApolloServer } = require('apollo-server-express');
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

const users = [
    {
        id: '1',
        name: 'Jane Villanueva'
    },
    {
        id: '1',
        name: 'Rafael Solano'
    },
]

const typeDefs =`
type Query{
    hello: String!
    users: [User!]!
}

type User {
    id: ID!
    name: String!
}
`,
    resolvers = {
        Query: {
            hello: () => "Hello",
            users: async() => {
                const allUsers = await prisma.user.findMany();
                return allUsers;
            } 
        },
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
