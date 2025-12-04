import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    // Inicializa o cliente com a Service Role (Admin) para ignorar RLS
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY!,
    );
  }

  async uploadFile(file: Express.Multer.File, userId: string) {
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExtension}`;

    const { data, error } = await this.supabase.storage
      .from('invoices') // Nome do bucket que criamos
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw new Error(`Upload falhou: ${error.message}`);
    }

    // Gerar URL pública para o OpenAI e Frontend acessarem
    const { data: publicUrlData } = this.supabase.storage
      .from('invoices')
      .getPublicUrl(fileName);

    return {
      path: data.path,
      publicUrl: publicUrlData.publicUrl,
      fileName: file.originalname,
    };
  }
}
