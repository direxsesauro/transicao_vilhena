export interface Repasse {
  id: string;
  mes_ano: string; // Formato "YYYY-MM"
  valor: number;
  observacoes: string;
  data_documento: string; // Formato "YYYY-MM-DD"
  created_at: string;
}

export interface MaisSaude {
  id: string;
  mes_ano: string; // Formato "YYYY-MM"
  valor: number;
  observacoes: string;
  data_documento: string; // Formato "YYYY-MM-DD"
  created_at: string;
}

export type DocumentType = 'contrato' | 'prestacao' | 'extrato' | 'outro';

export interface DownloadItem {
  id: string;
  nome: string;
  tipo: DocumentType;
  descricao?: string; // Nova propriedade adicionada
  data_upload: string;
  tamanho: number; // em bytes
  url: string;
  is_local: boolean;
  content_base64?: string; // para simulação local de download
}


