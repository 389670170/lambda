let request = require('request-promise');
let AWS = require('aws-sdk');
let responseType = require('../entities/ResponseStatus');

let commons = null;
let lambdaClient = null;

function getClient() {
    if (lambdaClient) {
        return lambdaClient;
    }
    lambdaClient = new AWS.Lambda(__env__.lambdaConfig.clientConfig);
    return lambdaClient;
}

module.exports = {
    indexErrMsg: 'errorMessage',
    execLambda: async function (functionName, requestType, data, returnAll) {
        let jsonParams = {
            requestType: requestType,
            data: data
        };

        let jsonResult;
        if (__env__.lambdaConfig.isInvokeDirect) {
            jsonResult = await this.invokeDirect(jsonParams);
        } else {
            if (__env__.isOnline) {
                jsonResult = await this.invokeRemoteLambda(functionName, jsonParams);
            } else {
                jsonResult = await this.invokeLocalLambda(jsonParams);
            }
        }

        if (jsonResult.status === responseType.lambdaException) {
            throw new Error(`lambda call error,functionName:${functionName},payload:${JSON.stringify(jsonParams)}`);
        }

        if (returnAll) {
            return jsonResult;
        }
        return jsonResult.data;
    },

    invokeDirect: async function (jsonParams) {
        commons = commons || require('..');
        let invokePromise = new Promise((resolve, reject) => {
            commons.process(jsonParams, {}, (err, processResult) => {
                if (err) {
                    reject(Error(err));
                } else {
                    resolve(processResult);
                }
            }, __env__.logLevel);
        });

        return await invokePromise;
    },

    invokeRemoteLambda: async function (functionName, jsonParams) {
        let params = JSON.stringify(jsonParams);
        let event = {
            FunctionName: functionName + ':' + __env__.lambdaConfig.invokeAlias,
            Payload: params
        };
        let lambdaClient = getClient();
        let result = (await lambdaClient.invoke(event).promise()).Payload;
        if (result.indexOf(this.indexErrMsg) !== -1) {
            throw new Error(`lambda call error,functionName:${functionName},payload:${params}`);
        }
        return JSON.parse(result.toString());
    },

    invokeLocalLambda: async function (jsonParams) {
        let url = __env__.lambdaConfig.localUrl || 'http://localhost:5005/slots/lambda/www';
        let options = {
            url: url,
            json: jsonParams
        };
        return await request.post(options);
    }
};



