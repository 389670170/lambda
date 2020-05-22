module.exports = {
    /**
     *   数据解析类型,默认:sfs
     *   ws:websocket, sfs:smartfox
     */
    decodeType: 'ws',
    /**
     * pg连接字符串配置
     */
    dbConfig: {
        conString: "postgres://postgres:@10.10.10.10:5432/lobbyslots"
    },
    /**
     * dynamo相关配置
     */
    dynamoConfig: {
        clientConfig: {
            endpoint: "http://10.10.10.7:9898",
            region: "cn-northwest-1",
            httpOptions: {
                connectTimeout: 1000,
                timeout: 1000
            },
            maxRetries: 0,
            sslEnabled: false,
            paramValidation: false,
            convertResponseTypes: false,
            apiVersion: "2012-08-10"
        },
        retryExceptionCodes: [
            'TimeoutError',
            'RequestLimitExceeded',
            'ProvisionedThroughputExceededException',
            'ThrottlingException',
            'LimitExceededException',
            'ItemCollectionSizeLimitExceededException'
        ]
    },
    /**
     * sqs相关配置
     */
    sqsConfig: {
        endpoint: "http://10.10.10.7:9324",
        region: "us-west-2",
        apiVersion: '2012-11-05'
    },
    /**
     * redis相关配置
     */
    redisConfig: {
        useCluster: false,
        prefix: '',
        single: {
            host: "10.10.10.7",
            port: 63792,
            detect_buffers: true
        },
        cluster: {
            servers: [
                {
                    host: "127.0.0.1",
                    port: 6381
                },
                {
                    host: "127.0.0.1",
                    port: 6382
                },
                {
                    host: "127.0.0.1",
                    port: 6383
                }
            ],
            options: {
                detect_buffers: true
            },
            publicHost: "10.10.10.7"
        }
    },
    firehoseConfig: {
        clientConfig: {
            region: 'us-west-2'
        },
        stream: 'test',
        commonField: ['clientIp', 'deviceName', 'emailId', 'userId', 'adjustAdid', 'adjustIdfa', 'adjustGpsAdid'],
        firstIndex: 0,
        separator: '\t|\t'
    },
    isOnline: true,
    logLevel: 'error',
    lambdaConfig: {
        isInvokeDirect: false,
        localUrl: 'http://localhost:5008/slots/lambda/www',
        invokeAlias: 'PROD',
        clientConfig: {
            apiVersion: '2015-03-31',
            region: "us-west-2"
        }
    }
};