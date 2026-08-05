export interface CompressionResult {
  originalText: string;
  compressedText: string;
  paso1Text?: string;
  mode?: 'zstd' | 'standard';
  originalSizeBytes: number;
  compressedSizeBytes: number;
  reductionPercentage: number;
  spaceSavedBytes: number;
  timeTakenMs: number;
  totalLines: number;
  uniqueLines: number;
  dictionary: Record<string, string>; // "@1" -> "line content"
  lineFrequency: Record<string, number>; // "line content" -> count
  signature: string;
}

export interface DecompressionResult {
  compressedText: string;
  decompressedText: string;
  originalSizeBytes: number;
  decompressedSizeBytes: number;
  timeTakenMs: number;
  isValidHeader: boolean;
  dictionaryEntriesCount: number;
  totalLines: number;
  signatureMatch: boolean;
}

export interface BenchmarkConfig {
  repeatPattern: string;
  lineLength: number;
  lineCount: number;
}

export interface BenchmarkResult {
  name: string;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  reductionPercentage: number;
  timeTakenMs: number;
  totalLines: number;
  uniqueLines: number;
  throughputMBps: number;
}

export interface CompressionHistoryItem {
  id: string;
  timestamp: Date;
  fileName?: string;
  mode: 'compress' | 'decompress';
  originalSize: number;
  resultSize: number;
  reductionRatio: number;
}
