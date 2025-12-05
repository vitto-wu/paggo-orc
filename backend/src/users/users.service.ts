import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOrCreate(createUserDto: CreateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: createUserDto.id },
    });

    if (user) {
      return user;
    }

    // Check if user exists by email
    const userByEmail = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (userByEmail) {
      return userByEmail;
    }

    return this.prisma.user.create({
      data: createUserDto,
    });
  }
}
