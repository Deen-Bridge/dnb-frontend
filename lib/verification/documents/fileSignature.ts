export const SIGNATURE_BYTE_LENGTH = 12;

interface AcceptedSignature {
  mime: string;
  label: string;
  prefixes: number[][];
}

interface HostileSignature {
  label: string;
  prefixes: number[][];
}

const ACCEPTED_SIGNATURES: AcceptedSignature[] = [
  {
    mime: "application/pdf",
    label: "PDF",
    prefixes: [[0x25, 0x50, 0x44, 0x46, 0x2d]],
  },
  {
    mime: "image/jpeg",
    label: "JPEG image",
    prefixes: [[0xff, 0xd8, 0xff]],
  },
  {
    mime: "image/png",
    label: "PNG image",
    prefixes: [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  },
];

const KNOWN_HOSTILE_SIGNATURES: HostileSignature[] = [
  { label: "Windows executable", prefixes: [[0x4d, 0x5a]] },
  { label: "Linux executable", prefixes: [[0x7f, 0x45, 0x4c, 0x46]] },
  {
    label: "Mach-O executable",
    prefixes: [
      [0xfe, 0xed, 0xfa, 0xce],
      [0xfe, 0xed, 0xfa, 0xcf],
      [0xcf, 0xfa, 0xed, 0xfe],
      [0xca, 0xfe, 0xba, 0xbe],
    ],
  },
  { label: "ZIP or Office archive", prefixes: [[0x50, 0x4b, 0x03, 0x04]] },
  { label: "RAR archive", prefixes: [[0x52, 0x61, 0x72, 0x21]] },
  { label: "gzip archive", prefixes: [[0x1f, 0x8b]] },
  { label: "Shell script", prefixes: [[0x23, 0x21]] },
];

export async function readMagicBytes(file: Blob, length: number = SIGNATURE_BYTE_LENGTH): Promise<Uint8Array> {
  const slice = file.slice(0, length);

  if (typeof slice.arrayBuffer === "function") {
    return new Uint8Array(await slice.arrayBuffer());
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
    reader.onerror = () => reject(reader.error ?? new Error("Unreadable file"));
    reader.readAsArrayBuffer(slice);
  });
}

function startsWith(bytes: Uint8Array, prefix: number[]): boolean {
  if (bytes.length < prefix.length) return false;
  return prefix.every((byte, i) => bytes[i] === byte);
}

export function identifySignature(bytes: Uint8Array): { mime: string; label: string } | null {
  for (const entry of ACCEPTED_SIGNATURES) {
    if (entry.prefixes.some((prefix) => startsWith(bytes, prefix))) {
      return { mime: entry.mime, label: entry.label };
    }
  }
  return null;
}

export function identifyHostileSignature(bytes: Uint8Array): string | null {
  for (const entry of KNOWN_HOSTILE_SIGNATURES) {
    if (entry.prefixes.some((prefix) => startsWith(bytes, prefix))) {
      return entry.label;
    }
  }
  return null;
}

export interface FileSignatureInspectionResult {
  detectedMime: string | null;
  detectedLabel: string | null;
  hostileLabel: string | null;
  bytes: Uint8Array;
}

export async function inspectFileSignature(file: Blob): Promise<FileSignatureInspectionResult> {
  const bytes = await readMagicBytes(file);
  const accepted = identifySignature(bytes);
  return {
    detectedMime: accepted?.mime ?? null,
    detectedLabel: accepted?.label ?? null,
    hostileLabel: accepted ? null : identifyHostileSignature(bytes),
    bytes,
  };
}
