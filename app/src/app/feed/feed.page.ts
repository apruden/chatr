import { Component, OnInit } from '@angular/core'
import { Notification } from 'chatr-domain'


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
  feeds: FeedEntry[]

  constructor() {}

  ngOnInit() {
    this.feeds = [
      {name: "likedYou",  sent: new Date(), from: "foo"} as LikedYouEntry,
      {name: "viewedYou",  sent: new Date(), from: "bar"} as ViewedYouEntry,
      {name: "newMessage",  sent: new Date(), from: "buzz"} as NewMessageEntry,
    ]
  }

  doRefresh(ev: any) {
    setTimeout(() => {
      ev.target.complete()
    }, 2000)
  }

  loadData(event) {
    setTimeout(() => {
      console.log('Done')
      event.target.complete()

      // App logic to determine if all data is loaded
      // and disable the infinite scroll
      if (true) {
        event.target.disabled = true
      }
    }, 500)
  }
}
