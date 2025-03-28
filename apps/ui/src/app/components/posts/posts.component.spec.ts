import { TestBed, ComponentFixture } from '@angular/core/testing';
import { PostsComponent } from './posts.component';
import { PostsService, Post } from './posts.service';
import { SavedEvent } from 'devextreme/ui/data_grid';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

describe('PostsComponent', () => {
  let fixture: ComponentFixture<PostsComponent>;
  let component: PostsComponent;
  let postsService: jest.Mocked<PostsService>;

  beforeEach(async () => {
    const mockPostsService = {
      postsSig: jest.fn(() => []),
      isLoadingSig: jest.fn(() => false),
      loadPosts: jest.fn(),
      addPost: jest.fn(),
      updatePost: jest.fn(),
      removePost: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [PostsComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: PostsService, useValue: mockPostsService }],
      schemas: [NO_ERRORS_SCHEMA], // ignore devextreme templates
    }).compileComponents();

    fixture = TestBed.createComponent(PostsComponent);
    component = fixture.componentInstance;
    postsService = TestBed.inject(PostsService) as jest.Mocked<PostsService>;
  });

  it('should call loadPosts on init', () => {
    const spyLoadPosts = jest.spyOn(component['postsService'], 'loadPosts');
    component.ngOnInit();
    expect(spyLoadPosts).toHaveBeenCalled();
  });

  it('should call updatePost when ID exists', () => {
    const spyUpdatePost = jest.spyOn(component['postsService'], 'updatePost');
    const post: Post = { id: 1, userId: 1, title: 'Title', body: 'Body' };
    const event = { changes: [{ data: post }] } as SavedEvent<Post>;
    component.onSaved(event);
    expect(spyUpdatePost).toHaveBeenCalledWith(post);
  });

  it('should call addPost when ID is missing', () => {
    const spyAddPost = jest.spyOn(component['postsService'], 'addPost');
    const post: Post = { userId: 1, title: 'Title', body: 'Body' };
    const event = { changes: [{ data: post }] } as SavedEvent<Post>;
    component.onSaved(event);
    expect(spyAddPost).toHaveBeenCalledWith(post);
  });

  it('should call removePost with correct ID', () => {
    const spyRemovePost = jest.spyOn(component['postsService'], 'removePost');
    const event = { key: 5 };
    component.onRemove(event as any);
    expect(spyRemovePost).toHaveBeenCalledWith(5);
  });
});
