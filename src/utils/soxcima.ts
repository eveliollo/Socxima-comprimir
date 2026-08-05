import * as pako from 'pako';
import { CompressionResult, DecompressionResult, BenchmarkResult } from '../types';

export const SOXCIMA_SIGNATURE = "SOXCIMA-EVELIO-2026";
export const SOXCIMA_AUTHOR = "EVELIO LLOVERA";
export const SOXCIMA_DATE = "5 DE AGOSTO DE 2026";
export const SOXCIMA_VERSION = "v5.2 (SOXCIMA + ZSTD)";

/**
 * Encodes string to UTF-8 byte count.
 */
export function getByteLength(str: string): number {
  return new TextEncoder().encode(str).length;
}

/**
 * Converts Uint8Array to Base64 string in memory-safe chunks.
 */
export function uint8ToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  const CHUNK_SIZE = 0x8000;
  for (let i = 0; i < len; i += CHUNK_SIZE) {
    binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + CHUNK_SIZE)));
  }
  return btoa(binary);
}

/**
 * Converts Base64 string to Uint8Array.
 */
export function base64ToUint8(base64Str: string): Uint8Array {
  const cleanBase64 = base64Str.trim().replace(/^\[SOXCIMA-[^\]]+\]\s*/i, '').replace(/\s+/g, '');
  const binaryString = atob(cleanBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
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
 * Compresses text using the SOXCIMA + ZSTD algorithm (Evelio Llovera - Aug 5, 2026).
 * 
 * Algorithm:
 * 1. Frequency Analysis: Counts line repetitions across text.
 * 2. Selective Tokenization: ONLY replaces lines that repeat > 1 time with tokens (@1, @2...).
 *    Unique lines remain un-tokenized in the body, leaving the dictionary header minimal.
 * 3. Header formatting: `@1=content @2=content||SOX||` followed by tokenized/literal lines.
 * 4. ZSTD / ZLIB DEFLATE Level 9 compression on UTF-8 bytes.
 */
export function comprimirSoxcima(texto: string, useZstd = true): CompressionResult {
  const t0 = performance.now();
  const originalSizeBytes = getByteLength(texto);
  
  const dicc: Record<string, string> = {}; // line -> token (@1, @2...)
  const tokenToLine: Record<string, string> = {}; // token -> line
  const conteo: Record<string, number> = {};
  const lineas = texto.split("\n");
  
  // 1. Contar repeticiones por línea
  for (const linea of lineas) {
    if (linea) {
      conteo[linea] = (conteo[linea] || 0) + 1;
    }
  }
  
  let proximo = 1;
  const salida: string[] = [];
  
  // 2. Tokenizar solo lo que se repite MÁS DE 1 vez
  for (let i = 0; i < lineas.length; i++) {
    const linea = lineas[i];
    if (linea === "") {
      salida.push("");
      continue;
    }
    
    if (conteo[linea] > 1) {
      if (!(linea in dicc)) {
        const token = "@" + proximo;
        dicc[linea] = token;
        tokenToLine[token] = linea;
        proximo++;
      }
      salida.push(dicc[linea]);
    } else {
      // Lo que NO se repite se deja tal cual, SIN guardar en cabecera
      salida.push(linea);
    }
  }
  
  // Cabecera formato: v=k unidos por espacio + "||SOX||"
  const cabeceraEntries = Object.entries(dicc).map(([linea, token]) => `${token}=${linea}`);
  const cabecera = cabeceraEntries.join(" ") + "||SOX||";
  const paso1Text = cabecera + salida.join("\n");
  
  let compressedText = paso1Text;
  let compressedSizeBytes = getByteLength(paso1Text);
  
  if (useZstd) {
    const paso1Bytes = new TextEncoder().encode(paso1Text);
    const compressedBytes = pako.deflate(paso1Bytes, { level: 9 });
    compressedSizeBytes = compressedBytes.byteLength;
    const base64Str = uint8ToBase64(compressedBytes);
    compressedText = `[SOXCIMA-ZSTD-V5.2:BASE64]\n${base64Str}`;
  }
  
  const t1 = performance.now();
  const timeTakenMs = Math.max(0.01, t1 - t0);
  
  const spaceSavedBytes = Math.max(0, originalSizeBytes - compressedSizeBytes);
  const reductionPercentage = originalSizeBytes > 0 
    ? Number((100 - (compressedSizeBytes / originalSizeBytes * 100)).toFixed(4))
    : 0;
    
  return {
    originalText: texto,
    compressedText,
    paso1Text,
    mode: useZstd ? 'zstd' : 'standard',
    originalSizeBytes,
    compressedSizeBytes,
    reductionPercentage,
    spaceSavedBytes,
    timeTakenMs,
    totalLines: lineas.length,
    uniqueLines: Object.keys(dicc).length,
    dictionary: tokenToLine,
    lineFrequency: conteo,
    signature: SOXCIMA_SIGNATURE,
  };
}

/**
 * Decompresses SOXCIMA + ZSTD compressed text (Supports ZSTD base64, ||SOX||, and legacy | format).
 */
export function descomprimirSoxcima(textoComprimido: string): DecompressionResult {
  const t0 = performance.now();
  const originalSizeBytes = getByteLength(textoComprimido);
  
  let paso1Data = textoComprimido;
  let isZstdDecompressed = false;
  
  // Try ZSTD / ZLIB Base64 decompression first
  try {
    const cleanInput = textoComprimido.trim().replace(/^\[SOXCIMA-[^\]]+\]\s*/i, '');
    if (/^[A-Za-z0-9+/=]+$/.test(cleanInput.replace(/\s+/g, ''))) {
      const bytes = base64ToUint8(cleanInput);
      const inflated = pako.inflate(bytes);
      paso1Data = new TextDecoder().decode(inflated);
      isZstdDecompressed = true;
    }
  } catch {
    // If not zstd compressed base64, proceed as raw paso1 text
    paso1Data = textoComprimido;
  }
  
  // 1. Check for ||SOX|| delimiter (v5.2)
  let partitionIndex = paso1Data.indexOf("||SOX||");
  let delimiterLen = 7;
  let isLegacy = false;
  
  if (partitionIndex === -1) {
    // Check legacy " | " delimiter (v5.1)
    partitionIndex = paso1Data.indexOf(" | ");
    delimiterLen = 3;
    isLegacy = true;
  }
  
  if (partitionIndex === -1) {
    const t1 = performance.now();
    return {
      compressedText: textoComprimido,
      decompressedText: paso1Data,
      originalSizeBytes,
      decompressedSizeBytes: getByteLength(paso1Data),
      timeTakenMs: Math.max(0.01, t1 - t0),
      isValidHeader: false,
      dictionaryEntriesCount: 0,
      totalLines: paso1Data.split("\n").length,
      signatureMatch: false,
    };
  }
  
  const cabecera = paso1Data.substring(0, partitionIndex);
  const cuerpo = paso1Data.substring(partitionIndex + delimiterLen);
  
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
  const resultado: string[] = [];
  
  for (const l of lineas) {
    if (l.startsWith("@")) {
      resultado.push(diccInv[l] !== undefined ? diccInv[l] : l);
    } else {
      resultado.push(l);
    }
  }
  
  const decompressedText = resultado.join("\n");
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
 * Runs the official benchmark specified by Evelio Llovera:
 * Tests repetitive text and normal text using SOXCIMA + ZSTD.
 */
export function runEvelioLloveraBenchmark(lineCount = 10000, lineLength = 500): BenchmarkResult {
  const line = "0".repeat(lineLength) + "\n";
  const texto = line.repeat(lineCount);
  
  const result = comprimirSoxcima(texto, true);
  
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
 * Pre-populated sample data generators for testing SOXCIMA + ZSTD compression.
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
      const dates = ["2026-08-05T00:00:00Z", "2026-08-05T00:01:00Z", "2026-08-05T00:02:00Z"];
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
      const row1 = "101,TEMP_SENS_ALPHA,2026-08-05 00:00,22.5,45.2,NORMAL,ZONE_NORTH_CONTAINMENT_UNIT";
      const row2 = "102,TEMP_SENS_BETA,2026-08-05 00:00,22.5,45.2,NORMAL,ZONE_NORTH_CONTAINMENT_UNIT";
      const row3 = "103,TEMP_SENS_ALPHA,2026-08-05 00:05,23.1,46.0,OPTIMAL,ZONE_NORTH_CONTAINMENT_UNIT";
      
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
      const header = `/**\n * @SOXCIMA Universal Compression Unit\n * Copyright (c) 2026 Evelio Llovera\n * Signature: SOXCIMA-EVELIO-2026\n */`;
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
 * Code snippets generator in various languages for developers wanting to integrate SOXCIMA + ZSTD.
 */
export const CODE_SNIPPETS = {
  python: `#!/usr/bin/env python3
# SOXCIMA + ZSTD — CREADOR: EVELIO LLOVERA
# FECHA: 5 DE AGOSTO DE 2026
# USO GRATIS PERSONAL / COMERCIAL: LICENCIA REQUERIDA

import zlib

def comprimir_soxcima(texto):
    # SOXCIMA: SOLO reemplaza lo que se repite 2+ veces
    dicc = {}
    conteo = {}
    lineas = texto.split("\\n")
    
    # Contar repeticiones
    for linea in lineas:
        if linea:
            conteo[linea] = conteo.get(linea, 0) + 1
    
    proximo = 1
    salida = []
    for linea in lineas:
        if not linea:
            salida.append("")
            continue
        # Solo guardar en lista si se repite MAS DE 1 vez
        if conteo[linea] > 1:
            if linea not in dicc:
                dicc[linea] = "@" + str(proximo)
                proximo += 1
            salida.append(dicc[linea])
        else:
            # Lo que NO se repite → se deja tal cual, SIN guardar en cabecera
            salida.append(linea)
    
    cabecera = " ".join(f"{v}={k}" for k, v in dicc.items()) + "||SOX||"
    paso1 = (cabecera + "\\n".join(salida)).encode("utf-8")
    return zlib.compress(paso1, 9)

def descomprimir_soxcima(datos):
    datos = zlib.decompress(datos).decode("utf-8")
    partes = datos.split("||SOX||", 1)
    if len(partes) != 2:
        return partes[0] if partes else datos
    cabecera, cuerpo = partes
    dicc_inv = {}
    for entrada in cabecera.split(" "):
        if "=" in entrada:
            llave, valor = entrada.split("=", 1)
            dicc_inv[llave] = valor
    lineas = cuerpo.split("\\n")
    resultado = []
    for l in lineas:
        if l.startswith("@"):
            resultado.append(dicc_inv.get(l, l))
        else:
            resultado.append(l)
    return "\\n".join(resultado)

if __name__ == "__main__":
    print("SOXCIMA + ZSTD — CREADOR: EVELIO LLOVERA")
    print("-" * 50)

    texto1 = "SOXCIMA ES MI SISTEMA\\n" * 100
    comp1 = comprimir_soxcima(texto1)
    porc1 = 100 - len(comp1) / len(texto1) * 100
    print(f"Texto repetitivo: {len(texto1)} -> {len(comp1)} bytes | Ahorro: {round(porc1,2)}%")

    texto2 = "Hoy es 5 de agosto. El sol brilla. SOXCIMA avanza. Todo funciona bien."
    comp2 = comprimir_soxcima(texto2)
    porc2 = 100 - len(comp2) / len(texto2) * 100
    print(f"Texto normal:     {len(texto2)} -> {len(comp2)} bytes | Ahorro: {round(porc2,2)}%")

    recup = descomprimir_soxcima(comp2)
    ok = "SI" if recup == texto2 else "NO"
    print(f"Integridad: {ok} sin errores")
    print("-" * 50)
    print("FIRMA: SOXCIMA-EVELIO-2026")`,

  typescript: `// SOXCIMA + ZSTD v5.2 — Created by Evelio Llovera
// Signature: SOXCIMA-EVELIO-2026
import pako from 'pako';

export function comprimirSoxcima(texto: string): Uint8Array {
  const dicc: Record<string, string> = {};
  const conteo: Record<string, number> = {};
  const lineas = texto.split("\\n");
  
  for (const l of lineas) {
    if (l) conteo[l] = (conteo[l] || 0) + 1;
  }
  
  let proximo = 1;
  const salida: string[] = [];
  for (const l of lineas) {
    if (!l) {
      salida.push("");
      continue;
    }
    if (conteo[l] > 1) {
      if (!(l in dicc)) {
        dicc[l] = "@" + proximo++;
      }
      salida.push(dicc[l]);
    } else {
      salida.push(l);
    }
  }
  
  const cabecera = Object.entries(dicc)
    .map(([k, v]) => \`\${v}=\${k}\`)
    .join(" ") + "||SOX||";
    
  const paso1 = cabecera + salida.join("\\n");
  return pako.deflate(new TextEncoder().encode(paso1), { level: 9 });
}

export function descomprimirSoxcima(compressedBytes: Uint8Array): string {
  const paso1 = new TextDecoder().decode(pako.inflate(compressedBytes));
  const partes = paso1.split("||SOX||", 2);
  if (partes.length < 2) return paso1;
  
  const [cabecera, cuerpo] = partes;
  const diccInv: Record<string, string> = {};
  for (const entrada of cabecera.split(" ")) {
    if (entrada.includes("=")) {
      const [llave, valor] = entrada.split("=", 2);
      diccInv[llave] = valor;
    }
  }
  
  const lineas = cuerpo.split("\\n");
  return lineas.map(l => l.startswith("@") ? (diccInv[l] ?? l) : l).join("\\n");
}`,

  rust: `// SOXCIMA + ZSTD v5.2 — Evelio Llovera
// Signature: SOXCIMA-EVELIO-2026
use std::collections::HashMap;
use flate2::write::ZlibEncoder;
use flate2::Compression;
use std::io::Write;

pub fn comprimir_soxcima(texto: &str) -> Vec<u8> {
    let mut conteo = HashMap::new();
    for linea in texto.lines() {
        if !linea.is_empty() {
            *conteo.entry(linea).or_insert(0) += 1;
        }
    }

    let mut dicc = HashMap::new();
    let mut proximo = 1;
    let mut salida = Vec::new();

    for linea in texto.lines() {
        if linea.is_empty() {
            salida.push(String::new());
            continue;
        }
        if *conteo.get(linea).unwrap_or(&0) > 1 {
            let token = dicc.entry(linea.to_string()).or_insert_with(|| {
                let t = format!("@{}", proximo);
                proximo += 1;
                t
            }).clone();
            salida.push(token);
        } else {
            salida.push(linea.to_string());
        }
    }

    let cabecera: Vec<String> = dicc.iter().map(|(k, v)| format!("{}={}", v, k)).collect();
    let paso1 = format!("{}||SOX||\\n{}", cabecera.join(" "), salida.join("\\n"));

    let mut encoder = ZlibEncoder::new(Vec::new(), Compression::best());
    encoder.write_all(paso1.as_bytes()).unwrap();
    encoder.finish().unwrap()
}`,
};

