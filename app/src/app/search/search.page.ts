import { Component, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit {
  showOptions: boolean = false
  profiles: any[] = []

  constructor(private apollo: Apollo) { }

  ngOnInit() {
    this.profiles = [
     {name: 'foo', age: 100, location: 'Montreal', intro: 'lorem ipsum'},
     {name: 'foo', age: 100, location: 'Montreal', intro: 'lorem ipsum'},
     {name: 'foo', age: 100, location: 'Montreal', intro: 'lorem ipsum'},
     {name: 'foo', age: 100, location: 'Montreal', intro: 'lorem ipsum'},
     {name: 'foo', age: 100, location: 'Montreal', intro: 'lorem ipsum'},
     {name: 'foo', age: 100, location: 'Montreal', intro: 'lorem ipsum'},
     {name: 'foo', age: 100, location: 'Montreal', intro: 'lorem ipsum'},
     {name: 'foo', age: 100, location: 'Montreal', intro: 'lorem ipsum'},
     {name: 'foo', age: 100, location: 'Montreal', intro: 'lorem ipsum'},
     {name: 'foo', age: 100, location: 'Montreal', intro: 'lorem ipsum'},
     {name: 'foo', age: 100, location: 'Montreal', intro: 'lorem ipsum'},
    ]
  }

  toogleOptions() {
    this.showOptions = !this.showOptions
  }

  getMatches() {
    this.apollo.watchQuery({
      query: gql`{
        getMatches(criterion: $criterion) {
          id
        }
      }`
    }).valueChanges.subscribe(result => {

    })
  }

}
