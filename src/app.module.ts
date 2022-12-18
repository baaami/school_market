import { Module } from '@nestjs/common';
import { PostController } from './post/post.controller';
import { UserController } from './user/user.controller';
import { AuthController } from './auth/auth.controller';

@Module({
  imports: [],
  controllers: [PostController, UserController, AuthController],
  providers: [],
})
export class AppModule {}
