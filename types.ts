export interface CorrectionResponse {
  correctedText: string;
  changesSummary: string;
  tone: string;
}

export interface DiffPart {
  value: string;
  added?: boolean;
  removed?: boolean;
}

export enum ToneOption {
  Professional = 'Professional',
  Academic = 'Academic',
  Casual = 'Casual',
  Creative = 'Creative'
}
