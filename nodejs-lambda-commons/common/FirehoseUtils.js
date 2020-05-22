let AWS = require("aws-sdk");
let client;

function getClient() {
    if (client) {
        return client;
    }
    return client = new AWS.Firehose(__env__.firehoseConfig.clientConfig)
}

module.exports = {
    putRecord: async function (dStreamName, data) {
        getClient();
        if (typeof data === 'object') {
            data = JSON.stringify(data);
        }
        let recordParams = {
            Record: {
                Data: data
            },
            DeliveryStreamName: dStreamName
        };
        return await client.putRecord(recordParams).promise();
    },
    putRecordBatch: async function (dStreamName, dataList) {
        getClient();
        let recordParams = {
            Records: dataList,
            DeliveryStreamName: dStreamName
        };
        return await client.putRecordBatch(recordParams).promise();
    }
};