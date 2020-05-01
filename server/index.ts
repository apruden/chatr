import "reflect-metadata"
import express from 'express'
import path from 'path'
import { buildSchema } from 'type-graphql'
import { ApolloServer } from 'apollo-server-express'
import { MessageResolver } from "./resolvers"
import { FooPubSub } from "./pubsub"
import { createServer } from 'http'

const app = express()

buildSchema({
    resolvers: [MessageResolver],
    emitSchemaFile: path.resolve(__dirname, "schema.gql"),
    pubSub: new FooPubSub()
}).then(schema => {
    const server = new ApolloServer({
        schema,
        playground: true
    })

    const httpServer = createServer(app)
    server.applyMiddleware({ app })
    server.installSubscriptionHandlers(httpServer)

    httpServer.listen({ port: 4000 }, () => {
        console.log(`Server ready at http://localhost:4000${server.graphqlPath}`)
    })
})
