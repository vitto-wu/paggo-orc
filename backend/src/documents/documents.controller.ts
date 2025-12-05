import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  Get,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body('userId') userId: string,
  ) {
    console.log('Uploading document for userId:', userId);
    if (!userId) {
      throw new Error('UserId is missing in the request body');
    }
    return this.documentsService.processDocument(file, userId);
  }

  @Get(':userId')
  async getDocuments(@Param('userId') userId: string) {
    return this.documentsService.getDocuments(userId);
  }

  @Get('details/:id')
  async getDocument(@Param('id') id: string) {
    return this.documentsService.getDocument(id);
  }

  @Post(':id/chat')
  async addMessage(
    @Param('id') id: string,
    @Body() body: { content: string; role: string },
  ) {
    return this.documentsService.addMessage(id, body.content, body.role);
  }

  @Delete(':id')
  async deleteDocument(@Param('id') id: string) {
    return this.documentsService.deleteDocument(id);
  }

  @Patch(':id')
  async renameDocument(
    @Param('id') id: string,
    @Body() body: { name: string },
  ) {
    return this.documentsService.renameDocument(id, body.name);
  }
}
