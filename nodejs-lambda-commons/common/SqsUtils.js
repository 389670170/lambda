let AWS = require("aws-sdk");
let SFSWrapper = require('./SFSWrapper');

let _sqs = null;
let _getSqs = function () {
    if (_sqs) {
        return _sqs;
    }

    _sqs = new AWS.SQS(__env__.sqsConfig);
    return _sqs;
};

module.exports = {
    setLogger: function (logger) {
        this.logger = logger;
    },
    queueUrlMap: new Map(),
    asyncSqs: async function (params, actionName) {
        if (!this.logger) this.logger = console;
        let retryCount = 0;
        this.logger.log(`start access sqs[${actionName}].`);
        let sqs = _getSqs();
        do {
            try {
                retryCount++;
                let result = await sqs[actionName](params).promise();
                this.logger.log(`end access sqs[${actionName}].`);
                return result;
            } catch (e) {
                if (retryCount > 1) {
                    this.logger.log(e);
                    this.logger.log(`retry ${actionName},retryCount: ${retryCount}`);
                } else {
                    this.logger.log(`params:${JSON.stringify(params)}`);
                    this.logger.log(e);
                }
            }
        } while (__env__.isOnline)
    },
    /**
     *
     * @param queueName lobbyslots_roomAchievemen
     * @param options {messageBody:'xxx',sfsObjType:'UpdateMachineAchievement'}
     * @param userId
     * @returns {Promise<*>}
     */
    sendSfsMessage: async function (queueName, options, userId) {
        return await this.sendMessageWithUserId(queueName, SFSWrapper.wrapObj(options.messageBody, options.sfsObjType), userId, options.sfsObjType);
    },
    sendSimpleMessage: async function (queueName, messageBody) {
        return await this.sendMessageWithUserId(queueName, messageBody);
    },
    sendMessageWithUserId: async function (queueName, messageBody, userId, sfsObjType) {
        if (typeof messageBody === 'object') {
            messageBody = JSON.stringify(messageBody);
        }
        let params = {
            MessageBody: messageBody,
            QueueUrl: await this.getQueueUrl(queueName)
        };
        if (userId) {
            params.MessageAttributes = {
                userId: {
                    DataType: 'Number',
                    StringValue: userId.toString()
                }
            };
            if (sfsObjType) {
                params.MessageAttributes.sfsObjType = {
                    DataType: 'String',
                    StringValue: sfsObjType
                };
            }
        }
        return await this.asyncSqs(params, 'sendMessage');
    },
    getQueueUrl: async function (queueName) {
        if (this.queueUrlMap.get(queueName)) {
            return this.queueUrlMap.get(queueName);
        }
        let params = {
            QueueName: queueName
        };
        if (!__env__.isOnline) {
            return "http://10.10.10.7:9324/queue/" + queueName;
        }
        let queueUrl = (await this.asyncSqs(params, 'getQueueUrl')).QueueUrl;
        this.queueUrlMap.set(queueName, queueUrl);
        return queueUrl;
    }
};