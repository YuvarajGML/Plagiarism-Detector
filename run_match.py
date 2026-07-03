#!/usr/bin/env python
"""Run matching over files with selectable algorithms.
Usage: python run_match.py <dir> <pattern_file> [--algo horspool|fuzzy|exact] [--mode sentence|exact] [--threshold 0.7]
"""
import argparse
import os
import json
import re
import difflib

from matching import horspool
from matching import source_intel

def normalize(s: str) -> str:
    return ' '.join(s.replace('\u2019', "'").replace('\u201c','"').replace('\u201d','"').lower().split())

def split_sentences(s: str):
    return [seg.strip() for seg in re.split(r'[\.\?!]', s) if seg.strip()]

def match_file(text: str, pattern_text: str, algo: str, mode: str, threshold: float):
    text_norm = normalize(text)
    pattern_norm = normalize(pattern_text)
    if mode == 'exact':
        # treat exact mode as sentence-level exact matching for `exact` algo,
        # fuzzy for similarity, and Horspool for substring search
        if algo == 'fuzzy':
            ratio = difflib.SequenceMatcher(None, pattern_norm, text_norm).ratio()
            return ratio * 100.0
        elif algo == 'horspool':
            return 100.0 if horspool.search(text_norm, pattern_norm) else 0.0
        elif algo == 'exact':
            # split pattern into sentences and count exact sentence matches
            patterns = split_sentences(pattern_norm)
            text_sents = split_sentences(text_norm)
            total = len(patterns)
            if total == 0:
                return 0.0
            matched = sum(1 for p in patterns if any(p == ts for ts in text_sents))
            return (matched * 100.0) / total
        else:
            return 100.0 if pattern_norm in text_norm else 0.0

    # sentence mode
    patterns = split_sentences(pattern_norm)
    text_sents = split_sentences(text_norm)
    total = len(patterns)
    matched = 0
    for pat in patterns:
        best = 0.0
        if algo == 'fuzzy':
            for ts in text_sents:
                r = difflib.SequenceMatcher(None, pat, ts).ratio()
                if r > best:
                    best = r
            if best >= threshold:
                matched += 1
        elif algo == 'horspool':
            # consider a sentence matched if Horspool finds the pattern in any text sentence
            found = any(horspool.search(ts, pat) for ts in text_sents)
            if found:
                matched += 1
        elif algo == 'horspool-token':
            # token-based Horspool: remove common stopwords and match on token sequence
            def tokens_only(s):
                import re
                stop = set(['the','is','a','an','and','of','to','in','that','we','be','it','are','this','these','those','with','for','on','as','by','from','at','our'])
                toks = re.findall(r"\w+", s)
                return [t for t in toks if t not in stop]

            pat_tokens = ' '.join(tokens_only(pat))
            if not pat_tokens:
                continue
            for ts in text_sents:
                ts_tokens = ' '.join(tokens_only(ts))
                if ts_tokens and horspool.search(ts_tokens, pat_tokens):
                    matched += 1
                    break
        else:
            # exact sentence equality
            if any(pat == ts for ts in text_sents):
                matched += 1

    if total == 0:
        return 0.0
    return (matched * 100.0) / total

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('directory')
    parser.add_argument('pattern_file')
    parser.add_argument('--algo', default='horspool', choices=['horspool','horspool-token','fuzzy','exact'])
    parser.add_argument('--mode', default='sentence', choices=['sentence','exact'])
    parser.add_argument('--threshold', type=float, default=0.7)
    parser.add_argument(
        '--source-intel',
        action='store_true',
        help='add corpus indexing, external-source ranking, citation checks, and cross-language signals'
    )
    args = parser.parse_args()

    if not os.path.isdir(args.directory):
        print('directory does not exist!')
        return 1
    pattern_text = open(args.pattern_file, encoding='utf-8').read()
    results = {}
    file_names = [fname for fname in os.listdir(args.directory) if not fname.startswith('.')]
    if args.source_intel:
        corpus = source_intel.build_corpus_index(
            [os.path.join(args.directory, fname) for fname in file_names],
            lambda path: open(path, encoding='utf-8').read()
        )
        results['_corpus_index'] = corpus
        print('Corpus index: %d docs, %d tokens, %d shingles' % (
            corpus['document_count'],
            corpus['token_count'],
            corpus['shingle_count']
        ))

    for fname in file_names:
        fpath = os.path.join(args.directory, fname)
        text = open(fpath, encoding='utf-8').read()
        pct = match_file(text, pattern_text, args.algo, args.mode, args.threshold)
        print('Checking file: ', fname)
        print('Match percentage = %.1f%%' % pct)
        results[fname] = pct
        if pct >= args.threshold * 100.0:
            print('The input file appears to be plagiarised. %.1f%% of its content matches with the file %s.' % (pct, fname))
        if args.source_intel:
            sources = source_intel.find_external_sources(text)
            citations = source_intel.citation_coverage(text)
            results.setdefault('_source_intel', {})[fname] = {
                'external_sources': sources,
                'citation_coverage': citations,
            }
            if sources:
                top = sources[0]
                print('Top external source: %s (%d%%, %s)' % (
                    top['title'],
                    top['confidence'],
                    top['citation_status']
                ))

    # save summary
    with open('results.json', 'w', encoding='utf-8') as fh:
        json.dump(results, fh, indent=2)
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
