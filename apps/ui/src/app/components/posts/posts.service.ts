import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { merge, Subject } from 'rxjs';
import { finalize, map, scan, shareReplay, switchMap } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

export interface Post {
  userId?: number;
  id?: number;
  title?: string;
  body?: string;
}

interface PostsState {
  posts: Post[];
}

const initialState: PostsState = {
  posts: [],
};

@Injectable()
export class PostsService {
  private http = inject(HttpClient);

  private _loadPostsAction$ = new Subject<void>();
  private _addPostAction$ = new Subject<Post>();
  private _removePostAction$ = new Subject<number>();
  private _updatePostAction$ = new Subject<Post>();

  private _isLoading$ = new Subject<boolean>();

  // TODO: add http error handlers
  private postsState$ = merge(
    this._loadPostsAction$.pipe(
      switchMap(() => this.loadPostListRequest()),
      map((res) => this.onPostListLoaded(res))
    ),
    this._addPostAction$.pipe(
      switchMap((post) => this.addPostRequest(post)),
      map((res) => this.onPostAdded(res))
    ),
    this._removePostAction$.pipe(
      switchMap((id) => this.removePostRequest(id)),
      map((res) => this.onPostRemoved(res))
    ),
    this._updatePostAction$.pipe(
      switchMap((post) => this.updatePostRequest(post)),
      map((res) => this.onPostUpdated(res))
    )
  ).pipe(
    scan((state: PostsState, stateHandlerFn) => stateHandlerFn(state), {
      ...initialState,
    }),
    shareReplay()
  );

  postsSig = toSignal(this.postsState$.pipe(map((state) => state.posts ?? [])));
  isLoadingSig = toSignal(this._isLoading$);

  public loadPosts() {
    this._loadPostsAction$.next();
  }

  public addPost(post: Partial<Post>) {
    if (!post || !post.userId) {
      return;
    }

    const newPost: Post = { userId: post.userId, title: post.title, body: post.body };
    this._addPostAction$.next(newPost);
  }

  public removePost(id?: number) {
    if (!id || typeof id !== 'number' || !isFinite(id)) {
      return;
    }

    this._removePostAction$.next(id);
  }

  public updatePost(post: Post) {
    if (!post.id || typeof post.id !== 'number' || !isFinite(post.id)) {
      return;
    }

    this._updatePostAction$.next(post);
  }

  private loadPostListRequest() {
    this._isLoading$.next(true);
    return this.http.get<{ data: Post[] }>('/api/posts').pipe(finalize(() => this._isLoading$.next(false)));
  }

  private onPostListLoaded = (res: { data: Post[] }) => (state: PostsState) => {
    const posts = res?.data ?? [];
    return { posts };
  };

  private addPostRequest(post: Post) {
    this._isLoading$.next(true);
    return this.http.post<{ data: Post }>('/api/posts', { ...post }).pipe(finalize(() => this._isLoading$.next(false)));
  }

  private onPostAdded = (res: { data: Post }) => (state: PostsState) => {
    const post = res.data;
    if (!this.objIsPost(post)) {
      return state;
    }

    const posts = state.posts ?? [];
    return { posts: [...posts, post] };
  };

  private removePostRequest(id: number) {
    this._isLoading$.next(true);
    return this.http.delete<{ data: number }>('/api/posts/' + id).pipe(finalize(() => this._isLoading$.next(false)));
  }

  private onPostRemoved = (res: { data: number }) => (state: PostsState) => {
    const id = res.data;
    if (!isFinite(id)) {
      return state;
    }

    const posts = state.posts ?? [];
    return { posts: posts.filter((post) => post.id !== id) };
  };

  private updatePostRequest(post: Post) {
    this._isLoading$.next(true);
    return this.http.put<{ data: Post }>('/api/posts/' + post.id, { ...post }).pipe(finalize(() => this._isLoading$.next(false)));
  }

  private onPostUpdated = (res: { data: Post }) => (state: PostsState) => {
    const post = res.data;
    if (!this.objIsPost(post)) {
      return state;
    }

    const posts = (state.posts ?? []).map((post) => {
      if (post.id === res.data.id) {
        return res.data;
      }

      return post;
    });
    return { posts };
  };

  private objIsPost(post: unknown): post is Post {
    if (!post) {
      return false;
    }

    if (typeof post !== 'object') {
      return false;
    }

    const isValidId = 'id' in post && typeof post.id === 'number' && isFinite(post.id);
    const isValidUserId = 'userId' in post && typeof post.userId === 'number' && isFinite(post.userId);
    return isValidId && isValidUserId;
  }
}
