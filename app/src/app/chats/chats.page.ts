import { Component, OnInit } from '@angular/core'
import gql from 'graphql-tag'
import { Apollo } from 'apollo-angular'
import { AccountService } from '../services/account.service'
import { Message } from 'chatr-domain'

const GET_MESSAGES = gql`
  query GetLatestMessages($offset: Int, $limit: Int) {
    getLatestMessages(offset: $offset, limit: $limit) {
      to
      from
      text
      sent
      read
    }
  }
`

const LIMIT = 20

interface Response {
  getLatestMessages: Message[]
}

@Component({
  selector: 'app-chats',
  templateUrl: './chats.page.html',
  styleUrls: ['./chats.page.scss'],
})
export class ChatsPage implements OnInit {
  chats: Message[] = []

  constructor(private apollo: Apollo, private accountService: AccountService) {}

  ngOnInit() {
    this.findMessages()
  }

  async findMessages() {
    const found = await this.apollo
      .watchQuery<Response>({
        query: GET_MESSAGES,
        variables: {
          offset: this.chats.length,
          limit: LIMIT,
        },
      })
      .valueChanges.toPromise()
      .then((result) => result.data.getLatestMessages)

    this.chats = this.chats.concat(found)

    return found.length > 0
  }

  doRefresh(event) {
    this.chats = []
    this.findMessages()
  }

  loadData(event) {
    this.findMessages().then((found) => {
      event.target.complete()
      event.target.disabled = !found
    })
  }
}
