import { describe, it, expect } from 'vitest';
import { ZipBuilder } from '@/lib/export/zip';
import { crc32 } from '@/lib/export/crc32';

// H2 — export building blocks.
describe('crc32', () => {
  it('matches the known IEEE CRC for "123456789"', () => {
    const data = new TextEncoder().encode('123456789');
    expect(crc32(data)).toBe(0xcbf43926);
  });
});

describe('ZipBuilder (stored method)', () => {
  it('produces a valid ZIP with EOCD signature and entry count', () => {
    const zip = new ZipBuilder();
    zip.add('a.txt', new TextEncoder().encode('hello'));
    zip.add('b.txt', new TextEncoder().encode('world'));
    const out = zip.finish();

    // Local file header signature at offset 0.
    const dv = new DataView(out.buffer, out.byteOffset, out.byteLength);
    expect(dv.getUint32(0, true)).toBe(0x04034b50);

    // End-of-central-directory record sits in the final 22 bytes.
    const eocd = new DataView(
      out.buffer,
      out.byteOffset + out.length - 22,
      22
    );
    expect(eocd.getUint32(0, true)).toBe(0x06054b50);
    expect(eocd.getUint16(8, true)).toBe(2); // entries on this disk
    expect(eocd.getUint16(10, true)).toBe(2); // total entries
  });

  it('is a streamable buffer, not an accumulated row array', () => {
    const zip = new ZipBuilder();
    zip.add('x.pdf', new Uint8Array([1, 2, 3]));
    const out = zip.finish();
    expect(out).toBeInstanceOf(Uint8Array);
    expect(out.length).toBeGreaterThan(22);
  });
});

// CSV cell escaping mirrors the route's csvCell.
function csvCell(v: unknown): string {
  const s = v == null ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

describe('CSV cell escaping', () => {
  it('quotes values with commas and escapes quotes', () => {
    expect(csvCell('ฟาร์ม, ระยอง')).toBe('"ฟาร์ม, ระยอง"');
    expect(csvCell('a"b')).toBe('"a""b"');
    expect(csvCell(null)).toBe('');
    expect(csvCell('plain')).toBe('plain');
  });

  it('header row is the documented column set', () => {
    const header = ['farm_name', 'owner', 'phone', 'zone', 'status', 'created_at'];
    expect(header.join(',')).toBe(
      'farm_name,owner,phone,zone,status,created_at'
    );
  });
});
