import { Component, OnInit, ViewChild } from '@angular/core';
import gql from 'graphql-tag';
import { Profile } from 'chatr-domain';
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
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.page.html',
  styleUrls: ['./profile-edit.page.scss'],
})
export class ProfileEditPage implements OnInit {
  id: string
  profile: Profile
  imageURL: any;
  @ViewChild('fileButton', { static: false }) fileButton;

  constructor(
    private apollo: Apollo,
    private accountService: AccountService
  ) {}

  ngOnInit() {
  }

  uploadFile() {
    this.fileButton.nativeElement.click();
  }
  
  fileChanged(event) {
    const files = event.target.files;
    console.log(files);
    const reader = new FileReader();
    reader.onload = () => {
      this.imageURL = reader.result;
    };
    reader.readAsDataURL(event.target.files[0]);
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
