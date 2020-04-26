import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {

  messages: any[] = []

  constructor() { 
    this.messages = [
      {text: "hello"},
      {text: "foo"},
      {text: "bar"},
    ]
  }

  ngOnInit() {
    
  }
}
