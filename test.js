let httpService = require('./index');

httpService.config({
  debug: false,
  delay: 2000,
});


setTimeout(async()=>{
  let options = {
    url: `http://kthetindc.com/api-private/v3/urc/cloud/iam/user/credential`,
    method: "GET",
    headers:{},
    retry:3,
    timeout: 3000,
  };
  //console.log(options);
  httpService.requestCallback(options,(err, result)=>{
    if(err){
      console.log(`Final err`, err);
    }
  });

  httpService.requestPromise(options).then(res=>{
    console.log(res);
  }).catch(err=>{
    console.error(err);
  })
},1000)