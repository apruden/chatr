import { Component, Input } from '@angular/core'
import { FeedEntry } from './feed.page'

@Component({
  selector: 'feed-liked-you',
  templateUrl: './feed-liked-you.component.html',
})
export class FeedLikedYouComponent {
  @Input() feed: FeedEntry
}

@Component({
  selector: 'feed-viewed-you',
  templateUrl: './feed-viewed-you.component.html',
})
export class FeedViewedYouComponent {
  @Input() feed: FeedEntry
}

@Component({
  selector: 'feed-new-message',
  templateUrl: './feed-new-message.component.html',
})
export class FeedNewMessageComponent {
  @Input() feed: FeedEntry
}

export const feedSwitchComponents = [
  FeedLikedYouComponent,
  FeedViewedYouComponent,
  FeedNewMessageComponent,
]
