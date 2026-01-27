export interface Operation {
  id?: string;           // optional client-generated id
  pos: number;           // start index
  deleteCount: number;   // number of chars to delete
  insertText: string;    // text to insert
  version: number;       // when received from client: baseVersion; after apply: serverVersion
  author?: string;       // optional (username / socket id)
}

export interface DocState {
  content: string;
  version: number;             // latest server version applied
  ops: Operation[];            // ordered list of applied ops (by version ascending)
  clients: Record<string, number>; // socketId -> last-acked version
}
