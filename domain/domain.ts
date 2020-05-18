import { Field, ObjectType, InputType } from 'type-graphql'

@ObjectType()
export class Message {
  @Field() from: string
  @Field() to: string
  @Field() text: string
  @Field() sent: Date
  @Field() read: boolean
}

@ObjectType()
export class Relation {
  @Field() subject: string
  @Field() target: string
  @Field() type: string
}

@InputType()
export class MessageInput {
  @Field() to: string
  @Field() text: string
}

@ObjectType()
export class Notification {
  @Field() to: string
  @Field() sent: Date
  @Field() type: string
}

@InputType()
export class ActionInput {
  @Field() type: string
  @Field() subject: string
  @Field() target: string
}

@ObjectType()
export class Criterion {
  @Field() ageMin: number
  @Field() ageMax: number
  @Field() distance: number
  @Field() location: string
  @Field() gender: string
}

@InputType()
export class CriterionInput {
  @Field() ageMin: number
  @Field() ageMax: number
  @Field() distance: number
  @Field() location: string
  @Field() gender: string
}

@ObjectType()
export class Account {
  @Field() id: string
  @Field() email: string
  @Field() criterion: Criterion
}

@InputType()
export class AccountInput {
  @Field() id: string
  @Field() email: string
  @Field() criterion: CriterionInput
}

@ObjectType()
export class Media {
  @Field() filename: string
  @Field() isDefault: boolean
  @Field() description: string
  @Field() type: string
  @Field() updated: string
}

@InputType()
export class MediaInput {
  @Field() filename: string
}

@ObjectType()
export class Profile {
  @Field() headline: string
  @Field() description: string
  @Field((type) => [String]) interests: string[]
  @Field((type) => [Media]) pictures: Media[]
  @Field() dob: number
  @Field() gender: string
  @Field() location: string
  @Field() latestActive: Date
}

@InputType()
export class ProfileInput {
  @Field() headline: string
  @Field() description: string
  @Field((type) => [String]) interests: string[]
  @Field((type) => [MediaInput]) pictures: MediaInput[]
  @Field() dob: number
  @Field() gender: string
  @Field() location: string
}

@ObjectType()
export class Match {
  @Field() id: string
  @Field() picture: string
  @Field() dob: number
  @Field() location: string
  @Field() headline: string
  @Field() latestActive: Date
}

@ObjectType()
export class Registration {
  @Field() token: string
}

@InputType()
export class RegistrationInput {
  @Field() account: AccountInput
  @Field() profile: ProfileInput
}
