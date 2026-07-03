import unittest

from matching import source_intel


class TestSourceIntel(unittest.TestCase):
    def test_external_source_hit(self):
        text = (
            "Machine learning is a subset of artificial intelligence focused on "
            "computers learning from data without explicit programming."
        )
        hits = source_intel.find_external_sources(text)
        self.assertTrue(hits)
        self.assertEqual(hits[0]["title"], "What is Machine Learning?")

    def test_citation_coverage_detects_cited_source(self):
        text = "References: IBM. What is Machine Learning?"
        coverage = source_intel.citation_coverage(text)
        cited = [item for item in coverage if item["source_id"] == "web-ml-overview"][0]
        self.assertTrue(cited["cited"])

    def test_corpus_index_counts_documents(self):
        files = ["a.txt", "b.txt"]
        corpus = source_intel.build_corpus_index(files, lambda path: "alpha beta gamma delta")
        self.assertEqual(corpus["document_count"], 2)
        self.assertGreater(corpus["token_count"], 0)


if __name__ == "__main__":
    unittest.main()
