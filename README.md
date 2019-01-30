# http-request-retry

## http-request-retry
* Config request can retry n time if has error.
* It has small dependencies include lodash and request.

### Install module
```shell
npm install http-request-retry --save
```

### Step 1: import module
```javascript
let httpService = require('http-request-retry');
```

### Step 2: config module
```javascript
httpService.config({
  debug: false, //log consle if error
  delay: 1000, //waiting time between each retry
});
```

### Step 3: repair options
```javascript
let options = {
  url: `url request`, // required; url request Ex: http://abc.com https://abc.com
  method: "GET", //required; default POST
  headers: {}, //optional Ex: { 'Content-Type': 'application/json; charset=UTF-8' }
  retry:3,    //optional; type NUMBER
  timeout: 5000, //optional; request timeout; default 60000
};
```

### Step 4: excute
```javascript
httpService.requestPromise(options).then(res=>{
  console.log(res);
}).catch(err=>{
  console.error(err);
})
```
Or
```javascript
httpService.requestCallback(options,(err, result)=>{
  if(err){
    console.log(`Final err`, err);
  }
});
```
