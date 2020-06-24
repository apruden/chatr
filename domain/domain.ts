import { Field, ObjectType, InputType } from 'type-graphql'
import { Type, plainToClass, classToPlain } from 'class-transformer'

abstract class Entity {
  toPlain(): any {
    return classToPlain(this)
  }
}

@ObjectType()
export class Message extends Entity {
  @Field() from: string
  @Field() to: string
  @Field() text: string

  @Field()
  @Type(() => Date)
  sent: Date

  @Field() read: boolean

  // NOTICE: each module that uses class-transformer maintains a different MetadataStorage!!
  // https://github.com/typestack/class-transformer/issues/36. Workaround providing an static factory method.
  static apply(plain: any): Message {
    return plainToClass(Message, plain)
  }
}

@InputType()
export class MessageInput {
  @Field() to: string
  @Field() text: string
}

@ObjectType()
export class Relation {
  @Field() subject: string
  @Field() target: string
  @Field() name: string
  
  static apply(plain: any): Relation {
    return plainToClass(Relation, plain)
  }
}

@ObjectType()
export class Notification {
  @Field() to: string
  @Field()
  @Type(() => Date)
  sent: Date
  @Field() name: string
  @Field() payload: string

  static apply(plain: any): Notification {
    return plainToClass(Notification, plain)
  }
}

@InputType()
export class ActionInput {
  @Field() subject: string
  @Field() target: string
  @Field() name: string
  @Field() payload: string
}

@ObjectType()
export class Criterion {
  @Field() ageMin: number
  @Field() ageMax: number
  @Field() distance: number
  @Field() location: string
  @Field() gender: string

  static apply(plain: any): Criterion {
    return plainToClass(Criterion, plain)
  }
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
  @Field() @Type(() => Criterion) criterion: Criterion

  static apply(plain: any): Account {
    return plainToClass(Account, plain)
  }
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
}

@InputType()
export class MediaInput {
  @Field() filename: string
}

@ObjectType()
export class Profile {
  @Field() id: string
  @Field() headline: string
  @Field() description: string
  @Field((type) => [String]) interests: string[]

  @Field((type) => [Media])
  @Type(() => Media)
  pictures: Media[]

  @Field() dob: number
  @Field() gender: string
  @Field() location: string
  @Field() 
  @Type(() => Date)
  latestActive: Date

  toMatch(): Match {
    const match = new Match()
    match.id = this.id
    match.dob = this.dob
    match.headline = this.headline
    match.latestActive = this.latestActive
    match.location = this.location
    match.picture = this.pictures ? this.pictures[0].filename : ''

    return match
  }

  static apply(plain: any): Profile {
    return plainToClass(Profile, plain)
  }
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
  @Field() 
  @Type(() => Date)
  latestActive: Date

  static apply(plain: any): Match {
    return plainToClass(Match, plain)
  }
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
