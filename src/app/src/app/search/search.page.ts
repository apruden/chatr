import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit {
  showOptions: boolean = false
  profiles: any[] = []

  constructor() { }

  ngOnInit() {
    this.profiles = [
     {name: 'foo', age: 100, location: 'Montreal', intro: 'lorem ipsum'} 
    ]
  }

  toogleOptions() {
    this.showOptions = !this.showOptions
  }

}
