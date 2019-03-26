
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//
// INITIAL SETUP
//

RunSetup();

function RunSetup(){
  AllTaskClickHeader();
  CreateToddButton();
  SnoozeButton();
}

//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//
// specific functions
//
//////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//
// All Task Click Header
//
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////

//
//
//
function AllTaskClickHeader(){
  document.querySelector('body').addEventListener('click', function (event) {
    if (event.target.classList.contains('yn-group-kanban-view-name')
	|| event.target.classList.contains('yn-group-list-view-name')
	|| event.target.classList.contains('yn-group-card-view-name')
    ) {
    	let content = event.target.innerHTML;
    	let groupId = event.target.getAttribute("yn-group-id");
    	if(groupId == null || groupId.indexOf("project") !== -1){
    	  FindMatchAndClick(".projectName", content);
    	}
    	else{
    	//  alert("not a project name");
    	}
    }
  });
}

//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//
// bring to Todd's attention
//
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////

const ToddAttentionTag = "#ToddAttention";

//
//
//
function CreateToddButton() {
  console.log("INSIDE CREATE BUTTON");
  RunTimedLoopingCheck(CreateToddButtonAction());
}

//
//
//
function CreateToddButtonAction(){
  return {
    checkFunction:isVisible,
    resultFunction:() => {
      const YanadoButton = document.getElementById("yn-top-bar-widget");
      var rect = YanadoButton.getBoundingClientRect();

      const NewButton = document.createElement("button");
      NewButton.innerHTML = "Todd Action";
      NewButton.className = "ToddButton";

      NewButton.style.position="absolute";
      NewButton.style.right = "10%";
      NewButton.style.top = rect.top + 32 + "px";
      NewButton.style.zIndex = "10";

      YanadoButton.parentNode.insertBefore(NewButton, YanadoButton.nextSibling);

      NewButton.addEventListener("click", GetToddsAttention);
    },
    checkPayload:"#yn-top-bar-widget",
    resultPayload:null,
    checkInterval:200,
    maxInterval:15000,
    note:"yanado button check"
  };
}

//
//
//
function GetToddsAttention(event) {
  const Actions = [];

  if(isVisible(".yn-header-main-holder[collapsed='true']")){
    console.log("need to switch to Yanado");
    Actions.push(CreateSwitchToYanadoAction());
  }
  else{
    console.log("Yanado mode already?");
  }

// click on All Tasks (check if this is visible)
// enter tag value into search box, place focus (check if it's visible)
//    input class="yn-input-search"
// yn-make-advanced-search --> click (enter text and click are both the actions)

  Actions.push(CreateAllTaskClickAction());

  /*
    It looks like there are extra check to make

    --> after clicking on All Tasks, need to check for the Tasks to be loaded
      - maybe look for these: div yn-type="TASK"
      - and then maybe wait half a second afterwards anyway?
    --> if the search box isn't yet visible, need to click the icon
    --> once I enter a value it would be great to
  */

  Actions.push(CreateTaskLoadingWaitAction());
  Actions.push(CreateQuestionIconClickAction());

  Actions.push(CreateEnterToddAttentionSearchAction());

  RunActions(Actions);
}

//
// if we're not in Yanado mode, swotch to Yanado
//
function CreateSwitchToYanadoAction(){
  return {
    checkFunction:() => true,
    resultFunction:() => {
      console.log("result: switch to Yanado");
      FindMatchAndClick(".yn-header-flex-div");
    },
    checkPayload:null,
    resultPayload:null,
    checkInterval:100,
    maxInterval:200,
    note:"switch to Yanado"
  };
}

//
// if we have the All Tasks button, click it
//
function CreateAllTaskClickAction(){
  return {
    checkFunction:() => isVisible(".projectName[title='All Tasks']"),
    resultFunction:() => {
      FindMatchAndClick(".projectName[title='All Tasks']");
    },
    checkPayload:null,
    resultPayload:null,
    checkInterval:200,
    maxInterval:5000,
    note:"all task click"
  };
}

//
// after All Tasks is clicked, need to wait until tasks are loaded in
//
function CreateTaskLoadingWaitAction(){
  return {checkFunction: () => {
    const task = document.querySelector("div[yn-type='TASK']");
    return task;
  },
  resultFunction:() => {
    ; // nothing to do in here, we just needed to wait
  },
  checkPayload:null,
  resultPayload:null,
  checkInterval:50,
  maxInterval:5000,
  note:"task loading wait"};
}

//
// click on the question-mark icon if the
// search field isn't yet available
//
function CreateQuestionIconClickAction(){
  return {checkFunction: () => {
    return true; // no reason to wait at this point
  },
  resultFunction:() => {
    if(!isVisible(".yn-input-search") || isDisabled(".yn-input-search")){
      document.querySelector(".yn-toggle-search-icon").click();
    }
  },
  checkPayload:null,
  resultPayload:null,
  checkInterval:50,
  maxInterval:1000,
  note:"question icon click"};
}

//
// fill in the search field to get Todd's Attention
//
function CreateEnterToddAttentionSearchAction(){
  return {
    checkFunction: () => {
      return isVisible(".yn-input-search")
        && !isDisabled(".yn-input-search");
    },
    resultFunction: () => {
      setTimeout(() => {
        console.log("input and search");
        FillTextboxValue(".yn-input-search", ToddAttentionTag);

        let text = document.querySelector('.yn-input-search');
        text.focus();

        /*
        text.addEventListener("keypress", () => {
          console.log("keypress test for text");
        });

        __triggerKeyboardEvent(text, 13);
        */

      }, 50);
    },
    checkPayload:null,
    resultPayload:null,
    checkInterval:200,
    maxInterval:5000,
    note:"enter Todd search"
  };
}

//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//
// Snooze Button Functionality
//
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////

//
//
//
function SnoozeButton(){
  console.log("SNOOZE BUTTON!");

  // on open task:
  // - create and attach spacer and SNooze option to dropdown
  //  --> (need to make sure that this process doesn't create duplicates)
  //  - add click listener to do:
  //
  // - click due date link
  // - click "Custom" option from dropdown
  // - loop through table:
  //    - find the current due date
  //    - attempt to add X days to it (2 for now)
  //      - step forward 2 days
  //        - if we're on a weekday, click to set
  //        - if we're on a weekend:
  //          - if we're on the last row:
  //            - click the next month button
  //              --> OK, this is a tricky step
  //                --> this seems like a new Action
  //                  --> do we have a way of inserting a new Action?
  //            - find the first weekday not from previous month
  //          - go to next row and click on first weekday
  //  - add to the snooze value for the tasks
  //    - To Be Determined
  //

  // looking for class xdsoft_current
  // avoid class xdsoft_other_month

}

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
function isVisible(identifier) {
    let element = document.querySelector(identifier);
    if(element){
      var style = window.getComputedStyle(element);

      const vistest1 = !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
      const vistest2 = style.display !== "none";
      const vistest3 = style.visibility !== "hidden";

      return vistest1 && vistest2 && vistest3;
    }
    return false;
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
        RunTimedLoopingCheck(Actions[index++], callback);
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
  checkPayload,
  resultPayload,
  checkInterval,
  maxInterval,
  note},
  callback) {

  let currentInterval = 0;
  const loopFunction = () => {
    console.log(`Loop note: ${note}`);
    console.log(`trying at : ${currentInterval}`);
    // basic logic
    if(checkFunction(checkPayload)){
      resultFunction(resultPayload);
      callback();
    }
    else if(currentInterval < maxInterval){
      currentInterval += checkInterval;
      setTimeout(loopFunction, checkInterval);
    }
    else{
      callback(new Error(`Ran out of time on: ${note}`));
    }
  }

  loopFunction();
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
