let protocol;
let packName;

module.exports = {
    init: function (proto, pack) {
        protocol = proto;
        packName = pack;
    },
    decodeWrapper: function (messageContent, messageType) {
        if (messageContent == null) return null;
        messageContent = stringToUnit8Array(messageContent);
        let coder = protocol[packName][messageType];
        return coder.decode(messageContent);
    },
    encodeWrapper: function (messageContent, messageType) {
        if (messageContent == null) return null;
        let coder = protocol[packName][messageType];
        let errMsg = coder.verify(messageContent);
        if (errMsg)
            throw Error(errMsg);
        let message = coder.create(messageContent);
        let buffer = coder.encode(message).finish();
        return unit8ArrayToString(buffer);
    }
};

function stringToUnit8Array(str) {
    let arr = [];
    for (let i = 0, j = str.length; i < j; ++i) {
        arr.push(str.charCodeAt(i));
    }
    let tmpUint8Array = new Uint8Array(arr);
    return tmpUint8Array
}

function unit8ArrayToString(data) {
    let dataString = "";
    for (let i = 0; i < data.length; i++) {
        dataString += String.fromCharCode(data[i]);
    }
    return dataString
}
