import { Component, OnInit } from '@angular/core'
import { Apollo } from 'apollo-angular'
import gql from 'graphql-tag'
import { Match } from 'chatr-domain'
import { AccountService } from '../services/account.service'
import { classToPlain } from 'class-transformer'

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

const LIMIT = 20

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit {
  showOptions: boolean = false
  profiles: Match[] = []

  constructor(private apollo: Apollo, private accountService: AccountService) {}

  ngOnInit() {
    this.profiles = []
    this.findMatches()
  }

  toogleOptions() {
    this.showOptions = !this.showOptions
  }

  async findMatches() {
    const account = await this.accountService.getAccount()
    const { criterion } = account
    const criterionInput = classToPlain(criterion, {excludePrefixes: ['__']})

    const found = await this.apollo
      .watchQuery<Response>({
        query: GET_MATCHES,
        variables: {
          offset: this.profiles.length,
          limit: LIMIT,
          criterion: criterionInput,
        },
      })
      .valueChanges.toPromise()
      .then((result) => result.data.search)

    this.profiles = this.profiles.concat(found)

    return found.length > 0
  }

  doRefresh(event) {
    this.profiles = []
    this.findMatches()
  }

  loadData(event) {
    this.findMatches().then((found) => {
      event.target.complete()
      event.target.disabled = !found
    })
  }
}
