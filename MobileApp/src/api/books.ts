import type { BookDetails } from '@/types/api';
import { requestJson } from '@/api/client';

export function lookupBookByQrCode(token: string, code: string) {
  return requestJson<BookDetails>('/mobile/books/lookup', {
    method: 'GET',
    token,
    query: { code },
  });
}
