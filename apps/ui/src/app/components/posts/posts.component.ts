import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Post, PostsService } from './posts.service';
import { RowRemovedEvent, SavingEvent } from 'devextreme/ui/data_grid';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';

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

  onSaving(event: SavingEvent<Post>) {
    event.cancel = true;
    const post = event.changes[0]?.data;
    if (!post) return;

    if (event.changes[0].type === 'insert') {
      this.postsService.addPost(post);
      event.component.cancelEditData();
      return;
    }

    if (event.changes[0].type === 'update' && typeof post.id === 'number') {
      this.postsService.updatePost(post);
      event.component.cancelEditData();
      return;
    }
  }

  onRemove(event: RowRemovedEvent) {
    this.postsService.removePost(event.key);
  }
}
