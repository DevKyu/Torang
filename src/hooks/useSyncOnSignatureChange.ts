import { useEffect, useRef } from 'react';

export function useSyncOnSignatureChange(
  signature: string,
  loading: boolean,
  sync: () => void,
): void {
  const signatureRef = useRef('');

  useEffect(() => {
    if (loading) return;
    if (signature === signatureRef.current) return;
    signatureRef.current = signature;
    sync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, loading]);
}
