import { Component, OnInit } from '@angular/core'

@Component({
  selector: 'app-chats',
  templateUrl: './chats.page.html',
  styleUrls: ['./chats.page.scss'],
})
export class ChatsPage implements OnInit {
  chats: any[] = []

  constructor() {}

  ngOnInit() {
    this.chats = [{ latest: 'foo' }]
  }

  loadData(event) {
    setTimeout(() => {
      console.log('Done');
      event.target.complete();

      // App logic to determine if all data is loaded
      // and disable the infinite scroll
      if (true) {
        event.target.disabled = true;
      }
    }, 500)
  }
}
