import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { Apollo } from 'apollo-angular'
import { AccountService } from '../services/account.service'
import gql from 'graphql-tag'
import { Media, Profile } from 'chatr-domain'

const GET_PROFILE = gql`
  query GetProfile($id: String!) {
    getProfile(id: $id) {
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
  selector: 'app-gallery',
  templateUrl: './gallery.page.html',
  styleUrls: ['./gallery.page.scss'],
})
export class GalleryPage implements OnInit {
  id: string
  pictures: Media[] = []

  constructor(
    private route: ActivatedRoute,
    private apollo: Apollo,
    private accountService: AccountService
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id')
  }

  async getProfile() {
    const found = await this.apollo
      .watchQuery<Response>({
        query: GET_PROFILE,
        variables: {
          id: this.id,
        },
      })
      .valueChanges.toPromise()
      .then((result) => result.data.getProfile)

    this.pictures = found.pictures
  }
}
