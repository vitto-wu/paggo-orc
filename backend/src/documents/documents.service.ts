import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createWorker } from 'tesseract.js';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class DocumentsService {
  private supabase: SupabaseClient;

  constructor(private prisma: PrismaService) {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_KEY!,
    ) as SupabaseClient;
  }

  async processDocument(file: Express.Multer.File, userId: string) {
    const worker = await createWorker('eng');
    const {
      data: { text },
    } = await worker.recognize(file.buffer);
    await worker.terminate();

    // 2. Save to Database (Supabase Storage)
    const fileName = `${userId}/${Date.now()}_${file.originalname}`;

    const { error: uploadError } = await this.supabase.storage
      .from('documents')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(
        `Failed to upload file to Supabase: ${uploadError.message}`,
      );
    }

    const { data: publicUrlData } = this.supabase.storage
      .from('documents')
      .getPublicUrl(fileName);

    const fileUrl = publicUrlData.publicUrl;

    const userExists = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      throw new Error(
        `User with ID ${userId} not found in database. Please refresh the page to sync your account.`,
      );
    }

    const document = await this.prisma.document.create({
      data: {
        fileName: file.originalname,
        fileUrl: fileUrl,
        extractedText: text,
        userId: userId,
        summary: '',
      },
    });

    return document;
  }

  async getDocuments(userId: string) {
    return this.prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDocument(id: string) {
    return this.prisma.document.findUnique({
      where: { id },
      include: { messages: true },
    });
  }

  async addMessage(documentId: string, content: string, role: string) {
    return this.prisma.message.create({
      data: {
        content,
        role,
        documentId,
      },
    });
  }

  async deleteDocument(id: string) {
    return this.prisma.document.delete({
      where: { id },
    });
  }

  async renameDocument(id: string, newName: string) {
    return this.prisma.document.update({
      where: { id },
      data: { fileName: newName },
    });
  }
}
