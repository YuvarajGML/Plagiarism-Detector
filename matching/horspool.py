"""Horspool string search implementation (case-insensitive).
Provides search(text, pattern) -> list of start indices.
"""
from typing import List

def _build_shift_table(pattern: str):
    m = len(pattern)
    table = {c: m for c in set(pattern)}
    # default shift is m for all characters; compute for pattern chars
    for i in range(m - 1):
        table[pattern[i]] = m - 1 - i
    return table

def search(text: str, pattern: str) -> List[int]:
    if not pattern:
        return []
    # normalize to lowercase for case-insensitive matching
    t = text.lower()
    p = pattern.lower()
    m = len(p)
    n = len(t)
    if m > n:
        return []
    shift = _build_shift_table(p)
    results = []
    i = 0
    while i <= n - m:
        # compare from right to left
        k = m - 1
        while k >= 0 and p[k] == t[i + k]:
            k -= 1
        if k < 0:
            results.append(i)
            i += m
        else:
            c = t[i + m - 1]
            s = shift.get(c, m)
            i += s
    return results
