import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxDataGridModule } from 'devextreme-angular';
import { Post, PostsService } from './posts.service';
import { RowRemovedEvent, SavedEvent } from 'devextreme/ui/data_grid';

@Component({
  selector: 'app-posts',
  imports: [CommonModule, DxDataGridModule],
  templateUrl: './posts.component.html',
  styleUrl: './posts.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  providers: [PostsService],
})
export class PostsComponent implements OnInit {
  private postsService = inject(PostsService);

  postsSig = this.postsService.postsSig;
  isLoadingSig = this.postsService.isLoadingSig;

  ngOnInit(): void {
    this.postsService.loadPosts();
  }

  onSaved(event: SavedEvent<Post>) {
    const post = event.changes[0]?.data;
    if (typeof post.id === 'number') {
      this.postsService.updatePost(post);
    } else {
      this.postsService.addPost(post);
    }
  }

  onRemove(event: RowRemovedEvent) {
    this.postsService.removePost(event.key);
  }
}
