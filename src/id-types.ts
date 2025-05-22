export const idTypeList = [
  { type: 'uuid', label: 'UUID', desc: 'Universally Unique Identifier', url: 'https://github.com/uuidjs/uuid' },
  { type: 'cuid', label: 'CUID', desc: 'Collision-resistant Unique Identifier', url: 'https://github.com/paralleldrive/cuid2' },
  { type: 'nanoid', label: 'NanoID', desc: 'Secure, URL-friendly Unique Identifier', url: 'https://github.com/ai/nanoid' },
  { type: 'ulid', label: 'ULID', desc: 'Universally Unique Lexicographically Sortable Identifier', url: 'https://github.com/ulid/javascript' },
  { type: 'ksuid', label: 'KSUID', desc: 'K-Sortable Unique Identifier', url: 'https://github.com/ValeriaVG/xksuid' },
];

export type IdTypeKey = typeof idTypeList[number]['type']; 