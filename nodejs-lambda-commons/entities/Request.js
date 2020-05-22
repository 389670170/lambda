let SFSWrapper = require('../common/SFSWrapper');
let ProbufWrapper = require('../common/ProtobufWrapper');

class Request {
    constructor(event) {
        if (typeof event === 'string') {
            event = JSON.parse(event);
        }
        this.__init__(event);
    }

    __init__(event) {
        this.requestType = event['requestType'];
        this.lambdaEvent = event['data'];
        if (__env__.decodeType === 'sfs' || !__env__.decodeType) {
            if (event['sfsObjType'] && event['sfsObjType'] !== '') {
                this.lambdaEvent = SFSWrapper.unwrapObj(this.lambdaEvent, event['sfsObjType']);
            }
        } else if (__env__.decodeType === 'ws') {
            this.lambdaEvent = ProbufWrapper.decodeWrapper(this.lambdaEvent, this.requestType)
        }

        if (typeof this.lambdaEvent === 'string') {
            this.lambdaEvent = JSON.parse(this.lambdaEvent);
        }
        if (!this.lambdaEvent) this.lambdaEvent = {};

        // 把消息和通用参数整合到一起
        let reqCommonParam = event['commonParam'];
        if (reqCommonParam && typeof reqCommonParam === 'object') {
            for (let key in reqCommonParam) {
                if (typeof this.lambdaEvent[key] === 'undefined') {
                    this.lambdaEvent[key] = reqCommonParam[key];
                }
            }
        }
    };
}

Request.prototype.getRequestType = function () {
    return this.requestType;
};

Request.prototype.getRequestData = function () {
    return this.lambdaEvent;
};

Request.prototype.getParamValue = function (field, defaultValue, validate) {
    let paramValue = this.lambdaEvent[field];
    validate = validate || true;
    if (paramValue == null) {
        if (typeof defaultValue === 'undefined' && validate) {
            throw new Error(field + ' is undefined');
        } else {
            paramValue = defaultValue;
        }
    }
    return paramValue;
};

Request.prototype.getFloatParam = function (field, defaultValue, validate) {
    let paramValue = this.getParamValue(field, defaultValue, validate);
    if (paramValue && isNaN(paramValue)) {
        throw new Error(paramValue + ' is not a number');
    }
    return paramValue ? parseFloat(paramValue) : paramValue;

};
Request.prototype.getNumberParam = function (field, defaultValue, validate) {
    let paramValue = this.getParamValue(field, defaultValue, validate);
    if (paramValue && isNaN(paramValue)) {
        throw new Error(paramValue + ' is not a number');
    }
    return paramValue ? parseInt(paramValue) : paramValue;

};
Request.prototype.getStringParam = function (field, defaultValue, validate) {
    let paramValue = this.getParamValue(field, defaultValue, validate);
    return paramValue ? String(paramValue) : paramValue;
};
Request.prototype.getBooleanParam = function (field, defaultValue, validate) {
    let paramValue = this.getParamValue(field, defaultValue, validate);
    return paramValue ? Boolean(paramValue) : paramValue;
};
Request.prototype.getJsonParam = function (field, defaultValue, validate) {
    let paramValue = this.getParamValue(field, defaultValue, validate);
    if (paramValue && typeof paramValue === "string") {
        paramValue = JSON.parse(paramValue);
    }
    if (typeof paramValue !== 'object') {
        throw new Error(field + ' is not a object');
    }
    return paramValue;
};

module.exports = Request;