import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import {
  type ObjectAclPolicy,
  ObjectPermission,
  type StorageFile,
} from "./objectAcl";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const UPLOADS_BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? "linkhub";

export { StorageFile };

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

// ---------------------------------------------------------------------------
// Supabase client (lazy singleton)
// ---------------------------------------------------------------------------

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set for storage operations. " +
        "Add them to artifacts/api-server/.env and restore your Supabase project.",
    );
  }
  if (!_client) {
    _client = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });
  }
  return _client;
}

// ---------------------------------------------------------------------------
// Exported storage client (kept for backwards-compat imports in routes)
// ---------------------------------------------------------------------------

export const objectStorageClient = null;

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export class ObjectStorageService {
  /**
   * Search for a public file by path.
   * Public files live under the `public/` prefix in the bucket.
   */
  async searchPublicObject(filePath: string): Promise<StorageFile | null> {
    const client = getClient();
    const path = `public/${filePath}`;
    const parts = path.split("/");
    const folder = parts.slice(0, -1).join("/");
    const filename = parts[parts.length - 1];

    const { data, error } = await client.storage
      .from(UPLOADS_BUCKET)
      .list(folder, { search: filename });

    if (error || !data || data.length === 0) return null;
    const found = data.find((f) => f.name === filename);
    if (!found) return null;
    return { path, bucket: UPLOADS_BUCKET };
  }

  /**
   * Download a file and return a Web Response suitable for piping to Express.
   */
  async downloadObject(
    file: StorageFile,
    cacheTtlSec: number = 3600,
  ): Promise<Response> {
    const client = getClient();
    const { data, error } = await client.storage
      .from(file.bucket)
      .download(file.path);

    if (error || !data) {
      const msg = (error as any)?.message ?? "";
      if (
        msg.toLowerCase().includes("not found") ||
        (error as any)?.status === 404 ||
        (error as any)?.statusCode === 404
      ) {
        throw new ObjectNotFoundError();
      }
      throw new Error(`Supabase download failed: ${msg}`);
    }

    const stream = data.stream() as unknown as ReadableStream<Uint8Array>;
    return new Response(stream, {
      headers: {
        "Content-Type": file.contentType ?? data.type ?? "application/octet-stream",
        "Cache-Control": `public, max-age=${cacheTtlSec}`,
        "Content-Length": String(data.size),
      },
    });
  }

  /**
   * Create a signed upload URL. The client will PUT the file directly to
   * this URL (bypassing the API server for the actual upload bytes).
   */
  async getObjectEntityUploadURL(): Promise<string> {
    const client = getClient();
    const objectId = randomUUID();
    const path = `uploads/${objectId}`;

    const { data, error } = await client.storage
      .from(UPLOADS_BUCKET)
      .createSignedUploadUrl(path);

    if (error || !data) {
      throw new Error(
        `Failed to create signed upload URL: ${(error as any)?.message ?? "unknown error"}`,
      );
    }
    return data.signedUrl;
  }

  /**
   * Convert a Supabase signed-upload URL to an internal `/objects/<path>` reference.
   *
   * Supabase signed upload URL format:
   *   https://<project>.supabase.co/storage/v1/object/upload/sign/<bucket>/<path>?token=...
   */
  normalizeObjectEntityPath(rawPath: string): string {
    try {
      const url = new URL(rawPath);
      if (url.hostname.endsWith(".supabase.co")) {
        const match = url.pathname.match(
          /\/storage\/v1\/object\/upload\/sign\/[^/]+\/(.+)/,
        );
        if (match) return `/objects/${match[1]}`;
      }
    } catch {
      /* not a URL — return as-is */
    }
    return rawPath;
  }

  /**
   * Resolve an internal `/objects/<path>` reference to a StorageFile descriptor.
   * Existence is verified lazily on download.
   */
  async getObjectEntityFile(objectPath: string): Promise<StorageFile> {
    if (!objectPath.startsWith("/objects/")) {
      throw new ObjectNotFoundError();
    }
    const path = objectPath.slice("/objects/".length);
    return { path, bucket: UPLOADS_BUCKET };
  }

  /**
   * Set per-object ACL. For Supabase, bucket-level policies are used instead;
   * this is a no-op that returns the normalized path.
   */
  async trySetObjectEntityAclPolicy(
    rawPath: string,
    _aclPolicy: ObjectAclPolicy,
  ): Promise<string> {
    return this.normalizeObjectEntityPath(rawPath);
  }

  /**
   * Check whether a user can access a given object.
   */
  async canAccessObjectEntity({
    userId: _userId,
    objectFile: _objectFile,
    requestedPermission = ObjectPermission.READ,
  }: {
    userId?: string;
    objectFile: StorageFile;
    requestedPermission?: ObjectPermission;
  }): Promise<boolean> {
    // Simplified: all objects served through this API are considered accessible.
    // Implement RLS / per-object rules here if needed.
    return true;
  }
}
