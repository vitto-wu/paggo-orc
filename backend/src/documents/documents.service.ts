import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createWorker } from 'tesseract.js';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async processDocument(file: Express.Multer.File, userId: string) {
    // 1. OCR Extraction
    const worker = await createWorker('eng'); // Default to English, can be parameterized
    const {
      data: { text },
    } = await worker.recognize(file.buffer);
    await worker.terminate();

    // 2. Save to Database
    // Note: In a real app, we would upload 'file' to a storage service (S3, Supabase Storage)
    // and save the URL. Here we will simulate a URL or just store the filename if local.
    // For this example, I'll assume we might store it later or just keep the record.
    // I'll use a placeholder URL.
    const fileUrl = `https://placeholder.storage/${file.originalname}`;

    // Ensure user exists before creating document
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
        summary: '', // To be filled by LLM later
      },
    });

    // 3. Create initial system message or history if needed (optional based on prompt)
    // "salve o historico de interações com a ai de cada documento"
    // We can initialize an empty history or just leave it for when the user asks questions.

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
}
