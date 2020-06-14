import { Component, OnInit } from '@angular/core'
import { Apollo } from 'apollo-angular'
import gql from 'graphql-tag'
import { Match, CriterionInput } from 'chatr-domain'

type Response = {
  search: Match[]
}

const GET_MATCHES = gql`
  query Search($offset: Int, $limit: Int, $criterion: CriterionInput!) {
    search(offset: $offset, limit: $limit, criterion: $criterion) {
      id
      dob
      picture
      location
      headline
    }
  }
`

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit {
  showOptions: boolean = false
  profiles: Match[] = []

  constructor(private apollo: Apollo) {}

  ngOnInit() {
    this.profiles = []
    this.findMatches()
  }

  toogleOptions() {
    this.showOptions = !this.showOptions
  }

  findMatches() {
    const criterion = new CriterionInput()
    criterion.ageMin = 18
    criterion.ageMax = 30
    criterion.distance = 10
    criterion.gender = 'male'
    criterion.location = '0101000000000000000000F03F000000000000F03F'

    this.apollo
      .watchQuery<Response>({
        query: GET_MATCHES,
        variables: { offset: 0, limit: 20, criterion },
      })
      .valueChanges.subscribe((result) => {
        this.profiles = result.data.search
      })
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
