import unittest
from matching import horspool

class TestHorspool(unittest.TestCase):
    def test_simple_match(self):
        text = 'Hello world, this is a test.'
        pat = 'this is a'
        res = horspool.search(text, pat)
        self.assertTrue(len(res) >= 1)

    def test_no_match(self):
        text = 'abcdefg'
        pat = 'xyz'
        res = horspool.search(text, pat)
        self.assertEqual(res, [])

if __name__ == '__main__':
    unittest.main()
