let Request = require('./entities/Request');
let Response = require('./entities/Response');

exports.Logger = require('./common/Logger');
exports.SFSWrapper = require('./common/SFSWrapper');
exports.ProbufWrapper = require('./common/ProtobufWrapper');
exports.RequestMapping = require('./common/RequestMapping');
exports.DbUtils = require('./common/DbUtils');
exports.SqsUtils = require('./common/SqsUtils');
exports.RedisUtils = require('./common/RedisUtils');
exports.DynamoUtils = require('./common/DynamoUtils');
exports.LambdaUtils = require('./common/LambdaUtils');
exports.DelayHandleUtils = require('./common/DelayHandleUtils');

let newVM;
exports.process = async (event, context, callback, logLevel) => {
    // aws lambda 设置
    context.callbackWaitsForEmptyEventLoop = false;

    let logger = new this.Logger();
    logger.setLevel(logLevel);
    if (typeof newVM === 'undefined') {
        newVM = 1;
        logger.log('new vm start');
    }

    this.DbUtils.setLogger(logger);
    this.SqsUtils.setLogger(logger);
    this.RedisUtils.setLogger(logger);
    this.DynamoUtils.setLogger(logger);

    let res = new Response();
    try {
        let req = new Request(event);
        let requestType = req.getRequestType();

        // lambda执行
        logger.log(`lambda start:  ${requestType}`);
        logger.log(`lambda request data: ${JSON.stringify(req.getRequestData(), null, 2)}`);

        res.setReq(req);
        res.setLogger(logger);
        let processResult = await this.RequestMapping[requestType](req, res);

        // 消息调试
        if (global.__env__ && global.__env__.debugMsg) {
            logger.log(`lambda response data: ${JSON.stringify(processResult, null, 2)}`);
        }

        logger.log(`lambda finish:  ${requestType}`);

        callback(null, processResult);
    } catch (reason) {
        logger.log((reason.message || reason) + (reason.stack ? reason.stack : ''));
        if (global.__env__ && global.__env__.isProd) {
            await this.SqsUtils.sendSimpleMessage('lambda-err', {
                awsRequestId: context.awsRequestId,
                projectName: global.__env__.projectName || '',
                functionName: context.functionName + '[' + context.functionVersion + ']',
                errInfo: logger.logCache.join('\n\t')
            });
        } else {
            console.error('lambda error: [\n\t' + logger.logCache.join('\n\t') + '\n]');
        }
        let errResult = res.buildErrResponse(500, 'lambda error:' + (reason.message || reason) || 'an unknown error');
        return callback(null, errResult);
    } finally {

    }
};


