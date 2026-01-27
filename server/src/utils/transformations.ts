// backend/utils/transformations.ts
import { Operation, DocState } from "../../types/operations";

/**
 * If client is too far behind (we don't have ops to transform against),
 * we throw this so the caller can force a full resync to that client.
 */
export class ResyncRequired extends Error {
  public content: string;
  public version: number;
  constructor(content: string, version: number) {
    super("Resync required");
    this.content = content;
    this.version = version;
    Object.setPrototypeOf(this, ResyncRequired.prototype);
  }
}

/* --- helpers --- */

function clampPos(pos: number, len: number) {
  if (pos < 0) return 0;
  if (pos > len) return len;
  return pos;
}

export function applyOperation(doc: string, op: Operation): string {
  const pos = clampPos(op.pos, doc.length);
  const delCount = Math.max(0, Math.min(op.deleteCount || 0, doc.length - pos));
  const before = doc.slice(0, pos);
  const after = doc.slice(pos + delCount);
  return before + (op.insertText || "") + after;
}

/**
 * Transform opA so it can be applied *after* opB.
 * Handles insert, delete, and combined insert+delete (replace) operations.
 */
/**
 * Transform opA so it can be applied *after* opB.
 * Handles insert, delete, and combined insert+delete (replace) operations.
 * Synchronized with frontend implementation.
 */
export function transformOperation(opA: Operation, opB: Operation): Operation {
  const a = { ...opA };
  const b = opB;
  const bInsertLen = (b.insertText || "").length;
  const bDeleteLen = b.deleteCount || 0;
  const aDeleteLen = a.deleteCount || 0;

  // Net effect of B: removes bDeleteLen chars at b.pos, inserts bInsertLen
  const bNetChange = bInsertLen - bDeleteLen;

  if (aDeleteLen === 0) {
    // A is an insertion
    if (a.pos > b.pos + bDeleteLen) {
      // A is after B's affected region
      a.pos += bNetChange;
    } else if (a.pos > b.pos && a.pos <= b.pos + bDeleteLen) {
      // A is inside B's deleted region - move to end of B's insert
      a.pos = b.pos + bInsertLen;
    } else if (a.pos === b.pos) {
      // Same position - use ID tiebreaker
      if ((a.id || "") > (b.id || "")) {
        a.pos += bInsertLen;
      }
    }
    // If a.pos < b.pos, no change needed
  } else {
    // A is a deletion
    const aEnd = a.pos + aDeleteLen;
    const bEnd = b.pos + bDeleteLen;

    if (a.pos >= bEnd) {
      // A starts after B ends - shift by net change
      a.pos += bNetChange;
    } else if (aEnd <= b.pos) {
      // A ends before B starts - no change
    } else {
      // Overlap case - complex handling
      const overlapStart = Math.max(a.pos, b.pos);
      const overlapEnd = Math.min(aEnd, bEnd);
      const overlap = Math.max(0, overlapEnd - overlapStart);

      a.deleteCount = Math.max(0, aDeleteLen - overlap);

      if (b.pos < a.pos) {
        // B starts before A
        const removedBeforeA = Math.min(bDeleteLen, a.pos - b.pos);
        a.pos = Math.max(0, a.pos - removedBeforeA + bInsertLen);
      }
    }
  }

  return a;
}

/**
 * Receive a client op, transform it against history (ops with version > clientBaseVersion),
 * apply to docState and assign a server version.
 *
 * If the client's base version is older than the earliest stored op (we can't transform),
 * a ResyncRequired is thrown with latest content+version.
 */
export function receiveOperation(opIn: Operation, docState: DocState): Operation {
  // Use client's sent version as "baseVersion"
  const clientBaseVersion = Math.max(0, opIn.version || 0);

  // earliest stored op version (if no ops stored, earliest == docState.version)
  const earliestStoredVersion = docState.ops.length > 0 ? docState.ops[0].version : docState.version;

  // If client is too far behind (we don't have the ops to transform), require resync
  if (clientBaseVersion < earliestStoredVersion) {
    throw new ResyncRequired(docState.content, docState.version);
  }

  // Transform against every op with version > clientBaseVersion
  let transformed = { ...opIn };
  for (const hist of docState.ops) {
    if (hist.version > clientBaseVersion) {
      transformed = transformOperation(transformed, hist);
    }
  }

  // Apply to server doc content
  docState.content = applyOperation(docState.content, transformed);

  // Assign new server version and store op in history
  const newVersion = docState.version + 1;
  transformed.version = newVersion;

  // generate an id if missing
  if (!transformed.id) {
    transformed.id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
  }

  docState.version = newVersion;
  docState.ops.push(transformed);

  return transformed;
}

/**
 * Update client's last-acked version and prune ops that every client has seen.
 */
export function updateClientAck(docState: DocState, socketId: string, version: number) {
  docState.clients[socketId] = version;
  pruneOps(docState);
}

/**
 * Remove historical ops that every connected client has acknowledged.
 */
export function pruneOps(docState: DocState) {
  const clientVersions = Object.values(docState.clients);
  if (clientVersions.length === 0) {
    // No clients — safe to clear ops
    docState.ops = [];
    return;
  }
  const minAck = Math.min(...clientVersions);
  // remove all ops with version <= minAck
  while (docState.ops.length > 0 && docState.ops[0].version <= minAck) {
    docState.ops.shift();
  }
}
