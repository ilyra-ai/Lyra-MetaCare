import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility', () => {
  it('should merge class names correctly', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  it('should handle conditional classes', () => {
    expect(cn('class1', { class2: true, class3: false })).toBe('class1 class2');
  });

  it('should handle arrays of classes', () => {
    expect(cn(['class1', 'class2'], 'class3')).toBe('class1 class2 class3');
  });

  it('should filter out falsy values', () => {
    expect(cn('class1', null, undefined, false, '')).toBe('class1');
  });

  it('should merge conflicting Tailwind classes using twMerge', () => {
    // twMerge should ensure the last class wins for the same property
    expect(cn('p-4', 'p-8')).toBe('p-8');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('should handle complex combinations', () => {
    const isActive = true;
    const isDisabled = false;
    expect(
      cn(
        'base-style',
        isActive && 'active-style',
        isDisabled ? 'disabled-style' : 'enabled-style',
        { 'extra-class': true },
        ['array-class-1', 'array-class-2']
      )
    ).toBe('base-style active-style enabled-style extra-class array-class-1 array-class-2');
  });
});
