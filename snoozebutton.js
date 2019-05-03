
function snoozescript_init(){
  var checks = 0;
  var checkLimit = 200;
  var checkTime = 20;

  const rollingTransferCheck = function(){
    console.log(`SNOOZE checking for UTILITIES: ${checks} out of ${checkLimit}`);
    try{
      if(UtilitiesLoaded != undefined){
        SetupSnoozeButton();
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

snoozescript_init();

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

  const selector = "li[data-tooltip='Delete this task permanently']";
  const optionListFirstElement = document.querySelector(selector);

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
  else{
    console.log(`can't find list element for snooze: ${selector}`);
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
