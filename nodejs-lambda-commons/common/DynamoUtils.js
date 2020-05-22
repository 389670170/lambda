let AWS = require("aws-sdk");

let _docClient = null;


const retryExceptionCodes = [
    'TimeoutError',
    'NetworkingError',
    'RequestLimitExceeded',
    'ProvisionedThroughputExceededException',
    'ThrottlingException',
    'LimitExceededException',
    'ItemCollectionSizeLimitExceededException',
    'InternalServerError',
    'InvalidSignatureException',
    'UnknownError',
    'UnknownEndpoint'
];

let _getClient = function () {
    if (_docClient) {
        return _docClient;
    }
    let clientConfig = __env__.dynamoConfig.clientConfig;
    _docClient = new AWS.DynamoDB.DocumentClient(clientConfig);
    return _docClient;
};

_getClient();

module.exports = {
    setLogger: function (logger) {
        this.logger = logger;
    },
    asyncDynamo: async function (params, functionName) {
        if (!this.logger) this.logger = console;
        let retryCount = 0;
        this.logger.log(`start access dynamodb[${functionName}],params:${JSON.stringify(params)}`);

        let docClient = _getClient();
        do {
            try {
                retryCount++;
                let result = await docClient[functionName](params).promise();
                this.logger.log(`end access dynamodb[${functionName}].`);
                return result;
            } catch (e) {
                if (retryExceptionCodes && retryExceptionCodes.indexOf(e.code) !== -1) {
                    if (retryCount > 1) {
                        this.logger.log(e);
                        this.logger.log(`retry ${functionName},retryCount: ${retryCount}`);
                    } else {
                        this.logger.log(`params:${JSON.stringify(params)}`);
                        this.logger.log(e);
                    }
                } else {
                    //根据情况修改重试配置
                    this.logger.log(e.code);
                    throw e;
                }
            }
        } while (true)
    },
    asyncBatchWrite: async function (params) {
        return await this.asyncDynamo(params, 'batchWrite');
    },
    asyncPut: async function (params) {
        return await this.asyncDynamo(params, 'put');
    },
    asyncUpdate: async function (params) {
        return await this.asyncDynamo(params, 'update');
    },
    asyncQuery: async function (params) {
        return await this.asyncDynamo(params, 'query');
    },
    asyncGetItem: async function (params) {
        return await this.asyncDynamo(params, 'get');
    },
    asyncScan: async function (params) {
        return await this.asyncDynamo(params, 'scan');
    },
    asyncDeleteItem: async function (params) {
        return await this.asyncDynamo(params, 'delete');
    },
    asyncBatchGet: async function (params) {
        return await this.asyncDynamo(params, 'batchGet');
    }
};