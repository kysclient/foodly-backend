import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from '../../database/entities/user.entity';
import { UserPreference } from '../../database/entities/user-preference.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserPreference])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}