import { Field, ObjectType, InputType } from "type-graphql";

@ObjectType()
export class Message {
    @Field()
    text: string

    constructor(t: string) {
        this.text = t
    }
}

@InputType()
export class MessageInput {
    @Field()
    text: string
}