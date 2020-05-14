import { PubSubEngine } from "graphql-subscriptions"
import createSubscriber from "pg-listen"
import { PubSubAsyncIterator } from "./async-iterator"

const subscriber = createSubscriber({
  user: "postgres",
  host: "localhost",
  port: 5432,
  database: "chatr",
})

async function connect() {
  await subscriber.connect()
  await subscriber.listenTo("notifications")
}

export class PgPubSub implements PubSubEngine {
  subscriptions: Map<number, Function> = new Map()

  constructor() {
    const ss = this.subscriptions

    subscriber.notifications.on("notifications", (payload) => {
      console.log("Received notification in notifications:", payload, ss);
      ss.forEach((f, _) => f(payload))
    })
  }

  publish(triggerName: string, payload: any): Promise<void> {
    throw new Error("Method not implemented.")
  }

  subscribe(
    triggerName: string,
    onMessage: Function,
    options: Object
  ): Promise<number> {
    this.subscriptions.set(1, onMessage)

    return Promise.resolve(1)
  }

  unsubscribe(subId: number) {
    throw new Error("Method not implemented.")
  }

  asyncIterator<T>(
    triggers: string | string[]
  ): AsyncIterator<T, any, undefined> {
    return new PubSubAsyncIterator(this, triggers, {})
  }
}
