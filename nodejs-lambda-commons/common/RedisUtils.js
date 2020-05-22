let Bluebird = require('bluebird');
let Redis = require('ioredis');

let _docClient = null;
let _getClient = function () {
    if (_docClient) {
        return _docClient;
    }

    if (__env__.redisConfig.useCluster) {
        Bluebird.promisifyAll(Redis.Cluster.prototype);
        _docClient = new Redis.Cluster(
            __env__.redisConfig.cluster.servers,
            {
                redisOptions: __env__.redisConfig.cluster.options
            }
        );
    } else {
        Bluebird.promisifyAll(Redis.prototype);
        _docClient = new Redis(__env__.redisConfig.single);
    }
    return _docClient;
};

_getClient();

let _wrap = function (cmd) {
    let retFunc = async function (key, ...args) {
        if (!this.logger) this.logger = console;
        try {
            let docClient = _getClient();
            let prefix = __env__.redisConfig.prefix
            let realCmd = cmd + 'Async';

            if (key instanceof Buffer) {
                key = prefix + key.toString();
                realCmd = cmd + 'Buffer' + 'Async';
            } else {
                key = prefix + key;
            }

            this.logger.log(`redis exec: ${realCmd} ${key}`);

            args.unshift(key);
            let realFunc = docClient[realCmd];
            let result = await realFunc.apply(docClient, args);

            this.logger.log(`redis exec: finish`);
            return result;
        } catch (e) {
            this.logger.error(`redis do ${cmd} failed: ${e.message}`);
            throw new Error(`redis do ${cmd} failed: ${e.message}`);
        }
    };

    return retFunc;
};

module.exports = {
    setLogger: function (logger) {
        this.logger = logger;
    },
    expire: _wrap('expire'),
    del: _wrap('del'),

    set: _wrap('set'),
    setnx: _wrap('setnx'),
    setex: _wrap('setex'),
    psetex: _wrap('psetex'),
    get: _wrap('get'),
    getset: _wrap('getset'),
    strlen: _wrap('strlen'),
    append: _wrap('append'),
    setrange: _wrap('setrange'),
    getrange: _wrap('getrange'),
    incr: _wrap('incr'),
    incrby: _wrap('incrby'),
    incrbyfloat: _wrap('incrbyfloat'),
    decr: _wrap('decr'),
    decrby: _wrap('decrby'),
    mset: _wrap('mset'),
    msetnx: _wrap('msetnx'),
    mget: _wrap('mget'),

    hset: _wrap('hset'),
    hsetnx: _wrap('hsetnx'),
    hget: _wrap('hget'),
    hexists: _wrap('hexists'),
    hdel: _wrap('hdel'),
    hlen: _wrap('hlen'),
    hstrlen: _wrap('hstrlen'),
    hincrby: _wrap('hincrby'),
    hincrbyfloat: _wrap('hincrbyfloat'),
    hmset: _wrap('hmset'),
    hmget: _wrap('hmget'),
    hkeys: _wrap('hkeys'),
    hvals: _wrap('hvals'),
    hgetall: _wrap('hgetall'),
    hscan: _wrap('hscan'),

    lpush: _wrap('lpush'),
    lpushx: _wrap('lpushx'),
    rpush: _wrap('rpush'),
    rpushx: _wrap('rpushx'),
    lpop: _wrap('lpop'),
    rpop: _wrap('rpop'),
    rpoplpush: _wrap('rpoplpush'),
    lrem: _wrap('lrem'),
    llen: _wrap('llen'),
    lindex: _wrap('lindex'),
    linsert: _wrap('linsert'),
    lset: _wrap('lset'),
    lrange: _wrap('lrange'),
    ltrim: _wrap('ltrim'),
    blpop: _wrap('blpop'),
    brpop: _wrap('brpop'),
    brpoplpush: _wrap('brpoplpush'),

    sadd: _wrap('sadd'),
    sismember: _wrap('sismember'),
    spop: _wrap('spop'),
    srandmember: _wrap('srandmember'),
    srem: _wrap('srem'),
    smove: _wrap('smove'),
    scard: _wrap('scard'),
    smembers: _wrap('smembers'),
    sscan: _wrap('sscan'),
    sinter: _wrap('sinter'),
    sinterstore: _wrap('sinterstore'),
    sunion: _wrap('sunion'),
    sunionstore: _wrap('sunionstore'),
    sdiff: _wrap('sdiff'),
    sdiffstore: _wrap('sdiffstore'),

    zadd: _wrap('zadd'),
    zscore: _wrap('zscore'),
    zincrby: _wrap('zincrby'),
    zcard: _wrap('zcard'),
    zcount: _wrap('zcount'),
    zrange: _wrap('zrange'),
    zrevrange: _wrap('zrevrange'),
    zrangebyscore: _wrap('zrangebyscore'),
    zrevrangebyscore: _wrap('zrevrangebyscore'),
    zrank: _wrap('zrank'),
    zrevrank: _wrap('zrevrank'),
    zrem: _wrap('zrem'),
    zremrangebyrank: _wrap('zremrangebyrank'),
    zremrangebyscore: _wrap('zremrangebyscore'),
    zrangebylex: _wrap('zrangebylex'),
    zlexcount: _wrap('zlexcount'),
    zremrangebylex: _wrap('zremrangebylex'),
    zscan: _wrap('zscan'),
    zunionstore: _wrap('zunionstore'),
    zinterstore: _wrap('zinterstore')
};

