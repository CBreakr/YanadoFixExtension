
function secondscript_init(){
  var checks = 0;
  var checkLimit = 200;
  var checkTime = 20;

  const rollingTransferCheck = function(){
    console.log(`SECOND SECOND SCRIPT checking for UTILITIES: ${checks} out of ${checkLimit}`);
    try{
      if(__triggerKeyboardEvent != undefined){
        console.log("do we have the functions loaded?");
        Launch();
      }
      else {
        ElseAndCatch();
      }
    }
    catch(err){
      ElseAndCatch();
    }
  };

  const ElseAndCatch = function(){
    if(checks < checkLimit){
      checks++;
      setTimeout(rollingTransferCheck, checkTime);
    }
  }

  rollingTransferCheck();
}

secondscript_init();

function Launch(){
  console.log("LAUNCHED LAUNCHED LAUNCHED");
  //AttemptAPICall();
}

function AttemptAPICall(){
  const xhr = new XMLHttpRequest();
  xhr.timeout = 10000;
  xhr.onload = function() {
    if (xhr.status == 200) {
      console.log(`XHR RESPONSE: ${xhr.response}`);
    }
    else{
      console.log(`XHR STATUS for GET TEST: ${xhr.status}`);
    }
  };
  xhr.open("GET", "https://api.yanado.com/public-api/lists", true);
  xhr.setRequestHeader('X-API-Key', 'd2c34c57-3521-47a0-983e-77916347d2c5');
  xhr.send();
}
