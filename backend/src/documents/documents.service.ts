import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createWorker } from 'tesseract.js';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

@Injectable()
export class DocumentsService {
  private supabase: SupabaseClient;
  private openai: OpenAI;

  constructor(private prisma: PrismaService) {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_KEY!,
    ) as SupabaseClient;

    this.openai = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1',
    });
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

    const summary = await this.generateSummary(text);

    const document = await this.prisma.document.create({
      data: {
        fileName: file.originalname,
        fileUrl: fileUrl,
        extractedText: text,
        userId: userId,
        summary: summary,
        messages: {
          create: {
            content: summary,
            role: 'assistant',
          },
        },
      },
    });

    return document;
  }

  private async generateSummary(text: string): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are an expert document analyst. Your task is to provide a comprehensive summary and explanation of the provided document text.
            
            Structure your response exactly as follows:
            
            ### Document Analysis
            
            **1. Document Type:**
            [Identify the type of document, e.g., Invoice, Contract, Report, Memo, etc.]
            
            **2. Executive Summary:**
            [Provide a concise summary of the document's main purpose and content.]
            
            **3. Key Details:**
            [Extract and list critical information such as dates, names, monetary amounts, specific clauses, or IDs.]
            
            **4. Explanation:**
            [Explain the context or significance of this document in simple terms.]
            
            ---
            
            *Feel free to ask me any specific questions about the information extracted from this document.*`,
          },
          {
            role: 'user',
            content: `Here is the document text:\n\n${text}`,
          },
        ],
        model: 'llama-3.3-70b-versatile',
      });

      return (
        completion.choices[0]?.message?.content ||
        'Could not generate a summary for this document.'
      );
    } catch (error) {
      console.error('Error generating summary:', error);
      return 'Error generating summary.';
    }
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
    const userMessage = await this.prisma.message.create({
      data: {
        content,
        role,
        documentId,
      },
    });

    if (role !== 'user') {
      return userMessage;
    }

    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 10,
        },
      },
    });

    if (!document || !document.extractedText) {
      return userMessage;
    }

    try {
      const completion = await this.openai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant analyzing a document. 
            Here is the content of the document:
            ${document.extractedText}
            
            Answer the user's questions based on this document.`,
          },
          ...document.messages.map((msg) => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
          })),
        ],
        model: 'llama-3.3-70b-versatile', // Updated to latest supported model
      });

      const aiContent =
        completion.choices[0]?.message?.content ||
        "Sorry, I couldn't generate a response.";

      const aiMessage = await this.prisma.message.create({
        data: {
          content: aiContent,
          role: 'assistant',
          documentId,
        },
      });

      return aiMessage;
    } catch (error) {
      console.error('Groq API Error:', error);
      return userMessage;
    }
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
