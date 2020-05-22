test('testSingle', async () => {
    global.__env__ = require('../config/Config');
    global.logger = require('../common/Logger');
    global.logCache = [];
    __env__.redisConfig.useCluster = false;

    let redisUtils = require('../common/RedisUtils');

    let ret;
    ret = await redisUtils.hset('lingo_hset', 'k1', 'v1', 'k2', 'v2');
    ret = await redisUtils.hgetall(Buffer.from('lingo_hset'));
    console.log(ret);
});

test('testCluster', async () => {
    let Logger = require('../common/Logger');
    let redisUtils = require('../common/RedisUtils');
    redisUtils.setLogger(new Logger());
    let ret;
    ret = await redisUtils.hset('lingo_hset', 'k1', 'v1', 'k2', 'v2');
    ret = await redisUtils.hgetall('lingo_hset');
    console.log(ret);
});