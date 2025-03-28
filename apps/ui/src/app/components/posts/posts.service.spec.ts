import { TestBed } from '@angular/core/testing';
import { PostsService, Post } from './posts.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

describe('PostsService', () => {
  let service: PostsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [provideHttpClient(), provideHttpClientTesting(), PostsService],
    });

    service = TestBed.inject(PostsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should send GET request when loadPosts() is called', () => {
    service.loadPosts();
    const req = httpMock.expectOne('/api/posts');
    expect(req.request.method).toBe('GET');
    req.flush({ data: [{ id: 1, userId: 1, title: 'Post', body: 'Content' }] });
  });

  it('should send POST request when addPost() is called', () => {
    const newPost: Post = { userId: 1, title: 'Title', body: 'Content' };
    service.addPost(newPost);
    const req = httpMock.expectOne('/api/posts');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newPost);
    req.flush({ data: { id: 100, ...newPost } });
  });

  it('should send DELETE request when removePost() is called', () => {
    service.removePost(3);
    const req = httpMock.expectOne('/api/posts/3');
    expect(req.request.method).toBe('DELETE');
    req.flush({ data: 3 });
  });

  it('should send PUT request when updatePost() is called', () => {
    const updated: Post = { id: 5, userId: 2, title: 'Updated', body: 'New body' };
    service.updatePost(updated);
    const req = httpMock.expectOne('/api/posts/5');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updated);
    req.flush({ data: updated });
  });
});
