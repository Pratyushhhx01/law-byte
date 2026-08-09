import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { NodeHttpHandler } from "@smithy/node-http-handler";

const AWS_REGION = process.env.AWS_REGION || "ap-south-1";
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;

export const S3_BUCKET = process.env.S3_BUCKET_NAME || "lawbite-app-storage";

export const s3Client = new S3Client({
  region: AWS_REGION,
  ...(AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY
    ? {
        credentials: {
          accessKeyId: AWS_ACCESS_KEY_ID,
          secretAccessKey: AWS_SECRET_ACCESS_KEY,
        },
      }
    : {}),
  requestHandler: new NodeHttpHandler({
    requestTimeout: 10000,
    connectionTimeout: 5000,
  }),
});

const s3 = s3Client;
const BUCKET = S3_BUCKET;

async function getJson<T>(key: string): Promise<T | null> {
  try {
    const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: key });
    const res = await s3.send(cmd);
    const body = await res.Body?.transformToString();
    return body ? JSON.parse(body) : null;
  } catch {
    return null;
  }
}

async function getText(key: string): Promise<string | null> {
  try {
    const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: key });
    const res = await s3.send(cmd);
    return (await res.Body?.transformToString()) || null;
  } catch {
    return null;
  }
}

/** Extract a specific section from an act's full.txt by section number */
async function getSectionFromFullText(actName: string, section: string): Promise<{ section: string; title: string; text: string } | null> {
  const full = await getText(`bare-acts/${actName}/full.txt`);
  if (!full) return null;
  const secIndex = await getJson<Array<{ section: string; title: string }>>(
    `bare-acts/${actName}/_sections.json`
  );
  if (!secIndex) return null;
  const entry = secIndex.find(s => s.section === section);
  if (!entry) return null;
  const lines = full.split('\n');
  const numPart = section.replace(/[A-Za-z]/g, '');

  // Find start of section using boundary-aware search
  let startIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    const searchStr = `${section}.`;
    const idx = trimmed.indexOf(searchStr);
    if (idx === -1) continue;
    // Ensure not preceded by a digit (avoids matching "1" inside "101")
    if (idx > 0 && /\d/.test(trimmed[idx - 1])) continue;
    // Ensure followed by space, paren, bracket, or uppercase letter
    const after = trimmed.substring(idx + searchStr.length, idx + searchStr.length + 1);
    if (after.match(/\s|\(|\[|[A-Z]/)) {
      startIdx = i; break;
    }
  }
  if (startIdx === -1) return null;

  // Find end boundary - next section with higher numeric value
  let endIdx = lines.length;
  for (let i = startIdx + 1; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    const nextMatch = trimmed.match(/^(\d+[A-Za-z]?)\s*\.(?:\s|\(|[A-Z])/m);
    if (nextMatch) {
      const nextN = nextMatch[1].replace(/[A-Za-z]/g, '');
      if (nextN !== '' && parseInt(nextN) > parseInt(numPart) && nextMatch[1] !== section) {
        endIdx = i; break;
      }
    }
  }

  const text = lines.slice(startIdx, endIdx).join('\n').trim();
  return text ? { section, title: entry.title, text } : null;
}

export const s3kb = {
  /** Get a full bare act as structured JSON */
  getAct(actName: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return getJson<Record<string, any>>(`bare-acts/${actName}/index.json`);
  },
  /** Get a specific section from an act */
  async getSection(actName: string, section: string) {
    const direct = await getJson<{ section: string; title: string; text: string } | null>(
      `bare-acts/${actName}/sections/${section}.json`
    );
    if (direct) return direct;
    return getSectionFromFullText(actName, section);
  },
  /** Get the full act index */
  getFullTextIndex() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return getJson<any[]>("bare-acts/_index.json");
  },
  /** Get the section list (titles only) for an act */
  getSectionList(actName: string) {
    return getJson<Array<{ section: string; title: string }>>(`bare-acts/${actName}/_sections.json`);
  },
  /** Search across all acts (returns matching sections) */
  async searchActs(query: string): Promise<Array<{ act: string; section: string; title: string; text: string }>> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = await getJson<any[]>("bare-acts/_index.json");
    if (!raw) return [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const acts: string[] = raw.map((e: any) => typeof e === 'string' ? e : e.id);
    const results: Array<{ act: string; section: string; title: string; text: string }> = [];
    const lower = query.toLowerCase();
    for (const actId of acts) {
      const sections = await getJson<Array<{ section: string; title: string }>>(
        `bare-acts/${actId}/_sections.json`
      );
      if (!sections) continue;
      for (const s of sections) {
        if (s.title && s.title.toLowerCase().includes(lower)) {
          results.push({ act: actId, section: s.section, title: s.title, text: '' });
        }
      }
    }
    return results;
  },
  /** Get reference data (e.g. limitation periods, bailable offenses) */
  getReference<T>(key: string) {
    return getJson<T>(`reference/${key}.json`);
  },
  /** Get the full text of an act */
  getFullText(actName: string) {
    return getText(`bare-acts/${actName}/full.txt`);
  },
};
