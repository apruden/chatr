import {
  Resolver,
  Query,
  Mutation,
  Arg,
  Subscription,
  Root,
  Ctx,
  ArgsType,
  Field,
  Int,
  Args,
} from 'type-graphql'
import {
  Message,
  MessageInput,
  Notification,
  ActionInput,
  Profile,
  Match,
  ProfileInput,
  Account,
  Criterion,
  Relation,
  AccountInput,
  CriterionInput,
  Registration,
  RegistrationInput,
} from './domain'
import { plainToClass } from 'class-transformer'
import { pool } from './db'
import { ClassType } from 'class-transformer/ClassTransformer'
import jwt from 'jsonwebtoken'

function newInstance<T>(cls: ClassType<T>, plain: any): T {
  return plainToClass(cls, plain)
}

@ArgsType()
class PaginationArgs {
  @Field((type) => Int) offset: number = 0
  @Field((type) => Int) limit: number = 25
}

@ArgsType()
class MessagesArgs extends PaginationArgs {
  @Field() from: string
}

@ArgsType()
class SearchArgs extends PaginationArgs {
  @Field() criterion: CriterionInput
}

const createAccount = async (oid: string, newAccount: AccountInput) => {
  const account = newInstance(Account, newAccount)
  const res = await pool.query(
    'INSERT INTO accounts(id, oid, data) VALUES ($1, $2, $3)',
    [newAccount.id, oid, newAccount]
  )

  return account
}

const saveAccount = async (newAccount: AccountInput) => {
  const account = newInstance(Account, newAccount)
  const res = await pool.query('UPDATE accounts SET data = $1 WHERE id = $2', [
    newAccount,
    newAccount.id,
  ])

  return account
}

const saveProfile = async (me: string, newProfile: ProfileInput) => {
  const profile = newInstance(Profile, newProfile)
  const res = await pool.query(
    'INSERT INTO profiles(id, data) VALUES ($1, $2) ON CONFLICT id DO UPDATE data = $2',
    [me, profile]
  )

  return profile
}

@Resolver((of) => Registration)
export class RegistrationResolver {
  @Query((returns) => Registration)
  async register(
    @Ctx() context: any,
    @Arg('data') data: RegistrationInput
  ): Promise<Registration> {
    const { id: oid } = context.user
    const account = await createAccount(oid, data.account)
    const profile = await saveProfile(account.id, data.profile)
    const registration = new Registration()
    registration.token = jwt.sign({ id: account.id }, 'secret')

    return registration
  }
}

@Resolver((of) => Account)
export class AccountResolver {
  @Query((returns) => Account)
  async getAccount(@Ctx() context: any): Promise<Account> {
    const { id: me } = context.user
    const res = await pool.query('SELECT data FROM accounts WHERE id = $1', [
      me,
    ])

    return res.rows.map((row) => plainToClass(Account, row.data))[0] || null
  }

  @Mutation((returns) => Account)
  async updateAccount(@Arg('data') newAccount: AccountInput): Promise<Account> {
    const account = await saveAccount(newAccount)
    return account
  }
}

@Resolver((of) => Match)
export class MatchResolver {
  @Query((returns) => [Match])
  async search(
    @Ctx() context: any,
    @Args() { offset, limit, criterion }: SearchArgs
  ): Promise<Match[]> {
    const year = new Date().getFullYear()
    const { id: to } = context.user
    const res = await pool.query(
      `
      SELECT data FROM profiles as p
        WHERE (p.data -> 'dob')::integer < $1
        AND (p.data -> 'dob')::integer > $2
        AND (p.data ->> 'gender') = $3
        AND ST_Distance((p.data ->> 'location')::geometry, $4::geometry) < $5
        ORDER BY (p.data ->> 'latestActive')
        OFFSET $6 LIMIT $7
      `,
      [
        to,
        year - criterion.ageMin,
        year - criterion.ageMax,
        criterion.gender,
        criterion.location,
        criterion.distance,
        offset,
        limit,
      ]
    )

    return res.rows.map((row) => plainToClass(Match, row.data))
  }
}

@Resolver((of) => Profile)
export class ProfileResolver {
  @Query((returns) => Profile)
  async getProfile(@Arg('id') id: string): Promise<Profile> {
    const res = await pool.query('SELECT data FROM profiles WHERE id = $1', [
      id,
    ])

    return res.rows.map((row) => plainToClass(Profile, row.data))[0]
  }

  @Mutation((returns) => Profile)
  async updateProfile(
    @Ctx() context: any,
    @Arg('data') newProfile: ProfileInput
  ): Promise<Profile> {
    const { id: me } = context.user
    const profile = await saveProfile(me, newProfile)

    return profile
  }
}

@Resolver((of) => Relation)
export class RelationResolver {
  @Query((returns) => Relation)
  async blockUser(
    @Ctx() context: any,
    @Arg('id') id: string
  ): Promise<Relation> {
    const { id: me } = context.user
    const type = 'blocked'
    await pool.query(
      `INSERT INTO relations(subject, target, type) VALUE ($1, $2, $3)`,
      [me, id, type]
    )

    return newInstance(Relation, { subject: me, target: id, type })
  }
}

@Resolver((of) => Message)
export class MessageResolver {
  @Query((returns) => [Message])
  async getLatestMessage(
    @Ctx() context: any,
    @Args() { offset, limit, from }: MessagesArgs
  ): Promise<Message[]> {
    const { id: me } = context.user
    const res = await pool.query(
      `
      SELECT data from messages WHERE id IN (
        SELECT MAX(id) as d FROM messages 
        WHERE (data ->> 'to') = $1
        AND (data ->> 'from') NOT IN (
          SELECT to FROM relations 
          WHERE subject = $1 AND target = $2 AND type = 'blocked'
        )
        GROUP BY (data ->> 'from')
        ORDER BY d DESC
        OFFSET $3 LIMIT $4
      )
      `,
      [me, from, offset, limit]
    )

    return res.rows.map((row) => plainToClass(Message, row.data))
  }

  @Query((returns) => [Message])
  async getMessages(
    @Ctx() context: any,
    @Args() { offset, limit, from }: MessagesArgs
  ): Promise<Message[]> {
    const { id: me } = context.user
    const res = await pool.query(
      `
      SELECT data FROM messages 
      WHERE (data ->> 'to') = $1 
      AND (data ->> 'from') = $2
      WHERE id > $3
      ORDER BY id DESC 
      LIMIT $4
      `,
      [me, from, offset, limit]
    )

    return res.rows.map((row) => plainToClass(Message, row.data))
  }

  @Mutation((returns) => Message)
  async sendMessage(
    @Ctx() context: any,
    @Arg('data') newMessage: MessageInput
  ): Promise<Message> {
    const message = newInstance(Message, newMessage)
    message.from = context.user.id
    message.sent = new Date()

    const res = await pool.query(`INSERT INTO messages(data) VALUES ($1)`, [
      message,
    ])

    return message
  }
}

@Resolver((of) => Notification)
export class NotificationResolver {
  @Query((returns) => [Notification])
  async getNotifications(
    @Ctx() context: any,
    @Args() { offset, limit }: PaginationArgs
  ): Promise<Notification[]> {
    const { id: to } = context.user
    const res = await pool.query(
      `
      SELECT data FROM notifications 
      WHERE (data ->> 'to') = $1 
      AND id > $2
      ORDER BY id DESC 
      LIMIT $3
      `,
      [to, offset, limit]
    )

    return res.rows.map((row) => plainToClass(Notification, row.data))
  }

  @Mutation((returns) => Boolean)
  async newAction(@Arg('data') newAction: ActionInput): Promise<boolean> {
    const notification = this.fromAction(newAction)
    await pool.query(`INSERT INTO notifications(data) VALUES ($1)`, [
      notification,
    ])
    return true
  }

  @Subscription({
    topics: 'notifications',
  })
  onNotification(@Root() payload: any): Message {
    return null
  }

  private fromAction(action: ActionInput): Notification {
    const notification = newInstance(Notification, {
      to: action.target,
      type: action.type,
      sent: Date.now(),
    })

    return notification
  }
}
