import {
  Resolver,
  Query,
  Mutation,
  Arg,
  Subscription,
  Root,
} from "type-graphql";
import { Message, MessageInput } from "./domain";
import { plainToClass } from "class-transformer";
import { pool } from "./db";

@Resolver((of) => Message)
export class MessageResolver {
  @Query((returns) => [Message])
  async messages(): Promise<Message[]> {
    const res = await pool.query("SELECT data FROM messages");
    return res.rows.map((row) => plainToClass(Message, row.data));
  }

  @Mutation((returns) => Message)
  async sendMessage(@Arg("data") newMessage: MessageInput): Promise<Message> {
    const res = await pool.query("INSERT INTO messages(data) VALUES ($1)", [
      newMessage,
    ]);
    return new Message(newMessage.text);
  }

  @Subscription({
    topics: "NOTIFICATIONS",
  })
  newNotification(@Root() payload: any): Message {
    console.log('====', payload)
    return new Message("foo2");
  }
}
