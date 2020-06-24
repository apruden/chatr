import 'reflect-metadata'
import express from 'express'
import path from 'path'
import { createServer } from 'http'
import passport from 'passport'
import passportJWT from 'passport-jwt'
import passportLocal from 'passport-local'
import jwt from 'jsonwebtoken'
import { buildSchema } from 'type-graphql'
import { ApolloServer } from 'apollo-server-express'
import { log } from './logger'
import {
  MessageResolver,
  MatchResolver,
  ProfileResolver,
  NotificationResolver,
  AccountResolver,
  RegistrationResolver,
} from './resolvers'
import { PgPubSub } from './pubsub'
import { pool } from './db'

const { Strategy: JwtStrategy, ExtractJwt } = passportJWT
const { Strategy: LocalStrategy } = passportLocal

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      const res = await pool.query(`SELECT id FROM accounts WHERE oid = $1`, [
        email,
      ])
      const user = res.rows ? { id: res.rows[0].id } : { oid: email }

      done(null, user)
    }
  )
)

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'secret',
    },
    (payload, done) => {
      done(null, payload)
    }
  )
)

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.post('/login', function (req, res, next) {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(400).json({
        message: 'Something is not right',
        user: user,
      })
    }

    req.login(user, { session: false }, (err) => {
      if (err) {
        res.send(err)
      }

      const token = jwt.sign(user, 'secret')

      return res.json({ user, token })
    })
  })(req, res)
})

//app.use('/graphql', passport.authenticate('jwt', { session: false }))

buildSchema({
  resolvers: [
    AccountResolver,
    MatchResolver,
    MessageResolver,
    NotificationResolver,
    ProfileResolver,
    RegistrationResolver,
  ],
  emitSchemaFile: path.resolve(__dirname, 'schema.gql'),
  dateScalarMode: 'isoDate',
  pubSub: new PgPubSub(),
  validate: false,
}).then((schema) => {
  const server = new ApolloServer({
    schema,
    playground: true,
    context: ({ req }) => {
      return { req, user: {id: 'foo'} }
    },
  })

  const httpServer = createServer(app)
  server.applyMiddleware({ app })
  server.installSubscriptionHandlers(httpServer)

  httpServer.listen({ port: 4000 }, () => {
    log.info(`Server ready at http://localhost:4000${server.graphqlPath}`)
  })
})
