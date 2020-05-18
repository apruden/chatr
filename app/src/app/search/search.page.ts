import { Component, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import {Match, CriterionInput} from 'chatr-domain';

type Response = {
  search: Match[]
}

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

    this.getMatches()
  }

  toogleOptions() {
    this.showOptions = !this.showOptions
  }

  getMatches() {
    const criterion = new CriterionInput()
    criterion.ageMin = 18
    criterion.ageMax = 30
    criterion.distance = 10
    criterion.gender = 'male'
    criterion.location = '0101000000000000000000F03F000000000000F03F'

    this.apollo.watchQuery<Response>({
      query: gql`query Search($offset: Int, $limit: Int, $criterion: CriterionInput!) {
        search(offset: $offset, limit: $limit, criterion: $criterion) {
          id
          headline
        }
      }`,
      variables: {
        offset: 0,
        limit: 20,
        criterion
      }
    }).valueChanges.subscribe(result => {
      console.log("<<<<<", result)
      result.data.search.forEach(m => console.log('>>>>>', m.headline))
    })
  }

}
