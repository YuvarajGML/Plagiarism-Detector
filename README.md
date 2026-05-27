# String Matching Project (Boyer-Moore / Horspool Demo)

Usage examples:

Run Horspool in sentence mode (default):

```bash
python run_match.py TextFiles pattern.txt --algo horspool --mode sentence --threshold 0.7
```

Run fuzzy sentence matching (difflib):

```bash
python run_match.py TextFiles pattern.txt --algo fuzzy --mode sentence --threshold 0.65
```

Run exact substring check:

```bash
python run_match.py TextFiles pattern.txt --algo exact --mode exact
```

Outputs are printed to console and `results.json` is written with per-file percentages.
# BoyerMoore
String matching algorithm - Plagiarism detection using Boyer Moore string matching algorithm
