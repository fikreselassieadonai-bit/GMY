
export type AudioFormat = string;

export interface FileState {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  status: 'idle' | 'converting' | 'completed' | 'error';
  progress: number;
  outputFormat: AudioFormat;
  outputUrl?: string;
  outputName?: string;
  aiMetadata?: AIMetadata;
}

export interface AIMetadata {
  suggestedTitle: string;
  genre: string;
  mood: string;
  description: string;
}

export interface FormatDefinition {
  ext: string;
  name: string;
}
