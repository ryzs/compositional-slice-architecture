import { useState } from 'react';

const CODES: Record<string, number> = { SAVE10: 0.1, SAVE20: 0.2 };

export function usePromoCode() {
  const [value, setValue] = useState('');
  const [applied, setApplied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const apply = () => {
    const code = value.trim().toUpperCase();
    if (CODES[code]) {
      setApplied(code);
      setError(null);
    } else {
      setApplied(null);
      setError(`"${code}" is not a valid code. Try SAVE10.`);
    }
  };

  return { value, setValue, apply, applied, error, discountRate: applied ? CODES[applied] : 0 };
}
