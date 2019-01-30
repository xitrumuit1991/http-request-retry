let _ = require('lodash');
let _request = require('request');

let HTTPService = {
  debug: false,
  delay: 1000,
};

HTTPService.config = (obj)=>{
  if(obj && _.isBoolean(obj.debug))
    HTTPService.debug = obj.debug;
  if(obj && _.isNumber(obj.delay))
    HTTPService.delay = obj.delay || 1000;
};

let requestCallback = (options = {}, done)=>{
  done = done || function (){};
  options.method = options.method || "POST";
  options.json = true;
  options.timeout = options.timeout || 60*1000;
  options.body = options.body || {};
  options.headers =  _.extend(options.headers || {}, { 'Content-Type': 'application/json; charset=UTF-8' });
  _request(options, (error, response, body) => {
    let statusCode = (response && response.statusCode ) ?  response.statusCode : 400;
    if (error){
      if(HTTPService.debug === true )
        console.error(`Request ${options.url}`, {statusCode: statusCode, error: error, body:body, options: options });
      return done(error, null);
    }
    if (!_.includes([200,201,202,203, 204], statusCode)){
      if(HTTPService.debug === true )
        console.error(`Request ${options.url}`, {statusCode: statusCode, error: body, options: options });
      return done(body, null);
    }
    return done(null,body);
  });
};

let requestPromise = (options = {})=>{
  return new Promise((resolve, reject)=>{
    options.method = options.method || "POST";
    options.json = true;
    options.body = options.body || {};
    options.headers = _.extend(options.headers || {}, { 'Content-Type': 'application/json; charset=UTF-8' });
    options.timeout = options.timeout || 60*1000;
    _request(options, (error, response, body) => {
      let statusCode = (response && response.statusCode ) ?  response.statusCode : 400;
      if (error){
        if(HTTPService.debug === true )
          console.error(`Request ${options.url}`, {statusCode: statusCode, error: error, body:body, options: options });
        return reject(error);
      }
      if (!_.includes([200,201,202,203, 204], statusCode)){
        if(HTTPService.debug === true )
          console.error(`Request ${options.url}`, {statusCode: statusCode, error: body, options: options });
        return reject(body);
      }
      return resolve(body);
    });
  });
};


HTTPService.requestCallback = (options, done)=>{
  let retry = options && options.retry ? parseInt(options.retry) : null;
  if(options && !_.isNumber(retry))
  {
    return requestCallback(options,(error, result)=>{
      if(HTTPService.debug === true )
        console.error(`ERROR request callback; ${options.url}`, error);
      return done(error,result);
    })
  }
  else if(options && _.isNumber(retry))
  {
    return setTimeout(async()=>{
      for(let i=0; retry > 0 && i < retry; i++)
      {
        try{
          let data = await requestPromise(options);
          if(data) {
            return done(null, data);
          }
        }catch(error){
          //wait n second
          if(HTTPService.delay && _.isNumber(HTTPService.delay))
            await new Promise((resolve, reject)=>{ setTimeout(()=>{ resolve(null); }, 1000); });
          if(HTTPService.debug === true )
            console.error(`ERROR request callback; retry=${i}; ${options.url}`, error);
          if(i >= (retry-1)){
            return done(error, null);
          }
        }
      }
    },1);
  }
};



HTTPService.requestPromise = async (options)=>{
  let retry = options && options.retry ? parseInt(options.retry) : null;
  let data = null;

  //todo not retry
  if( !_.isNumber(retry) || _.isNaN(retry) ){
    try{
      return await requestPromise(options);
    }catch(error){
      throw error;
    }
  }

  //todo retry n times
  retry = _.isNumber(retry) ? retry : 3;
  for(let i=0; _.isNumber(retry) && retry > 0 && i < retry; i++)
  {
    try{
      let data = await requestPromise(options);
      if(data) {
        return data;
      }
    }catch(error){
      //wait n second
      if(HTTPService.delay && _.isNumber(HTTPService.delay))
        await new Promise((resolve, reject)=>{ setTimeout(()=>{ resolve(null); }, HTTPService.delay); });
      if(HTTPService.debug === true )
        console.error(`ERROR retry=${i}; ${options.url}`, error);
      if(i >= (retry-1)){
        throw error;
      }
    }
  }
  return data;
};

module.exports = HTTPService;
