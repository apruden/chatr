import { Component, OnInit } from '@angular/core'
import gql from 'graphql-tag'
import { Apollo } from 'apollo-angular'
import { AccountService } from '../services/account.service'
import { Message } from 'chatr-domain'
import { ActivatedRoute } from '@angular/router'

const GET_MESSAGES = gql`
  query GetMessages($from: String, $offset: Int, $limit: Int) {
    getMessages(from: $from, offset: $offset, limit: $limit) {
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
  getMessages: Message[]
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {
  from: string
  messages: Message[] = []

  constructor(private route: ActivatedRoute, private apollo: Apollo, private accountService: AccountService) {}

  ngOnInit() {
    this.from = this.route.snapshot.paramMap.get('from');
    this.findMessages()
  }

  async findMessages() {
    const found = await this.apollo
      .watchQuery<Response>({
        query: GET_MESSAGES,
        variables: {
          from: this.from,
          offset: this.messages.length,
          limit: LIMIT,
        },
      })
      .valueChanges.toPromise()
      .then((result) => result.data.getMessages)

    this.messages = this.messages.concat(found)

    return found.length > 0
  }

  doRefresh(event) {
    this.messages = []
    this.findMessages()
  }

  loadData(event) {
    this.findMessages().then((found) => {
      event.target.complete()
      event.target.disabled = !found
    })
  }
}
