module.exports = {
    diff: true,
    extension: ['ts'],
    require: 'ts-node/register',
    exit: true,
    slow: 75,
    timeout: 2000,
    'watch-files': ['src/**/*.ts', 'tests/**/*.ts']
};
