import { 
  Controller, 
  Post, 
  UseInterceptors, 
  UploadedFile, 
  BadRequestException, 
  Body
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SupabaseService } from '../supabase/supabase.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('documents')
export class DocumentsController {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file')) // 'file' deve bater com o nome do campo no Frontend
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    
    // 1. Validação básica
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }

    // 2. Simulação do Auth (Depois trocaremos pelo req.user.id do Clerk)
    // TODO: Pegar o userId real do Token do Clerk
    const userId = body.userId || "user_123_test"; 

    console.log(`Recebendo arquivo: ${file.originalname} para o user: ${userId}`);

    try {
      // 3. Upload para o Supabase Storage
      const uploadResult = await this.supabaseService.uploadFile(file, userId);

      // 4. Salvar registro no Banco de Dados (Prisma)
      const document = await this.prisma.document.create({
        data: {
          fileName: uploadResult.fileName,
          fileUrl: uploadResult.publicUrl,
          userId: userId,
          extractedText: "", // Ainda vazio, preencheremos com IA depois
          summary: "",       // Ainda vazio
        },
      });

      return {
        message: 'Upload realizado com sucesso!',
        document: document,
      };

    } catch (error) {
      console.error(error);
      throw new BadRequestException('Erro ao processar upload: ' + error.message);
    }
  }
}