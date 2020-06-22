import { Component, OnInit } from '@angular/core';
import gql from 'graphql-tag';
import { Profile } from 'chatr-domain';
import { ActivatedRoute } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { AccountService } from '../services/account.service';

const GET_PROFILE = gql`
  query GetProfile($id: String!) {
    getProfile(id: $id) {
      headline
      description
      location
      interests
      dob
      gender
      pictures {
        filename
      }
    }
  }
`

interface Response {
  getProfile: Profile
}


@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  id: string
  profile: Profile

  constructor(
    private route: ActivatedRoute,
    private apollo: Apollo,
    private accountService: AccountService
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.queryParamMap.get('id')
    this.getProfile()
  }
  
  async getProfile() {
    this.profile = await this.apollo
      .watchQuery<Response>({
        query: GET_PROFILE,
        variables: {
          id: this.id,
        },
      })
      .valueChanges.toPromise()
      .then((result) => result.data.getProfile)
  }

}
