import { Component, OnInit } from '@angular/core'
import { Notification } from 'chatr-domain'
import { Apollo } from 'apollo-angular'
import { AccountService } from '../services/account.service'
import gql from 'graphql-tag'

const GET_NOTIFICATIONS = gql`
  query GetNotifications($offset: Int, $limit: Int) {
    getNotifications(offset: $offset, limit: $limit) {
      to
      name
      sent
      payload
    }
  }
`

const LIMIT = 20

interface Response {
  getNotifications: Notification[]
}

export interface FeedEntry {
  name: string
  sent: Date
}

export interface LikedYouEntry extends FeedEntry {
  from: string
}

export interface ViewedYouEntry extends FeedEntry {
  from: string
}

export interface NewMessageEntry extends FeedEntry {
  from: string
}

@Component({
  selector: 'app-feed',
  templateUrl: './feed.page.html',
  styleUrls: ['./feed.page.scss'],
})
export class FeedPage implements OnInit {
  feeds: FeedEntry[] = []

  constructor(private apollo: Apollo, private accountService: AccountService) {}

  ngOnInit() {
    this.feeds = [
      { name: 'likedYou', sent: new Date(), from: 'foo' } as LikedYouEntry,
      { name: 'viewedYou', sent: new Date(), from: 'bar' } as ViewedYouEntry,
      { name: 'newMessage', sent: new Date(), from: 'buzz' } as NewMessageEntry,
    ]

    this.findMatches()
  }

  async findMatches() {
    const foundNotifications = await this.apollo
      .watchQuery<Response>({
        query: GET_NOTIFICATIONS,
        variables: {
          offset: this.feeds.length,
          limit: LIMIT,
        },
      })
      .valueChanges.toPromise()
      .then((result) => result.data.getNotifications)

    const found = foundNotifications.map((notification) => {
      let payload = JSON.parse(notification.payload)
      payload.sent = notification.sent
      payload.name = notification.name

      switch (notification.name) {
        case 'likedYou':
          payload as LikedYouEntry
          break
        case 'viewedYou':
          payload as ViewedYouEntry
          break
        case 'newMessage':
          payload as NewMessageEntry
          break
      }

      return payload
    })
    this.feeds = this.feeds.concat(found)

    return found.length > 0
  }

  doRefresh(event) {
    this.feeds = []
    this.findMatches()
  }

  loadData(event) {
    this.findMatches().then((found) => {
      event.target.complete()
      event.target.disabled = !found
    })
  }
}
