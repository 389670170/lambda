let request = require('request-promise');

test('testLambda', async () => {
  let url = 'http://localhost:5006/slots/lambda/www';
  let options = {
    url: url,
    json: {
      requestType: 'mall/sendGoods',
      data: {}
    }
  };
  let res = await request.post(options);
  console.log(res);
});

test ('testPromise', async () => {
  let invokePromise = new Promise((resolve, reject) => {
    resolve({
      a: 111,
      b: 222
    });
    // reject(Error('just a test error'))
  });

  let res = await invokePromise;
  console.log(res)
});