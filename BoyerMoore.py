"""
Project - String Matching: Plagiarism Detection
Module - Boyer-Moore Algorithm
References Used - 
1. https://en.wikipedia.org/wiki/boyer_moore
2. http://www.blackbeltcoder.com/articles/algorithms/fast-text-search-with-boyer-moore
3. http://www.cs.utexas.edu/users/moore/best-ideas/string-searching/fstrpos-example.html
"""

#!/usr/bin/env python

import sys
import re
import difflib
import os

#accept command line arguments
if len(sys.argv) != 3:
    print ("usage: python <script_name.py> <directory_with_text_files> <pattern_file>")
    sys.exit(0)

if os.path.isdir(sys.argv[1]) == 0:
    print ("directory does not exist!")
    sys.exit(0)

for textfile in os.listdir(sys.argv[1]):
    if textfile[0] == '.':
        continue
    
    print ("Checking file: ", textfile)

    text = open(os.path.join(sys.argv[1], textfile)).read()
    pattern_file = ''.join(open(sys.argv[2]).readlines())

    # split the pattern file and the text into sentences
    sentences = [s.strip() for s in re.split(r'[\.\?!]', pattern_file) if s.strip()]
    text_sentences = [s.strip() for s in re.split(r'[\.\?!]', text) if s.strip()]
    counter_matched = 0
    counter_total = len(sentences)

    # use fuzzy matching (difflib) to allow for paraphrasing
    for pattern in sentences:
        best_ratio = 0.0
        for t_sent in text_sentences:
            ratio = difflib.SequenceMatcher(None, pattern.lower(), t_sent.lower()).ratio()
            if ratio > best_ratio:
                best_ratio = ratio

        # consider it a match if similarity >= 0.7 (70%)
        if best_ratio >= 0.7:
            counter_matched += 1
                    
    print ("Match percentage = %s%%" % (counter_matched*100/counter_total))
    if (counter_matched*100/counter_total) >= 70 :
        print ("The input file appears to be plagiarised. %s%% of its content matches with the file %s." % ((counter_matched*100/counter_total), textfile))
