let responseStatus = require('./ResponseStatus');
let firehoseUtils = require('../common/FirehoseUtils');
let ProbufWrapper = require('../common/ProtobufWrapper');
let SFSWrapper = require('../common/SFSWrapper');

class Response {
    constructor() {
        this.log = [];
    }
}

Response.prototype.setReq = function (req) {
    this.req = req;
};

Response.prototype.setLogger = function (logger) {
    this.logger = logger;
};

Response.prototype.log = function (...optionalParams) {
    this.logger.log(optionalParams);
};
Response.prototype.debug = function (...optionalParams) {
    this.logger.debug(optionalParams);
};
Response.prototype.error = function (...optionalParams) {
    this.logger.error(optionalParams);
};

Response.prototype.log2Cloud = function (data) {
    if (!(data instanceof Array) || data.length === 0) {
        return;
    }
    let config = __env__.firehoseConfig;
    if (!config) {
        console.log(data);
        return;
    }
    let logInfo = [];
    if (typeof config.firstIndex === 'number' && config.firstIndex >= 0) {
        logInfo.push(data.splice(config.firstIndex, 1));
    }
    logInfo.push(Date.now());
    if (config.commonField instanceof Array) {
        for (let i = 0; i < config.commonField.length; i++) {
            logInfo.push(this.req.getStringParam(config.commonField[i], '-'));
        }
    }
    logInfo = logInfo.concat(data);
    let msg = logInfo.join(config.separator || '\t|\t');
    if (__env__.isProd) {
        this.log.push({
            Data: msg + '\n'
        });
    } else {
        this.logger.log(msg);
    }
};
/**
 * 即将抛弃；用log2Cloud方法代替
 * @param data
 */
Response.prototype.addLog = function (data) {
    this.log2Cloud(data);
};
Response.prototype.buildErrResponse = function (status, msg) {
    this.writeLog();
    return {
        status: status || responseStatus.errorStatus,
        msg: msg || '请求失败'
    }
};
Response.prototype.buildErr2Response = function (type, status) {
    this.writeLog();
    if (__env__.decodeType === 'ws') {
        let responseType = type +"Result";
        return {
            responseType: responseType,
            status: status || responseStatus.errorStatus
        }
    }
    return {
        status: status,
        msg: responseStatus[type][status]
    }
};

Response.prototype.buildOkResponse = function (data, sfsObjType) {
    // wrap pb消息
    if (__env__.decodeType === 'ws') {
        let res = {
            status: responseStatus.okStatus,
            data: data || {},
            responseType: sfsObjType
        };
        if (sfsObjType && sfsObjType !== '') {
            res.responseType = sfsObjType + 'Result';
            res.data = ProbufWrapper.encodeWrapper(data || {}, res.responseType);
        }
        this.writeLog();
        return res;
    }

    // wrap sfs消息
    let res = {
        status: responseStatus.okStatus,
        data: data || {},
        sfsObjType: sfsObjType
    };
    if (sfsObjType && sfsObjType !== '') {
        res.data = SFSWrapper.wrapObj(data, sfsObjType);
    }
    if (__env__.decodeType === 'ws') {
        sfsObjType = sfsObjType +"Result";
        let result = ProbufWrapper.encodeWrapper(data || {}, sfsObjType);
        this.writeLog();
        return {
            status: responseStatus.okStatus,
            data: result,
            responseType: sfsObjType
        }
    }
    this.writeLog();
    return res;
};

Response.prototype.buildOk2Response = function (data, sfsObjType) {
    // wrap pb消息
    if (__env__.decodeType === 'ws') {
        let res = {
            status: responseStatus.okStatus,
            data: data || {},
            responseType: sfsObjType
        };
        if (sfsObjType && sfsObjType !== '') {
            res.responseType = sfsObjType + 'Result';
            res.data = ProbufWrapper.encodeWrapper(res, res.responseType);
        }

        sfsObjType = sfsObjType + "Result";

        this.writeLog();
        return res;
    }

    // wrap sfs消息
    let res = {
        status: responseStatus.okStatus,
        data: data || {},
        sfsObjType: sfsObjType
    };
    if (sfsObjType && sfsObjType !== '') {
        res.data = SFSWrapper.wrapObj(res, sfsObjType);
    }
    this.writeLog();
    return res;
};

Response.prototype.buildWSOkResponse = function (data, responseType) {
    let result = ProbufWrapper.encodeWrapper(data || {}, responseType);
    this.writeLog();
    return {
        status: responseStatus.okStatus,
        data: result,
        responseType: responseType
    }
};

Response.prototype.buildWSErrResponse = function (status, responseType) {
    this.writeLog();
    return {
        responseType: responseType,
        status: status || responseStatus.errorStatus
    }
};

Response.prototype.writeLog = function () {
    if (this.log.length === 0) {
        return;
    }
    let deviceName = this.req.getStringParam('deviceName', '-');
    if (deviceName.startsWith('cp-ws-')) {
        return;
    }
    (async () => {
        await firehoseUtils.putRecordBatch(__env__.firehoseConfig.stream, this.log);
        this.log = [];
    })();
};


module.exports = Response;
