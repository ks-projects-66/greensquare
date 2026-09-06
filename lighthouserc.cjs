const base = process.env.QA_BASE_URL || 'http://127.0.0.1:4321';

module.exports = {
  ci: {
    collect: {
      url: [
        `${base}/`,
        `${base}/product/`,
        `${base}/free/`,
        `${base}/research/`,
      ],
      numberOfRuns: 1,
      settings: { chromeFlags: '--no-sandbox --headless=new' },
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.95 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
      },
    },
    upload: { target: 'filesystem', outputDir: 'qa/launch/lighthouse' },
  },
};
