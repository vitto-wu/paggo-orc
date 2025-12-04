import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // @Global deixa o Prisma disponível no app todo sem precisar importar o módulo sempre
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}