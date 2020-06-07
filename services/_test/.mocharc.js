module.exports = {
    diff: true,
    extension: ['ts'],
    spec: [
        'src/__tests__/*.ts'
    ],
    require: 'ts-node/register',
    exit: true,
    slow: 75,
    timeout: 2000,
    'watch-files': ['src/**/*.ts']
};
