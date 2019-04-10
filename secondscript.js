
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
