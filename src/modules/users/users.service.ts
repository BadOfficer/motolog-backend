import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

const safeUserSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
} as const;

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async findUserByEmail(email: string) {
    return this.prismaService.user.findUnique({
      where: {
        email,
      },
    });
  }

  async findUserById(id: string) {
    return this.prismaService.user.findUnique({
      where: {
        id,
      },
    });
  }

  async createUser(createUserDto: CreateUserDto) {
    const existUser = await this.prismaService.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existUser) {
      throw new ConflictException(
        `User with email ${createUserDto.email} exist`,
      );
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    return this.prismaService.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
      select: safeUserSelect,
    });
  }

  async findUsers() {
    return this.prismaService.user.findMany({
      select: safeUserSelect,
    });
  }
}
