module.exports = {
    'verbose': true,
    'moduleFileExtensions': [
        'ts',
        'tsx',
        'js',
        'json'
    ],
    'transform': {
        '^.+\\.tsx?$': 'ts-jest'
    },
    'testRegex': '/src/.*\\.(test|spec).(ts|tsx|js)$',
    'coverageThreshold': {
        'global': {
            'branches': 75,
            'functions': 80,
            'lines': 80,
            'statements': 80
        }
    },
    'collectCoverageFrom' : ['src/**/*.{js,jsx,tsx,ts}', '!**/node_modules/**', '!**/vendor/**'],
    'coverageReporters': ['text', ['text', { file: './report.txt' }], 'html'],
    'testEnvironment': 'node',
    'moduleNameMapper': {
        '^jose/(.*)$': '<rootDir>/node_modules/jose/dist/node/cjs/$1'
    },
}
