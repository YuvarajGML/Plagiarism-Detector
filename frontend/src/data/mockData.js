export const SAMPLE_DOCUMENTS = {
  original: `Machine learning is a subset of artificial intelligence that focuses on the ability of computers to learn from data without being explicitly programmed. The field has experienced rapid growth over the past decade, driven by advances in computational power and the availability of large datasets.

The fundamental concept behind machine learning is that systems can learn and improve from experience. Rather than following pre-programmed instructions, ML algorithms identify patterns in data and make predictions or decisions based on those patterns. This approach has proven invaluable across numerous domains, from healthcare and finance to natural language processing and computer vision.

There are three primary categories of machine learning: supervised learning, unsupervised learning, and reinforcement learning. Supervised learning involves training algorithms on labeled datasets, where both input features and desired outputs are provided. In contrast, unsupervised learning works with unlabeled data to discover hidden patterns or structure. Reinforcement learning trains agents to make sequential decisions by rewarding desired behaviors and penalizing undesired ones.

The process of building a machine learning model typically involves several stages: data collection, preprocessing, feature engineering, model selection, training, and evaluation. Each stage is critical to ensuring the model performs well on real-world data. Data quality is particularly important, as poor quality input data can lead to unreliable models regardless of the algorithm used.

Performance metrics such as accuracy, precision, recall, and F1-score are essential for evaluating model effectiveness. The choice of metric depends on the specific problem and its requirements. For instance, in medical diagnosis applications, recall might be prioritized to minimize false negatives, even if it increases false positives.`,

  plagiarized: `Artificial intelligence has many subsets, with machine learning being one of the most important. This field focuses on how computers can learn from data without explicit programming. The growth of machine learning has been remarkable in recent years, thanks to better computers and more available data.

At its core, machine learning relies on the principle that systems can improve themselves through experience. Unlike traditional software that follows fixed instructions, machine learning algorithms discover patterns in datasets and use them for predictions. This technology has become essential in healthcare, finance, natural language processing, and computer vision among other fields.

Machine learning divides into three main types: supervised, unsupervised, and reinforcement learning. Supervised learning uses labeled training data where inputs and outputs are both known. Unsupervised learning finds patterns in data without labels. Reinforcement learning teaches agents through reward systems for good behavior and penalties for bad behavior.

Building an effective machine learning system requires multiple steps: gathering data, cleaning and preparing it, engineering features, picking an algorithm, training the model, and testing it. All these stages matter for good results. The quality of input data is particularly crucial, as bad data produces unreliable models no matter what algorithm you choose.

To judge how well a model works, we use metrics like accuracy, precision, recall, and F1-score. Different problems require different metrics. For medical AI, recall is often more important because missing a disease (false negative) is worse than a false alarm (false positive). The specific application determines which metric to prioritize.`
};

export const BENCHMARK_DATA = {
  naive: { time: 2340, nodes: 980000 },
  kmp: { time: 340, nodes: 124000 },
  horspool: { time: 48, nodes: 18000 }
};

export const SHIFT_TABLE = {
  'a': 12, 'b': 15, 'c': 14, 'd': 13,
  'e': 8, 'f': 16, 'g': 16, 'h': 11,
  'i': 9, 'j': 16, 'k': 16, 'l': 10,
  'm': 16, 'n': 7, 'o': 6, 'p': 16,
  'q': 16, 'r': 5, 's': 4, 't': 3,
  'u': 16, 'v': 16, 'w': 16, 'x': 16,
  'y': 2, 'z': 1, ' ': 15
};

export const MATCH_SEGMENTS = [
  {
    id: 1,
    type: 'exact',
    similarity: 98,
    original: 'Machine learning is a subset of artificial intelligence',
    plagiarized: 'machine learning is a subset of artificial intelligence',
    originalLine: 1,
    plagiarizedLine: 1,
    distance: 1,
    algorithm: 'Horspool'
  },
  {
    id: 2,
    type: 'near',
    similarity: 85,
    original: 'The fundamental concept behind machine learning is that systems can learn and improve from experience.',
    plagiarized: 'At its core, machine learning relies on the principle that systems can improve themselves through experience.',
    originalLine: 3,
    plagiarizedLine: 3,
    distance: 18,
    algorithm: 'Horspool'
  },
  {
    id: 3,
    type: 'near',
    similarity: 72,
    original: 'There are three primary categories of machine learning: supervised learning, unsupervised learning, and reinforcement learning.',
    plagiarized: 'Machine learning divides into three main types: supervised, unsupervised, and reinforcement learning.',
    originalLine: 5,
    plagiarizedLine: 5,
    distance: 24,
    algorithm: 'Winnowing'
  },
  {
    id: 4,
    type: 'structural',
    similarity: 58,
    original: 'The process of building a machine learning model typically involves several stages: data collection, preprocessing, feature engineering, model selection, training, and evaluation.',
    plagiarized: 'Building an effective machine learning system requires multiple steps: gathering data, cleaning and preparing it, engineering features, picking an algorithm, training the model, and testing it.',
    originalLine: 8,
    plagiarizedLine: 8,
    distance: 32,
    algorithm: 'Both'
  }
];

export const SAMPLE_FILES = [
  { id: 1, name: 'essay_original.txt', size: '5.2 KB', status: 'clean' },
  { id: 2, name: 'assignment_v1.txt', size: '4.8 KB', status: 'suspicious' },
  { id: 3, name: 'research_paper.pdf', size: '156 KB', status: 'clean' },
  { id: 4, name: 'final_submission.docx', size: '8.4 KB', status: 'pending' },
];

export const LOG_MESSAGES = [
  '► Initializing PlagScan Pro v1.0.0',
  '► Loading document: essay_original.txt (2,341 words)',
  '► Loading document: assignment_v1.txt (2,156 words)',
  '► Building shift table for Horspool algorithm... Done in 0.3ms',
  '► Preprocessing text: normalizing case, removing special characters... Done in 1.2ms',
  '► Horspool preprocessing: 2,341 shingles → 187 fingerprints (92% reduction)',
  '► Winnowing algorithm: fingerprint filtering applied',
  '► Horspool scan: initiating pattern matching...',
  '► Match found at position 1,203 (Exact match: 98% similarity)',
  '► Match found at position 2,145 (Near match: 85% similarity)',
  '► Horspool scan: match found at position 856',
  '► Winnowing scan: structural pattern detected at line 8',
  '► Calculating Levenshtein distances...',
  '► Analyzing word frequency distribution...',
  '► Performance Analysis Complete',
  '► Naive Algorithm: 2,340ms | 980,000 nodes traversed',
  '► KMP Algorithm: 340ms | 124,000 nodes traversed',
  '► Horspool Algorithm: 48ms | 18,000 nodes traversed',
  '► Processing speed: 84,200 chars/sec | Memory usage: 12.4 MB',
  '► Analysis complete. Overall similarity: 73%',
  '► Generating report...',
  '► Ready for export'
];
