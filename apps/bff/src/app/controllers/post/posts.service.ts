import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { HttpService } from '@nestjs/axios';
import { map } from 'rxjs/operators';
import { ConfigService } from '@nestjs/config';

const POSTS_URL = 'https://jsonplaceholder.typicode.com/posts';

@Injectable()
export class PostsService {
  private postsUrl = this.configService.get('POSTS_URL') ?? POSTS_URL;
  constructor(private httpService: HttpService, private configService: ConfigService) {}

  create(createPostDto: CreatePostDto) {
    return this.httpService.post(this.postsUrl, { ...createPostDto }).pipe(map((res) => ({ data: res.data })));
  }

  findAll() {
    return this.httpService.get(this.postsUrl).pipe(map((res) => ({ data: res.data })));
  }

  findOne(id: number) {
    return this.httpService.get(`${this.postsUrl}/${id}`).pipe(map((res) => ({ data: res.data })));
  }

  update(id: number, updatePostDto: UpdatePostDto) {
    return this.httpService.patch(`${this.postsUrl}/${id}`, { ...updatePostDto }).pipe(map((res) => ({ data: { id, ...res.data } })));
  }

  remove(id: number) {
    return this.httpService.delete(`${this.postsUrl}/${id}`).pipe(map((res) => ({ data: id })));
  }
}
