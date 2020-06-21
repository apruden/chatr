import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'search',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../search/search.module').then(m => m.SearchPageModule)
          }
        ]
      },
      {
        path: 'feed',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../feed/feed.module').then(m => m.FeedPageModule)
          }
        ]
      },
      {
        path: 'chat',
        children: [
          {
            path: ':from',
            loadChildren: () =>
              import('../chat/chat.module').then(m => m.ChatPageModule)
          }
        ]
      },
      {
        path: 'chats',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../chats/chats.module').then(m => m.ChatsPageModule)
          }
        ]
      },
      {
        path: 'profile-edit',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../profile-edit/profile-edit.module').then(m => m.ProfileEditPageModule)
          }
        ]
      },
      {
        path: 'profile',
        children: [
          {
            path: ':id',
            loadChildren: () =>
              import('../profile/profile.module').then(m => m.ProfilePageModule)
          }
        ]
      },
      {
        path: 'gallery',
        children: [
          {
            path: ':id',
            loadChildren: () =>
              import('../gallery/gallery.module').then(m => m.GalleryPageModule)
          }
        ]
      },
      {
        path: '',
        redirectTo: '/tabs/search',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/search',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}
