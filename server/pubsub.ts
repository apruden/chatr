import { PubSubEngine } from "graphql-subscriptions";
import createSubscriber from "pg-listen"
import { PubSubAsyncIterator } from "./async-iterator";

const subscriber = createSubscriber({ user: 'postgres', host: 'localhost', port: 5432, database: 'alex' })

async function connect () {
  await subscriber.connect()
  await subscriber.listenTo('notif')
}

export class FooPubSub implements PubSubEngine {
    subscriptions: Map<number, Function> = new Map()

    constructor() {
        const ss = this.subscriptions

        subscriber.notifications.on('notif', (payload) => {
          console.log("Received notification in 'notif':", payload, ss)

          ss.forEach((f, _) => {
              console.log('>>>>')
              f(payload)
          });
        })

        connect().then(() => {
            console.log('<<<<<')
        })
    }

    publish(triggerName: string, payload: any): Promise<void> {
        throw new Error("Method not implemented.");
    }
    subscribe(triggerName: string, onMessage: Function, options: Object): Promise<number> {
        console.log('<<<subs')
        this.subscriptions.set(1, onMessage);

        return Promise.resolve(1);
    }
    unsubscribe(subId: number) {
        throw new Error("Method not implemented.");
    }
    asyncIterator<T>(triggers: string | string[]): AsyncIterator<T, any, undefined> {
        return new PubSubAsyncIterator(this, triggers, {});
    }
}
