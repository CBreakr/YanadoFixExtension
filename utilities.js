
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//
// UTILITIES
//
//////////////////////////////////////////////////////////

//
//
//
function isStringValidDashedDate(str){
  try{
    const {day, month, year} = getDayMonthYearFromString(str);

    if(!isValidDate(day, month, year)){
      return false;
    }
  }
  catch(err){
    return false;
  }

  return true;
}

function getDayMonthYearFromString(str){
  if(!str){
    return false;
  }

  let [year, month, day] = str.split("-");
  day = parseInt(day);
  month = parseInt(month);
  year = parseInt(year);

  // check if they are NaN
  if(day != day || month != month || year != year){
    throw new Error("not all date elements are numbers");
  }

  return {day, month, year};
}

const dayMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function isValidDate(day, month, year){
  // check that year is current year or earlier
  // check that month is within 1-12
  // check that day is within month range
  // check for february leap year
  //    - is divisible by 4  (don't worry about other rules)

  const monthLimit = dayMonth[month-1];
  const dayWithinMonthLimit = (day <= monthLimit);
  const yearDivisibleByFour = year%4 == 0;

  if(dayWithinMonthLimit){
    return true;
  }
  else if(month == 2 && day == 29 && yearDivisibleByFour){
    return true;
  }

  return false;
}

//
//
//
function addEmptyTimestampToDate(date){
  return date += "T00:00:00.000Z";
}

//
//
//
function GetDashedCurrentDate(includeEmptyTimestamp){
  const today = new Date();

  const year = today.getFullYear();
  let month = (today.getMonth() + 1);
  if(month < 10){
    month = "0" + month;
  }
  const day = today.getDate();

  let dateString = `${year}-${month}-${day}`;

  if(includeEmptyTimestamp){
    dateString = addEmptyTimestampToDate(dateString);
  }

  console.log(`dashed date: ${dateString}`);

  return dateString;
}

//
//
//
function CloseCurrentTask(){
  // at the end, close the task down
  const closeIcon = document.querySelector("span.yn-fl-close");
  closeIcon.focus();
  setTimeout(() => {
    closeIcon.click();
  }, 100);
}

//
//
//
function hasClass(element, className){
  if(element
    && className
    && element.classList.contains(className)){
    return true;
  }
  return false;
}

//
//
//
function ListOutActions(ActionList, index){
  for(let i = 0; i < ActionList.length; i++){
    console.log(`Action at ${i}: ${ActionList[i].note}, current index: ${index}`);
  }
}

//
//
//
function isVisible(identifier) {
    let element = document.querySelector(identifier);
    if(element){
      return isVisibleElement(element);
    }
    return false;
}

function isVisibleElement(element){
  if(!element){
    console.log("No element provided");
    return false;
  }
  var style = window.getComputedStyle(element);

  const vistest1 = !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
  const vistest2 = style.display !== "none";
  const vistest3 = style.visibility !== "hidden";

  return vistest1 && vistest2 && vistest3;
}

//
//
//
function isDisabled(identifier){
  let element = document.querySelector(identifier);
  if(element){
    return element.disabled;
  }
}

//
//
//
function FillTextboxValue(identifier, value){
  let item = document.querySelector(identifier);
  if(item){
    item.value = value;
  }
}

//
//
//
function FindMatchAndClick(identifier, inner){
  let items = document.querySelectorAll(identifier);
  if(items){
    let index;
    for(index = 0; index < items.length; index++){
    	let value = items[index].innerHTML;
      // if we didn't specify an inner value, just click based on identifier
    	if(!inner || value === inner){
    	  items[index].click();
    	  break;
    	}
    }
  }
}

// I might want some basic functionality for looping
// through table rows/cells

//
// - get rows with cells
// - function to apply
// - function to apply on "success"
// - function to apply on "failure"
//

//
// running through loops
//

//
// take in a lst of actions and process them
// through the looper one at a time
function RunActions(Actions){
  if(Actions && Actions.length > 0){
    let index = 0;

    const callback = (Err) => {
      if(Err) throw Err;
      if(index < Actions.length){
        console.log(`run at index: ${index}`);
        let indexToPass = index++;
        RunTimedLoopingCheck(Actions[indexToPass], callback, indexToPass, Actions);
      }
    }

    callback();
  }
}

//
//
//
function RunTimedLoopingCheck(
  {checkFunction,
  resultFunction,
  failFunction,
  checkPayload,
  resultPayload,
  checkInterval,
  maxInterval,
  note},
  callback,
  index,
  ActionList) {

  let currentInterval = 0;
  const loopFunction = () => {
    console.log(`Loop note: ${note}`);
    console.log(`trying at : ${currentInterval}`);
    // basic logic
    if(checkFunction(checkPayload)){
      resultFunction(resultPayload, ActionList, index);
      if(callback){
        callback();
      }
    }
    else if(currentInterval < maxInterval){
      currentInterval += checkInterval;
      setTimeout(loopFunction, checkInterval);
    }
    else{
      let failureFunctionReturn = false;
      if(failFunction && typeof failFunction === "function"){
        failureFunctionReturn = false || failFunction();
      }
      if(!failureFunctionReturn){
        // fail now and stop
        callback(new Error(`Ran out of time on: ${note}`));
      }
      else{
        // continue on as usual
        resultFunction(resultPayload, ActionList, index);
        if(callback){
          callback();
        }
      }
    }
  }

  loopFunction();
}

function triggerMouseEvent (node, eventType) {
    var clickEvent = document.createEvent ('MouseEvents');
    clickEvent.initEvent (eventType, true, true);
    node.dispatchEvent (clickEvent);
}

//
// from http://jsbin.com/awenaq/3/edit?html,css,js,output
//
function __triggerKeyboardEvent(el, keyCode)
{
    var eventObj = document.createEventObject ?
        document.createEventObject() : document.createEvent("Events");

    if(eventObj.initEvent){
      eventObj.initEvent("keypress", true, true);
    }

    eventObj.keyCode = keyCode;
    eventObj.which = keyCode;

    el.dispatchEvent ? el.dispatchEvent(eventObj) : el.fireEvent("onkeypress", eventObj);
}

const UtilitiesLoaded = true;
