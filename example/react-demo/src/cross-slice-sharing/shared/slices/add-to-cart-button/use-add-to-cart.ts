import { useState } from 'react';
import { fakeApi } from '../../../../core/api/fake-api';

type Status = 'idle' | 'pending' | 'done';

export function useAddToCart(productId: string) {
  const [status, setStatus] = useState<Status>('idle');

  const add = async () => {
    if (status === 'pending') return;
    setStatus('pending');
    await fakeApi.addToCart(productId);
    setStatus('done');
    setTimeout(() => setStatus('idle'), 1500);
  };

  return { status, add };
}
