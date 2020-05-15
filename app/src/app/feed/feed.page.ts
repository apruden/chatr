import { Component, OnInit } from '@angular/core';


interface Notification {
  type: string
  subject: string
  dateTime: string
  thumbnail: string
}


@Component({
  selector: 'app-feed',
  templateUrl: './feed.page.html',
  styleUrls: ['./feed.page.scss'],
})
export class FeedPage implements OnInit {

  notifications: Notification[]

  constructor() { }

  ngOnInit() {
    this.notifications = [
      { type: 'likedYou', subject: 'foo user', dateTime: '', thumbnail: ''},
      { type: 'seeYou', subject: '', dateTime: '', thumbnail: '' },
      { type: 'offer', subject: '', dateTime: '', thumbnail: '' },
    ]
  }

  doRefresh(ev: any) {
    setTimeout(() => {
      ev.target.complete()
    }, 2000)
  }
}
