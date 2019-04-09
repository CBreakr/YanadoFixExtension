
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//
// INITIAL SETUP
//

//
//
// FIRST WE CHECK THAT THE UTILITIES HAVE BEEN LOADED
//
//

function script_init(){
  var checks = 0;
  var checkLimit = 200;
  var checkTime = 20;

  const rollingTransferCheck = function(){
    console.log(`MAIN SCRIPT checking for UTILITIES: ${checks} out of ${checkLimit}`);
    try{
      if(__triggerKeyboardEvent != undefined){
        console.log("do we have the functions loaded?");
        RunSetup();
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

script_init();

//
//
// THEN WE START THE SCRIPT AS USUAL
//
//

function RunSetup(){
  AllTaskClickHeader();
  CreateToddButton();
  SetupSnoozeButton();
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

  Actions.push(FilterIconClickAction());
  Actions.push(FilterListClickAction());
  Actions.push(FilterAllTasksClickAction());

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
    // wait for this to load
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
function FilterIconClickAction(){
  // div.yn-bar-tasks-filter-trigger
  return {
    checkFunction:() => {
      return isVisible("div.yn-bar-tasks-filter-trigger");
    },
    resultFunction:() => {
      FindMatchAndClick("div.yn-bar-tasks-filter-trigger");
    },
    checkPayload:null,
    resultPayload:null,
    checkInterval:50,
    maxInterval:2000,
    note:"Filter Icon Click"
  };
}

//
function FilterListClickAction(){
  // div.yn-dropdown-trigger-elem yn-material-dropdown
  // with child span that contains All Tasks
  return {
    checkFunction:() => {
      return isVisible("div.yn-btfdd-filter-by-dd div.yn-dropdown-trigger-elem");
    },
    resultFunction:() => {
      const FilterItem = document.querySelector("div.yn-btfdd-filter-by-dd div.yn-dropdown-trigger-elem");
      FilterItem.click();
    },
    checkPayload:null,
    resultPayload:null,
    checkInterval:50,
    maxInterval:2000,
    note:"Filter List Click"
  };
}

//
function FilterAllTasksClickAction(){
  //li[yn-filter-by='ALL_TASKS']
  let AllTasksItem = null;
  return {
    checkFunction:() => {
      if(!AllTasksItem){
        AllTasksItem = document.querySelector("li[yn-filter-by='ALL_TASKS']");
      }
      return isVisibleElement(AllTasksItem);
    },
    resultFunction:() => {
      AllTasksItem.click();
    },
    checkPayload:null,
    resultPayload:null,
    checkInterval:50,
    maxInterval:2000,
    note:"Filter AllTasks Click"
  };
}

//
// click on the question-mark icon if the
// search field isn't yet available
//
function CreateQuestionIconClickAction(){
  return {checkFunction: () => {
    // wait for the filter to be done
    const task = document.querySelector("div[yn-type='TASK']");
    return task;
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
        text.click();
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
    maxInterval:6000,
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

const SNOOZE_INTERVAL = 2;
const SNOOZE_FIELD_NAME = "SnoozeCount";

//
//
//
function SetupSnoozeButton(){
// <span class="yn-overflow yn-icon"></span>

  // add an event listener to the page,
  // looking for the div yn-type="TASK"

  document.addEventListener("click", (event) => {
    const element = event.target;
    if(element.matches("span.yn-overflow")){
      RunTimedLoopingCheck(CreateSnoozeOptionAction());
    }
  }, false);
}

function CreateSnoozeOptionAction(){
  return {
    checkFunction: () => {
      const optionListFirstElement = document.querySelector("li[data-tooltip='Delete this task permanently']");
      return optionListFirstElement;
    },
    resultFunction: CreateSnoozeOption,
    checkPayload: null,
    resultPayload: null,
    checkInterval: 20,
    maxInterval: 400,
    note: "Create Snoozing Option Action"
  };
}

function CreateSnoozeOption(){

  console.log("Creating snooze!");

  const optionListFirstElement = document.querySelector("li[data-tooltip='Save task as template']");

  if(optionListFirstElement){
    const optionList = optionListFirstElement.parentElement;
    let listItem = document.createElement('li');
    listItem.className = "yn-task-oo-li";
    listItem.setAttribute("role", "presentation");
    listItem.appendChild(document.createTextNode("Snooze"));
    listItem.addEventListener("click", (event) => {
      RunSnooze();
    });
    optionList.appendChild(listItem);
  }
}

function RunSnooze(){
  console.log("SNOOZING!");
  const Actions = [];

  Actions.push(ClickDueDateAction());
  Actions.push(ClickCustomDueDateAction());
  Actions.push(DateDeterminationAction())
  Actions.push(CalendarTraversalAction());
  Actions.push(AddSnoozeValueActionAndClose());

  RunActions(Actions);
}

function ClickDueDateAction(){
  return {
    checkFunction: () => {
      return isVisible(".yn-due-date-trigger");
    },
    resultFunction: () => {
      FindMatchAndClick(".yn-due-date-trigger");
    },
    checkPayload: null,
    resultPayload: null,
    checkInterval: 20,
    maxInterval: 400,
    note: "Click Due Date"
  };
}

function ClickCustomDueDateAction(resultPayload){
  return {
    checkFunction: () => {
      return isVisible("span[yn-trans-id='yanado.taskDetails.dueDateCustom.label']");
    },
    resultFunction: () => {
      FindMatchAndClick("span[yn-trans-id='yanado.taskDetails.dueDateCustom.label']");
    },
    checkPayload: null,
    resultPayload: resultPayload,
    checkInterval: 40,
    maxInterval: 1000,
    note: "Click Custom Date"
  };
}

function DateDeterminationAction(){
    return {
      checkFunction: () => {
        const element = document.querySelector(".xdsoft_monthselect div .xdsoft_current");
        if(element){
          return true;
        }
        else{
          return false;
        }
      },
      resultFunction: (payload, ActionList, index) => {
        // and now the complicated part
        const today = new Date();
        const month = today.getMonth();
        const year = today.getFullYear();
        const monthSelect = document.querySelector(".xdsoft_monthselect div");
        const yearSelect = document.querySelector(".xdsoft_yearselect div");
        const currentlySelectedYear = Number(yearSelect.querySelector(".xdsoft_current").getAttribute("data-value"));
        const currentlySelectedMonth = Number(monthSelect.querySelector(".xdsoft_current").getAttribute("data-value"));

        let yearToUse = null;
        let monthToUse = null;

        // determine if the selected date is before the current month
        if(currentlySelectedYear < year){
          console.log("years don't match");
          yearToUse = year;
          monthToUse = month;
          // add year select action
          const SelectYear = SelectYearAction();
          SelectYear.resultPayload = year;
          ActionList.splice(index+1, 0, SelectYear);

          if(currentlySelectedMonth != month){
            // add month select action
            const SelectMonth = SelectMonthAction();
            SelectMonth.checkPayload = yearToUse;
            SelectMonth.resultPayload = monthToUse;
            ActionList.splice(index+2, 0, SelectMonth);

            ActionList[index+3].checkPayload = {year: yearToUse, month: monthToUse};
            ActionList[index+3].resultPayload = true;
          }
          else{
            ActionList[index+2].checkPayload = {year: yearToUse, month: monthToUse};
            ActionList[index+2].resultPayload = true;
          }
        }
        else if(currentlySelectedYear == year
              && currentlySelectedMonth < month){
          yearToUse = year;
          monthToUse = month;
          // add month select action
          console.log("months don't match, but years do");
          const SelectMonth = SelectMonthAction();
          SelectMonth.checkPayload = yearToUse;
          SelectMonth.resultPayload = monthToUse;
          ActionList.splice(index+1, 0, SelectMonth);

          ActionList[index+2].checkPayload = {year:yearToUse, month:monthToUse};
          ActionList[index+2].resultPayload = true;
        }
        else{
          // either we're int he same month/year,
          // or the selected due date is later than today
          console.log("matching month and year, or current ones are ahead of due date");
          yearToUse = currentlySelectedYear;
          monthToUse = currentlySelectedMonth;
          ActionList[index+1].checkPayload = {year:yearToUse, month:monthToUse};
        }
      },
      checkPayload: null,
      resultPayload: null,
      checkInterval: 50,
      maxInterval: 2000,
      note: "Date Determination"
    };
}

function SelectYearAction(){
  let clicked = false;
  return {
    checkFunction: () => {
      if(!clicked){
        const yearMenu = document.querySelector(".xdsoft_year");
        triggerMouseEvent(yearMenu, "mousedown");
        clicked = true;
      }
      return isVisible(".xdsoft_yearselect");
    },
    resultFunction: (year) => {
      const yearSelect = document.querySelector(".xdsoft_yearselect");
      const matchYear = yearSelect.querySelector(`div[data-value='${year}']`);
      triggerMouseEvent(matchYear, "mousedown");
    },
    checkPayload: null,
    resultPayload: null,
    checkInterval: 50,
    maxInterval: 2000,
    note: "Select Year"
  };
}

function SelectMonthAction(){
  let clicked = false;
  return {
    checkFunction: (year) => {
      if(!clicked){
        const monthMenu = document.querySelector(".xdsoft_month");
        triggerMouseEvent(monthMenu, "mousedown");
        clicked = true;
      }
      return DoesSelectedYearMatch(year) && isVisible(".xdsoft_monthselect");
    },
    resultFunction: (month) => {
      const yearSelect = document.querySelector(".xdsoft_monthselect");
      const matchMonth = yearSelect.querySelector(`div[data-value='${month}']`);
      triggerMouseEvent(matchMonth, "mousedown");
    },
    checkPayload: null,
    resultPayload: null,
    checkInterval: 50,
    maxInterval: 2000,
    note: "Select Month"
  };
}

// if we're swicthing anything, we need to be sure to ignore
// the due date marked in the current month
// as it's just an artifact of Yanado at that point

function CalendarTraversalAction(){
  let passedMonth = null;
  return {
    checkFunction: ({year, month}) => {
      // check that the selected month and year values match
      passedMonth = month;
      return DoesSelectedYearMatch(year)
        && DoesSelectedMonthMatch(month);
    },
    resultFunction: (monthSwitched, ActionList, index) => {
      // look for the current date and selected due date
      // I should be able to find at least one of them
      // if I find both, then use the latest

      let AllDates = document.querySelectorAll("div.xdsoft_calendar table tbody tr td");
      let candidateDueDate = null;
      let markedDateIndex = null;
      let daysAfter = 0;
      for(let i = 0; i < AllDates.length; i++){
        const thisDay = AllDates[i];

        if(hasClass(thisDay, "xdsoft_other_month")
          || hasClass(thisDay, "xdsoft_weekend")){
          continue;
        }

        if(hasClass(thisDay, "xdsoft_today")){
          markedDateIndex = i;
          candidateDueDate = null;
          daysAfter = 0;
        }

        if(!monthSwitched && hasClass(thisDay, "xdsoft_current")){
          markedDateIndex = i;
          candidateDueDate = null;
          daysAfter = 0;
        }

        if(i > markedDateIndex){
          daysAfter++;
        }

        // at least two non-weekend days after
        if(markedDateIndex
          && daysAfter >= SNOOZE_INTERVAL
          && !candidateDueDate
          && !hasClass(thisDay, "xdsoft_weekend")){
            candidateDueDate = thisDay;
          }
      }

      if(candidateDueDate){
        // this one seems to be a click
        // rather than a mousedown
        let date = candidateDueDate.getAttribute("data-date");
        candidateDueDate.click();
      }
      else{
        // we need to go to the next month
        const nextMonthButton = document.querySelector("div.xdsoft_datepicker button.xdsoft_next");
        triggerMouseEvent(nextMonthButton, "mousedown");
        triggerMouseEvent(nextMonthButton, "mouseup");
        const NextMonth = NextMonthCalendarAction();
        NextMonth.checkPayload = passedMonth+1;
        // any leftover days we need to step additionally
        NextMonth.resultPayload = SNOOZE_INTERVAL - daysAfter - 1;
        ActionList.splice(index+1, 0, NextMonth);
      }
    },
    checkPayload: null,
    resultPayload: null,
    checkInterval: 50,
    maxInterval: 2000,
    note: "Calendar Traversal"
  };
}

function DoesSelectedMonthMatch(month){
  const monthSelected = document.querySelector("div.xdsoft_monthselect .xdsoft_current");
  if(monthSelected.getAttribute("data-value") == month){
    return true;
  }
  return false;
}

function DoesSelectedYearMatch(year){
  const yearSelected = document.querySelector("div.xdsoft_yearselect .xdsoft_current");
  if(yearSelected.getAttribute("data-value") == year){
    return true;
  }
  return false;
}

function NextMonthCalendarAction(){
  return {
    checkFunction: (monthToMatch) => {
      return DoesSelectedMonthMatch(monthToMatch);
    },
    resultFunction: (daysToAdd) => {
      if(daysToAdd < 0){
        daysToAdd = 0;
      }

      let AllDates = document.querySelectorAll("div.xdsoft_calendar table tbody tr td");
      for(let i = 0; i < AllDates.length; i++){
        // :not('.xdsoft_other_month'):not('.xdsoft_weekend')
        const thisDay = AllDates[i];
        if(hasClass(thisDay, "xdsoft_other_month") || hasClass(thisDay, "xdsoft_weekend")){
          continue;
        }
        if(!daysToAdd && thisDay){
          const dateValue = thisDay.getAttribute("data-date");
          thisDay.click();
          break;
        }
        daysToAdd--;
      }
    },
    checkPayload: null,
    resultPayload: null,
    checkInterval: 50,
    maxInterval: 1000,
    note: "Next Month Calendar Action"
  };
}

function AddSnoozeValueActionAndClose(){
  let input = null;
  return {
    checkFunction: () => {
      // what would I be checking here?
      if(!input){
        input = FindSnoozeInput();
      }

      if(input && isVisibleElement(input)){
        return true;
      }

      return false;
    },
    resultFunction: () => {
      let val = input.value;
      if(!val){
        val = 1;
      }
      else{
        val = Number(val) + 1;
      }
      input.value = val;
      input.focus()
      CloseItem();
    },
    checkPayload: null,
    resultPayload: null,
    checkInterval:50,
    maxInterval:2000,
    note:"Add Snooze Value"
  };
}

function FindSnoozeInput(){
  const findLabels = document.querySelectorAll(".yn-material-input-group label");

  if(findLabels && findLabels.length > 0){
    for(let label of findLabels){
      if(label.innerHTML == SNOOZE_FIELD_NAME){
        const snoozeInput = label.parentNode.querySelector("input[type='number']");
        if(snoozeInput){
          return snoozeInput;
        }
      }
    }
  }

  return null;
}

function CloseItem(){
  // at the end, close the task down
  const closeIcon = document.querySelector("span.yn-fl-close");
  closeIcon.focus();
  setTimeout(() => {
    closeIcon.click();
  }, 100);
}

// so I need to find the input with a
// class of yn-form-field-input
// and [type="number"]
// and sibling label of "SnoozeCount"
//
// OR maybe look for the parent and then loop
//
/*
<div class="yn-material-input-group yn-block">
  <input
  required="" name="NUMBER-9111" type="number" step="any"
  class="yn-material-input yn-no-required yn-form-field-input" yn-autosave="true">
  <span class="yn-bar"></span>
  <label>SnoozeCount</label>
</div>
*/

/*
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
      callback(new Error(`Ran out of time on: ${note}`));
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
*/
