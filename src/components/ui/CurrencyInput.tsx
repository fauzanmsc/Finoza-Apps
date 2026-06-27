import React from 'react';
import { cn } from '../../lib/utils';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string | number;
  onChange: (value: string) => void;
  error?: boolean;
}

export const formatRupiah = (val: string | number) => {
  if (val === undefined || val === null) return '';
  const numberString = val.toString().replace(/[^,\d]/g, '');
  const split = numberString.split(',');
  const sisa = split[0].length % 3;
  let rupiah = split[0].substr(0, sisa);
  const ribuan = split[0].substr(sisa).match(/\d{3}/gi);

  if (ribuan) {
    const separator = sisa ? '.' : '';
    rupiah += separator + ribuan.join('.');
  }

  rupiah = split[1] !== undefined ? rupiah + ',' + split[1] : rupiah;
  return rupiah ? 'Rp ' + rupiah : '';
};

export const parseRupiah = (val: string) => {
  return Number(val.replace(/\D/g, ''));
};

export default function CurrencyInput({ value, onChange, error, className, ...props }: CurrencyInputProps) {
  return (
    <input
      type="text"
      value={value === '' || value === 0 ? '' : formatRupiah(value)}
      onChange={(e) => {
        onChange(formatRupiah(e.target.value));
      }}
      placeholder="Rp 0"
      className={cn(
        "w-full bg-surface-light border rounded-xl py-3 px-4 text-xl md:text-2xl font-bold text-[var(--color-text-foreground)] placeholder:text-slate-600 focus:outline-none focus:border-[var(--color-stabilo)] transition-all",
        error ? "border-red-500 ring-2 ring-red-500/20" : "border-black/5 dark:border-white/5",
        className
      )}
      {...props}
    />
  );
}
