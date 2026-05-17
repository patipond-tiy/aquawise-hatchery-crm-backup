import { crc32 } from '@/lib/export/crc32';

/**
 * Zero-dependency STORED (no-compression) ZIP writer. Builds a valid ZIP in
 * memory entry-by-entry — adequate for the PCR bundle (a handful of PDFs).
 * Not gzip; "stored" method 0, which every unzip tool reads.
 */
type Entry = { name: string; data: Uint8Array; crc: number; offset: number };

export class ZipBuilder {
  private chunks: Uint8Array[] = [];
  private entries: Entry[] = [];
  private offset = 0;

  add(name: string, data: Uint8Array): void {
    const nameBytes = new TextEncoder().encode(name);
    const crc = crc32(data);
    const local = new Uint8Array(30 + nameBytes.length);
    const dv = new DataView(local.buffer);
    dv.setUint32(0, 0x04034b50, true); // local file header sig
    dv.setUint16(4, 20, true); // version needed
    dv.setUint16(6, 0, true); // flags
    dv.setUint16(8, 0, true); // method = stored
    dv.setUint16(10, 0, true); // mod time
    dv.setUint16(12, 0, true); // mod date
    dv.setUint32(14, crc, true);
    dv.setUint32(18, data.length, true); // compressed size
    dv.setUint32(22, data.length, true); // uncompressed size
    dv.setUint16(26, nameBytes.length, true);
    dv.setUint16(28, 0, true); // extra len
    local.set(nameBytes, 30);

    this.entries.push({ name, data, crc, offset: this.offset });
    this.chunks.push(local, data);
    this.offset += local.length + data.length;
  }

  finish(): Uint8Array {
    const central: Uint8Array[] = [];
    let centralSize = 0;
    for (const e of this.entries) {
      const nameBytes = new TextEncoder().encode(e.name);
      const h = new Uint8Array(46 + nameBytes.length);
      const dv = new DataView(h.buffer);
      dv.setUint32(0, 0x02014b50, true); // central dir sig
      dv.setUint16(4, 20, true);
      dv.setUint16(6, 20, true);
      dv.setUint16(8, 0, true);
      dv.setUint16(10, 0, true);
      dv.setUint16(12, 0, true);
      dv.setUint16(14, 0, true);
      dv.setUint32(16, e.crc, true);
      dv.setUint32(20, e.data.length, true);
      dv.setUint32(24, e.data.length, true);
      dv.setUint16(28, nameBytes.length, true);
      dv.setUint16(30, 0, true);
      dv.setUint16(32, 0, true);
      dv.setUint16(34, 0, true);
      dv.setUint16(36, 0, true);
      dv.setUint32(38, 0, true);
      dv.setUint32(42, e.offset, true);
      h.set(nameBytes, 46);
      central.push(h);
      centralSize += h.length;
    }
    const eocd = new Uint8Array(22);
    const edv = new DataView(eocd.buffer);
    edv.setUint32(0, 0x06054b50, true);
    edv.setUint16(8, this.entries.length, true);
    edv.setUint16(10, this.entries.length, true);
    edv.setUint32(12, centralSize, true);
    edv.setUint32(16, this.offset, true);

    const all = [...this.chunks, ...central, eocd];
    const total = all.reduce((a, c) => a + c.length, 0);
    const out = new Uint8Array(total);
    let p = 0;
    for (const c of all) {
      out.set(c, p);
      p += c.length;
    }
    return out;
  }
}
