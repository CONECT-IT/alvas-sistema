export default {
	ci: {
		collect: {
			startServerCommand: 'bun run build && bun run preview',
			url: ['http://localhost:4173/login', 'http://localhost:4173/admin/leads'],
			numberOfRuns: 1
		},
		assert: {
			preset: 'lighthouse:no-pwa',
			assertions: {
				'first-contentful-paint': ['warn', { maxNumericValue: 3000 }],
				interactive: ['warn', { maxNumericValue: 5000 }],
				'speed-index': ['warn', { maxNumericValue: 5000 }],
				'total-blocking-time': ['warn', { maxNumericValue: 500 }],
				'largest-contentful-paint': ['warn', { maxNumericValue: 4000 }],
				'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }]
			}
		},
		upload: {
			target: 'filesystem',
			outputDir: 'test/benchmark/lighthouse/reports'
		}
	}
};
