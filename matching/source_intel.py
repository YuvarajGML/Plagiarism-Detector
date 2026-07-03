"""Source-intelligence helpers for beyond-pairwise plagiarism analysis.

The module is standard-library only so the CLI remains usable without Node.js.
It provides a small built-in source cache, corpus indexing, citation checks, and
lightweight cross-language matching.
"""
from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass
from typing import Callable, Dict, Iterable, List


@dataclass(frozen=True)
class ExternalSource:
    id: str
    type: str
    title: str
    url: str
    author: str
    published: str
    language: str
    citation_hints: List[str]
    text: str


EXTERNAL_SOURCES = [
    ExternalSource(
        id="web-ml-overview",
        type="Web",
        title="What is Machine Learning?",
        url="https://www.ibm.com/topics/machine-learning",
        author="IBM Think",
        published="2026-05-26",
        language="en",
        citation_hints=["ibm", "what is machine learning", "machine learning ibm"],
        text=(
            "Machine learning is the subset of artificial intelligence focused "
            "on algorithms that learn the patterns of training data and make "
            "accurate inferences about new data. This pattern recognition ability "
            "enables machine learning models to make decisions or predictions "
            "without explicit hard-coded instructions."
        ),
    ),
    ExternalSource(
        id="academic-horspool",
        type="Academic",
        title="Text Documents Plagiarism Detection using Rabin-Karp and Jaro-Winkler Distance Algorithms",
        url="https://www.researchgate.net/publication/316681173_Text_Documents_Plagiarism_Detection_using_Rabin-Karp_and_Jaro-Winkler_Distance_Algorithms",
        author="ResearchGate publication page",
        published="2017-05-04",
        language="en",
        citation_hints=["rabin-karp", "jaro-winkler", "researchgate", "text documents plagiarism detection"],
        text=(
            "Plagiarism detection systems commonly implement string matching "
            "algorithms in text documents to search for common words between "
            "documents. Rabin-Karp can identify matching text patterns, while "
            "Jaro-Winkler distance can support similarity scoring."
        ),
    ),
    ExternalSource(
        id="ieee-access-policy",
        type="Publisher Policy",
        title="IEEE Access Preparing Your Article",
        url="https://ieeeaccess.ieee.org/authors/preparing-your-article/",
        author="IEEE Access",
        published="2026-06-02",
        language="en",
        citation_hints=["ieee access", "preparing your article", "plagiarism"],
        text=(
            "Each article submitted to IEEE Access is scanned for plagiarism, "
            "including similarity to an author's own work. If overlap is high "
            "or the source article is not referenced, the article can be rejected."
        ),
    ),
    ExternalSource(
        id="cross-lang-ml-es",
        type="Cross-language",
        title="Machine Learning: What it is and why it matters",
        url="https://www.sas.com/en_us/insights/analytics/machine-learning.html",
        author="SAS Insights",
        published="2026-06-07",
        language="es",
        citation_hints=["sas", "machine learning what it is and why it matters"],
        text=(
            "El aprendizaje automatico es una rama de la inteligencia artificial "
            "que permite a las computadoras aprender de los datos sin programacion "
            "explicita. Los sistemas mejoran con la experiencia e identifican patrones."
        ),
    ),
]


TRANSLATION_LEXICON = {
    "aprendizaje": "learning",
    "automatico": "machine",
    "inteligencia": "intelligence",
    "artificial": "artificial",
    "computadoras": "computers",
    "aprender": "learn",
    "datos": "data",
    "programacion": "programming",
    "explicita": "explicit",
    "sistemas": "systems",
    "experiencia": "experience",
    "patrones": "patterns",
    "predicciones": "predictions",
}


def normalize_words(text: str) -> List[str]:
    plain = unicodedata.normalize("NFD", text.lower())
    plain = "".join(ch for ch in plain if unicodedata.category(ch) != "Mn")
    return re.findall(r"[a-z0-9]+", plain)


def sentences(text: str) -> List[str]:
    return [
        chunk.strip()
        for chunk in re.split(r"(?<=[.!?])\s+|\n+", text)
        if len(chunk.strip()) > 18 and len(chunk.split()) >= 4
    ]


def translate_for_comparison(text: str) -> str:
    return " ".join(TRANSLATION_LEXICON.get(word, word) for word in normalize_words(text))


def containment(left: str, right: str) -> float:
    left_set = set(normalize_words(left))
    right_set = set(normalize_words(right))
    if not left_set or not right_set:
        return 0.0
    return len(left_set & right_set) / min(len(left_set), len(right_set))


def shingles(text: str, size: int = 3) -> set[str]:
    words = normalize_words(text)
    return {" ".join(words[i : i + size]) for i in range(max(len(words) - size + 1, 0))}


def shingle_containment(left: str, right: str) -> float:
    left_shingles = shingles(left)
    right_shingles = shingles(right)
    if not left_shingles or not right_shingles:
        return 0.0
    return len(left_shingles & right_shingles) / min(len(left_shingles), len(right_shingles))


def citation_coverage(text: str, sources: Iterable[ExternalSource] = EXTERNAL_SOURCES) -> List[Dict[str, object]]:
    lower = text.lower()
    has_reference_section = bool(re.search(r"\b(references|bibliography|works cited)\b", text, re.I))
    coverage = []
    for source in sources:
        cited = any(hint.lower() in lower for hint in source.citation_hints)
        coverage.append(
            {
                "source_id": source.id,
                "title": source.title,
                "cited": cited,
                "status": "Cited" if cited else "Missing citation" if has_reference_section else "No citation section",
            }
        )
    return coverage


def best_sentence_evidence(text: str, source: ExternalSource) -> Dict[str, object]:
    best = {"score": 0.0, "suspect_sentence": "", "source_sentence": "", "cross_language": False}
    for suspect_sentence in sentences(text):
        for source_sentence in sentences(source.text):
            lexical = max(containment(suspect_sentence, source_sentence), shingle_containment(suspect_sentence, source_sentence))
            cross_language = containment(translate_for_comparison(suspect_sentence), translate_for_comparison(source_sentence))
            score = max(lexical, cross_language * 0.92)
            if score > float(best["score"]):
                best = {
                    "score": score,
                    "suspect_sentence": suspect_sentence,
                    "source_sentence": source_sentence,
                    "cross_language": cross_language > lexical + 0.08,
                }
    return best


def find_external_sources(text: str, sources: Iterable[ExternalSource] = EXTERNAL_SOURCES) -> List[Dict[str, object]]:
    citations = {item["source_id"]: item for item in citation_coverage(text, sources)}
    hits = []
    for source in sources:
        evidence = best_sentence_evidence(text, source)
        confidence = min(round(float(evidence["score"]) * 118), 100)
        citation = citations[source.id]
        if not citation["cited"]:
            confidence = max(confidence - 8, 0)
        if confidence < 24:
            continue
        hits.append(
            {
                "id": source.id,
                "type": source.type,
                "title": source.title,
                "url": source.url,
                "author": source.author,
                "published": source.published,
                "confidence": confidence,
                "citation_status": citation["status"],
                "cited": citation["cited"],
                "detection_mode": "Cross-language semantic"
                if evidence["cross_language"]
                else "Academic source"
                if source.type == "Academic"
                else "Web source",
                "evidence": evidence,
            }
        )
    return sorted(hits, key=lambda item: item["confidence"], reverse=True)


def build_corpus_index(files: Iterable[str], read_text: Callable[[str], str]) -> Dict[str, int]:
    docs = []
    for file_path in files:
        text = read_text(file_path)
        docs.append({"tokens": len(normalize_words(text)), "shingles": len(shingles(text))})
    return {
        "document_count": len(docs),
        "token_count": sum(doc["tokens"] for doc in docs),
        "shingle_count": sum(doc["shingles"] for doc in docs),
    }
