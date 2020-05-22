/**
 * 延迟处理模块
 */

let delayHandleQueue = [];

module.exports = {
  addDelayHandle(isAsync, cb) {
    delayHandleQueue.push({
      isAsync: isAsync,
      cb: cb
    });
  },

  async dealDelayHandleQueue() {
    for (let i = 0; i < delayHandleQueue.length; i++) {
      let delayHandleInfo = delayHandleQueue[i];
      if (delayHandleInfo.isAsync) {
        await delayHandleInfo.cb();
      } else {
        delayHandleInfo.cb();
      }
    }

    delayHandleQueue.length = 0;
  }
};