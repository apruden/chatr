import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.page.html',
  styleUrls: ['./profile-edit.page.scss'],
})
export class ProfileEditPage implements OnInit {
  imageURL: any;
  @ViewChild('fileButton', { static: false }) fileButton;

  constructor() { }

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
}
