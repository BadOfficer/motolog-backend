import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { FilesService } from '../files/files.service';
import { isImage } from 'src/utils/file-validation';

const safeUserSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
} as const;

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly filesService: FilesService,
  ) {}

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
      throw new BadRequestException(
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

  async updateUser(id: string, dto: UpdateUserDto) {
    await this.findUserById(id);

    if (dto.email) {
      const existUserByEmail = await this.prismaService.user.findUnique({
        where: {
          email: dto.email,
        },
      });

      if (existUserByEmail) {
        throw new BadRequestException(
          `User with email - ${dto.email} is exist`,
        );
      }
    }

    return this.prismaService.user.update({
      where: {
        id,
      },
      data: dto,
    });
  }

  async updatePassword(id: string, dto: UpdatePasswordDto) {
    const existUser = await this.prismaService.user.findUnique({
      where: {
        id,
      },
    });

    if (!existUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    if (existUser.password) {
      if (!dto.oldPassword) {
        throw new BadRequestException('Old password is required');
      }

      const isPasswordEqual = await bcrypt.compare(
        dto.oldPassword,
        existUser.password,
      );

      if (!isPasswordEqual) {
        throw new BadRequestException('Incorrect old password');
      }
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    return this.prismaService.user.update({
      where: {
        id,
      },
      data: {
        password: hashedPassword,
      },
    });
  }

  async updateUserAvatar(id: string, file: Express.Multer.File) {
    const user = await this.findUserById(id);
    const isFileImage = isImage(file);

    if (!isFileImage) {
      throw new BadRequestException('File type not supported');
    }

    const oldAvatarPath = user?.avatar ?? null;
    let newAvatarPath: null | string = null;

    try {
      newAvatarPath = await this.filesService.saveFile(file);
      await this.prismaService.user.update({
        where: {
          id,
        },
        data: {
          avatar: newAvatarPath,
        },
      });
    } catch (e) {
      if (newAvatarPath) {
        await this.filesService.removeFile(newAvatarPath);
      }

      if (e instanceof BadRequestException || e instanceof NotFoundException) {
        throw e;
      }

      throw new InternalServerErrorException('Failed to update vehicle image');
    }

    if (oldAvatarPath) {
      await this.filesService.removeFile(oldAvatarPath);
    }

    return this.findUserById(id);
  }

  async removeUserAvatar(id: string) {
    const user = await this.findUserById(id);

    if (!user?.avatar) {
      throw new BadRequestException('User doesn`t have avatar');
    }

    await this.filesService.removeFile(user.avatar);

    return this.prismaService.user.update({
      where: {
        id,
      },
      data: {
        avatar: null,
      },
    });
  }
}
