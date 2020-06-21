import { Injectable } from '@angular/core'
import gql from 'graphql-tag'
import { Account } from 'chatr-domain'
import { Apollo } from 'apollo-angular'

const GET_ACCOUNT = gql`
  query GetAccount {
    getAccount {
      id
      email
      criterion {
        ageMin
        ageMax
        gender
        location
        distance
      }
    }
  }
`

type Response = {
  getAccount: Account
}

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  constructor(private apollo: Apollo) {}

  async getAccount(): Promise<Account> {
    const resp = await this.apollo
      .query<Response>({ query: GET_ACCOUNT })
      .toPromise()

    return resp.data.getAccount
  }
}
