import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-chats',
  templateUrl: './chats.page.html',
  styleUrls: ['./chats.page.scss'],
})
export class ChatsPage implements OnInit {

  chats: any[] = []

  constructor() { }

  ngOnInit() {
    this.chats = [
      {latest: 'foo'}
    ]
  }

}
