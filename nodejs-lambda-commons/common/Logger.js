Date.prototype.format = function (fmt) { //author: meizz
    fmt = fmt || 'yyyy-MM-dd hh:mm:ss.S';
    var o = {
        "M+": this.getMonth() + 1,                 //月份
        "d+": this.getDate(),                    //日
        "h+": this.getHours(),                   //小时
        "m+": this.getMinutes(),                 //分
        "s+": this.getSeconds(),                 //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds()             //毫秒
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};

function Logger(logCache = []) {
    this.level = 'debug';
    this.logCache = logCache;
    this.setLevel = function (level) {
        this.level = level;
    };

    this.debug = function (...optionalParams) {
        this.logCache.push(`${new Date().format()} debug: ${optionalParams.join(" ")}`);
        if (['debug', 'trace', 'info'].indexOf(this.level) !== -1) {
            console.log(`${new Date().format()} debug: ${optionalParams.join(" ")}`);
        }
    };

    this.log = function (...optionalParams) {
        this.logCache.push(`${new Date().format()} log: ${optionalParams.join(" ")}`);
        if (['debug', 'trace', 'info'].indexOf(this.level) !== -1) {
            console.log(`${new Date().format()} log: ${optionalParams.join(" ")}`);
        }
    };

    this.error = function (...optionalParams) {
        console.error(optionalParams.join(" "));
    };
};

module.exports = Logger;
