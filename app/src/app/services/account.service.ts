import { Injectable } from '@angular/core';
import gql from 'graphql-tag';
import { Account } from 'chatr-domain';
import { Apollo } from 'apollo-angular';

const GET_ACCOUNT = gql`
  query GetAccount {
    getAccount() {
      id
      email
      criterion {

      }
    }
  }
`

type Response = {
  account: Account
}

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  constructor(private apollo: Apollo) { }

  getAccount(): Account {
    this.apollo.query<Response>({ query: GET_ACCOUNT }).subscribe(r => r.data.account)
  }
}
