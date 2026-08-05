import { CompressionResult, DecompressionResult, BenchmarkResult } from '../types';

export const SOXCIMA_SIGNATURE = "SOXCIMA-7G-LLAVE-ORIGINAL";
export const SOXCIMA_AUTHOR = "EVELIO LLOVERA";
export const SOXCIMA_DATE = "4 DE AGOSTO DE 2026";
export const SOXCIMA_VERSION = "v5.1";

/**
 * Encodes string to UTF-8 byte count.
 */
export function getByteLength(str: string): number {
  return new TextEncoder().encode(str).length;
}

/**
 * Format bytes into human readable format (Bytes, KB, MB, GB).
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Compresses text using the SOXCIMA v5.1 algorithm (Evelio Llovera).
 * 
 * Algorithm:
 * - Reads line by line.
 * - Empty lines are preserved.
 * - Map unique line strings to tokens (@1, @2, @3...).
 * - Constructs header mapping "@1=line @2=line | " followed by token body separated by newlines.
 */
export function comprimirSoxcima(texto: string): CompressionResult {
  const t0 = performance.now();
  const originalSizeBytes = getByteLength(texto);
  
  const dicc: Record<string, string> = {}; // line -> token
  const tokenToLine: Record<string, string> = {}; // token -> line
  const lineFrequency: Record<string, number> = {};
  
  let prox = 1;
  const salida: string[] = [];
  const lineas = texto.split("\n");
  
  for (let i = 0; i < lineas.length; i++) {
    const linea = lineas[i];
    if (linea === "") {
      salida.push("");
      continue;
    }
    
    lineFrequency[linea] = (lineFrequency[linea] || 0) + 1;
    
    if (!(linea in dicc)) {
      const token = "@" + prox;
      dicc[linea] = token;
      tokenToLine[token] = linea;
      prox++;
    }
    salida.push(dicc[linea]);
  }
  
  // Header generation: v + "=" + k for k, v in dicc.items()
  const cabeceraEntries = Object.entries(dicc).map(([linea, token]) => `${token}=${linea}`);
  const cabecera = cabeceraEntries.join(" ") + " | ";
  const compressedText = cabecera + salida.join("\n");
  
  const t1 = performance.now();
  const timeTakenMs = Math.max(0.01, t1 - t0);
  const compressedSizeBytes = getByteLength(compressedText);
  
  const spaceSavedBytes = Math.max(0, originalSizeBytes - compressedSizeBytes);
  const reductionPercentage = originalSizeBytes > 0 
    ? Number((100 - (compressedSizeBytes / originalSizeBytes * 100)).toFixed(4))
    : 0;
    
  return {
    originalText: texto,
    compressedText,
    originalSizeBytes,
    compressedSizeBytes,
    reductionPercentage,
    spaceSavedBytes,
    timeTakenMs,
    totalLines: lineas.length,
    uniqueLines: Object.keys(dicc).length,
    dictionary: tokenToLine,
    lineFrequency,
    signature: SOXCIMA_SIGNATURE,
  };
}

/**
 * Decompresses SOXCIMA v5.1 formatted compressed text.
 */
export function descomprimirSoxcima(textoComprimido: string): DecompressionResult {
  const t0 = performance.now();
  const originalSizeBytes = getByteLength(textoComprimido);
  
  const partitionIndex = textoComprimido.indexOf(" | ");
  if (partitionIndex === -1) {
    const t1 = performance.now();
    return {
      compressedText: textoComprimido,
      decompressedText: textoComprimido,
      originalSizeBytes,
      decompressedSizeBytes: originalSizeBytes,
      timeTakenMs: Math.max(0.01, t1 - t0),
      isValidHeader: false,
      dictionaryEntriesCount: 0,
      totalLines: 0,
      signatureMatch: false,
    };
  }
  
  const cabecera = textoComprimido.substring(0, partitionIndex);
  const cuerpo = textoComprimido.substring(partitionIndex + 3);
  
  const diccInv: Record<string, string> = {};
  const entradas = cabecera.split(" ");
  
  for (const entrada of entradas) {
    if (entrada.includes("=")) {
      const eqIdx = entrada.indexOf("=");
      const llave = entrada.substring(0, eqIdx);
      const valor = entrada.substring(eqIdx + 1);
      diccInv[llave] = valor;
    }
  }
  
  const lineas = cuerpo.split("\n");
  const decompressedLines = lineas.map(l => diccInv[l] !== undefined ? diccInv[l] : l);
  const decompressedText = decompressedLines.join("\n");
  
  const t1 = performance.now();
  const decompressedSizeBytes = getByteLength(decompressedText);
  
  return {
    compressedText: textoComprimido,
    decompressedText,
    originalSizeBytes,
    decompressedSizeBytes,
    timeTakenMs: Math.max(0.01, t1 - t0),
    isValidHeader: true,
    dictionaryEntriesCount: Object.keys(diccInv).length,
    totalLines: lineas.length,
    signatureMatch: true,
  };
}

/**
 * Runs the benchmark specified by Evelio Llovera in the Python reference code:
 * "0" * 1000 + "\n" repeated 50,000 times (approx 50MB of repetitive data).
 */
export function runEvelioLloveraBenchmark(lineCount = 10000, lineLength = 500): BenchmarkResult {
  const line = "0".repeat(lineLength) + "\n";
  const texto = line.repeat(lineCount);
  
  const result = comprimirSoxcima(texto);
  
  const sizeInMB = result.originalSizeBytes / (1024 * 1024);
  const timeInSec = Math.max(0.001, result.timeTakenMs / 1000);
  const throughputMBps = Number((sizeInMB / timeInSec).toFixed(2));
  
  return {
    name: `Evelio Llovera Benchmark (${lineCount.toLocaleString()} lines x ${lineLength} chars)`,
    originalSizeBytes: result.originalSizeBytes,
    compressedSizeBytes: result.compressedSizeBytes,
    reductionPercentage: result.reductionPercentage,
    timeTakenMs: result.timeTakenMs,
    totalLines: result.totalLines,
    uniqueLines: result.uniqueLines,
    throughputMBps,
  };
}

/**
 * Pre-populated sample data generators for testing SOXCIMA compression.
 */
export const SAMPLE_DATASETS = [
  {
    id: 'evelio_benchmark',
    title: 'Evelio Llovera Official Benchmark',
    description: '1,000 repeating zero lines (500,000 bytes original size)',
    category: 'Benchmark',
    getText: () => ("0".repeat(1000) + "\n").repeat(1000),
  },
  {
    id: 'server_logs',
    title: 'High-Volume Server Logs',
    description: 'Repetitive server access logs with matching IP & status codes',
    category: 'Logs',
    getText: () => {
      const dates = ["2026-08-04T18:00:00Z", "2026-08-04T18:01:00Z", "2026-08-04T18:02:00Z"];
      const ips = ["192.168.1.45", "10.0.0.12", "172.16.0.88"];
      const endpoints = ["/api/v1/healthcheck", "/api/v1/user/profile", "/api/v1/metrics"];
      
      const lines: string[] = [];
      for (let i = 0; i < 300; i++) {
        const ip = ips[i % ips.length];
        const date = dates[i % dates.length];
        const ep = endpoints[i % endpoints.length];
        lines.push(`[${date}] INFO ${ip} GET ${ep} 200 OK - response_time=12ms server_instance=app-us-west-2`);
      }
      return lines.join("\n");
    }
  },
  {
    id: 'csv_data',
    title: 'Duplicate CSV Sensor Records',
    description: 'Tabular IoT sensor readings with recurring state flags',
    category: 'CSV Data',
    getText: () => {
      const header = "id,sensor_id,timestamp,temperature_c,humidity_pct,status,location_zone";
      const row1 = "101,TEMP_SENS_ALPHA,2026-08-04 18:00,22.5,45.2,NORMAL,ZONE_NORTH_CONTAINMENT_UNIT";
      const row2 = "102,TEMP_SENS_BETA,2026-08-04 18:00,22.5,45.2,NORMAL,ZONE_NORTH_CONTAINMENT_UNIT";
      const row3 = "103,TEMP_SENS_ALPHA,2026-08-04 18:05,23.1,46.0,OPTIMAL,ZONE_NORTH_CONTAINMENT_UNIT";
      
      const lines = [header];
      for (let i = 0; i < 400; i++) {
        const sel = i % 3;
        lines.push(sel === 0 ? row1 : sel === 1 ? row2 : row3);
      }
      return lines.join("\n");
    }
  },
  {
    id: 'code_boilerplate',
    title: 'Source Code with Duplicate Imports',
    description: 'TypeScript/JavaScript file structure with duplicate header comments & import lines',
    category: 'Source Code',
    getText: () => {
      const header = `/**\n * @SOXCIMA Universal Compression Unit\n * Copyright (c) 2026 Evelio Llovera\n * Signature: SOXCIMA-7G-LLAVE-ORIGINAL\n */`;
      const importBlock = `import React from 'react';\nimport { useState, useEffect, useMemo, useCallback } from 'react';\nimport { motion, AnimatePresence } from 'motion/react';`;
      
      const fnBlock = `export function processDataPipeline(inputData: string) {\n  const sanitized = inputData.trim();\n  if (!sanitized) return null;\n  return { ok: true, timestamp: Date.now() };\n}`;
      
      const blocks = [];
      for (let i = 0; i < 50; i++) {
        blocks.push(header);
        blocks.push(importBlock);
        blocks.push(fnBlock);
      }
      return blocks.join("\n\n");
    }
  }
];

/**
 * Code snippets generator in various languages for developers wanting to integrate SOXCIMA.
 */
export const CODE_SNIPPETS = {
  python: `# =====================================================
#   SOXCIMA-COMPRIMIR — SISTEMA DE COMPRESIÓN UNIVERSAL
#   CREADOR: EVELIO LLOVERA
#   FECHA: 4 DE AGOSTO DE 2026
#   FIRMA ÚNICA: SOXCIMA-7G-LLAVE-ORIGINAL
# =====================================================
#   CONDICIONES DE USO — NO BORRAR NI MODIFICAR:
#   ✅ GRATIS: Para personas, uso personal y educativo
#   💰 COMERCIAL: Cualquier empresa o negocio que gane
#      dinero con este sistema debe pagar licencia al creador
#   ✅ Esta cabecera NUNCA se borra, ni se cambia, ni se mueve
# =====================================================

def comprimir_soxcima(texto):
    dicc = {}
    proximo = 1
    salida = []
    lineas = texto.split("\\n")
    for linea in lineas:
        if not linea:
            salida.append("")
            continue
        if linea not in dicc:
            dicc[linea] = "@" + str(proximo)
            proximo += 1
        salida.append(dicc[linea])
    cabecera = " ".join(v + "=" + k for k, v in dicc.items()) + " | "
    return cabecera + "\\n".join(salida)

def descomprimir_soxcima(texto_comprimido):
    partes = texto_comprimido.split(" | ", 1)
    if len(partes) != 2:
        return texto_comprimido
    cabecera, cuerpo = partes
    dicc_inv = {}
    for entrada in cabecera.split(" "):
        if "=" in entrada:
            llave, valor = entrada.split("=", 1)
            dicc_inv[llave] = valor
    lineas = cuerpo.split("\\n")
    return "\\n".join(dicc_inv.get(l, l) for l in lineas)`,

  typescript: `// SOXCIMA v5.1 — Created by Evelio Llovera
// Signature: SOXCIMA-7G-LLAVE-ORIGINAL

export function comprimirSoxcima(texto: string): string {
  const dicc: Record<string, string> = {};
  let prox = 1;
  const salida: string[] = [];
  const lineas = texto.split("\\n");
  
  for (const linea of lineas) {
    if (!linea) {
      salida.push("");
      continue;
    }
    if (!(linea in dicc)) {
      dicc[linea] = "@" + prox++;
    }
    salida.push(dicc[linea]);
  }
  
  const cabecera = Object.entries(dicc)
    .map(([k, v]) => \`\${v}=\${k}\`)
    .join(" ") + " | ";
    
  return cabecera + salida.join("\\n");
}

export function descomprimirSoxcima(textoComprimido: string): string {
  const partes = textoComprimido.split(" | ", 2);
  if (partes.length < 2) return textoComprimido;
  
  const [cabecera, cuerpo] = partes;
  const diccInv: Record<string, string> = {};
  
  for (const entrada of cabecera.split(" ")) {
    if (entrada.includes("=")) {
      const [llave, valor] = entrada.split("=", 2);
      diccInv[llave] = valor;
    }
  }
  
  const lineas = cuerpo.split("\\n");
  return lineas.map(l => diccInv[l] ?? l).join("\\n");
}`,

  rust: `// SOXCIMA v5.1 — Evelio Llovera
// Signature: SOXCIMA-7G-LLAVE-ORIGINAL
use std::collections::HashMap;

pub fn comprimir_soxcima(texto: &str) -> String {
    let mut dicc = HashMap::new();
    let mut prox = 1;
    let mut salida = Vec::new();

    for linea in texto.lines() {
        if linea.is_empty() {
            salida.push(String::new());
            continue;
        }
        let token = dicc.entry(linea.to_string()).or_insert_with(|| {
            let t = format!("@{}", prox);
            prox += 1;
            t
        }).clone();
        salida.push(token);
    }

    let cabecera: Vec<String> = dicc.iter().map(|(k, v)| format!("{}={}", v, k)).collect();
    format!("{} | \\n{}", cabecera.join(" "), salida.join("\\n"))
}`,
};
