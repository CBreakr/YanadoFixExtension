
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
function SetupSnoozeButton(){
// <span class="yn-overflow yn-icon"></span>

  // add an event listener to the page,
  // looking for the div yn-type="TASK"

  document.addEventListener("click", (event) => {
    const element = event.target;
    if(element.matches("span.yn-overflow")){
      console.log("we have an overflow icon");
      RunTimedLoopingCheck(CreateSnoozeOptionAction());
    }
  }, false);
}

function CreateSnoozeOptionAction(){
  return {
    checkFunction: () => {
      const optionListFirstElement = document.querySelector("li[data-tooltip='Save task as template']");
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
      // at the end, close the task down
      const closeIcon = document.querySelector("span.yn-fl-close");
      closeIcon.click();
    });
    optionList.appendChild(listItem);
  }

  /*
  MAJOR CHANGE!!!!!!

  - I need to find the latest of the due date and the current date
    and then use that as the launching point for the snooze,
    rather than just using the due date
  - this comes with an issue of the months in the custom display:
    if the due date is in a previous month, it will show that month
  - so I'll have to check if the due date is in a different month
    than the curent date and act accordingly
      - if it's behind, then it doesn't matter
      - if it's ahead, I need to step ahead that many forward
      - if it's in the same month, then I need to find which is later
      ==> when I have the latest date, I can move on with the rest
  */

  //
  // - click due date link (check date link visible; click link)
  // - click "Custom" option from dropdown (check CUstom option visible; click option)
  // - loop through table: (calendar visible; begin loop)
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
  //    - See below
  //

  // so it looks like I need to find the label with the matching field value
  // inside of a div with yn-form-field-type="NUMBER"
  // and then find the sibling input
  // and set the value there to be value + 1
  /*
  <div class="yn-task-form-field-item yn-floating-div-bubble" yn-form-field-id="9111" yn-form-field-type="NUMBER">
    <div class="yn-material-input-group yn-block">
      <input required="" value="15" name="NUMBER-9111" type="number" step="any" class="yn-material-input yn-no-required yn-form-field-input" yn-autosave="true">

      <span class="yn-bar"></span>
      <label>TestNumber</label>
    </div>
    <i class="yn-form-field-loading yn-ficon-spin animate-spin yn-loading-show"></i>
  </div>
  */

  // in the calendar
  // looking for class xdsoft_current
  // avoid class xdsoft_other_month
}

function RunSnooze(){
  console.log("SNOOZING!");
  const Actions = [];

  Actions.push(ClickDueDateAction());
  Actions.push(ClickCustomDueDateAction());
  Actions.push(DateDeterminationAction())
  Actions.push(CalendarTraversalAction());
  // Actions.push(AddSnoozeValueActionAndClose());

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

/*
<div class="xdsoft_label xdsoft_month">
  <span>April</span>
  <div class="xdsoft_select xdsoft_monthselect xdsoft_scroller_box">
    <div style="margin-top: 0px;">
      <div class="xdsoft_option " data-value="0">January</div>
      <div class="xdsoft_option " data-value="1">February</div>
      <div class="xdsoft_option " data-value="2">March</div>
      <div class="xdsoft_option xdsoft_current" data-value="3">April</div>
      <div class="xdsoft_option " data-value="4">May</div>
      <div class="xdsoft_option " data-value="5">June</div>
      <div class="xdsoft_option " data-value="6">July</div>
      <div class="xdsoft_option " data-value="7">August</div>
      <div class="xdsoft_option " data-value="8">September</div>
      <div class="xdsoft_option " data-value="9">October</div>
      <div class="xdsoft_option " data-value="10">November</div>
      <div class="xdsoft_option " data-value="11">December</div>
    </div>
    <div class="xdsoft_scrollbar">
      <div class="xdsoft_scroller" style="display: block; height: 10px; margin-top: 0px;">
      </div>
    </div>
  </div>
</div>

<div class="xdsoft_label xdsoft_year">
  <span>2019</span>
  <div class="xdsoft_select xdsoft_yearselect xdsoft_scroller_box" style="display: block;">
  <div style="margin-top: -1656px;">
  <div class="xdsoft_option " data-value="1950">1950</div>
  <div class="xdsoft_option " data-value="1951">1951</div><div class="xdsoft_option " data-value="1952">1952</div><div class="xdsoft_option " data-value="1953">1953</div><div class="xdsoft_option " data-value="1954">1954</div><div class="xdsoft_option " data-value="1955">1955</div><div class="xdsoft_option " data-value="1956">1956</div><div class="xdsoft_option " data-value="1957">1957</div><div class="xdsoft_option " data-value="1958">1958</div><div class="xdsoft_option " data-value="1959">1959</div><div class="xdsoft_option " data-value="1960">1960</div><div class="xdsoft_option " data-value="1961">1961</div><div class="xdsoft_option " data-value="1962">1962</div><div class="xdsoft_option " data-value="1963">1963</div><div class="xdsoft_option " data-value="1964">1964</div><div class="xdsoft_option " data-value="1965">1965</div><div class="xdsoft_option " data-value="1966">1966</div><div class="xdsoft_option " data-value="1967">1967</div><div class="xdsoft_option " data-value="1968">1968</div><div class="xdsoft_option " data-value="1969">1969</div><div class="xdsoft_option " data-value="1970">1970</div><div class="xdsoft_option " data-value="1971">1971</div><div class="xdsoft_option " data-value="1972">1972</div><div class="xdsoft_option " data-value="1973">1973</div><div class="xdsoft_option " data-value="1974">1974</div><div class="xdsoft_option " data-value="1975">1975</div><div class="xdsoft_option " data-value="1976">1976</div><div class="xdsoft_option " data-value="1977">1977</div><div class="xdsoft_option " data-value="1978">1978</div><div class="xdsoft_option " data-value="1979">1979</div><div class="xdsoft_option " data-value="1980">1980</div><div class="xdsoft_option " data-value="1981">1981</div><div class="xdsoft_option " data-value="1982">1982</div><div class="xdsoft_option " data-value="1983">1983</div><div class="xdsoft_option " data-value="1984">1984</div><div class="xdsoft_option " data-value="1985">1985</div><div class="xdsoft_option " data-value="1986">1986</div><div class="xdsoft_option " data-value="1987">1987</div><div class="xdsoft_option " data-value="1988">1988</div><div class="xdsoft_option " data-value="1989">1989</div><div class="xdsoft_option " data-value="1990">1990</div><div class="xdsoft_option " data-value="1991">1991</div><div class="xdsoft_option " data-value="1992">1992</div><div class="xdsoft_option " data-value="1993">1993</div><div class="xdsoft_option " data-value="1994">1994</div><div class="xdsoft_option " data-value="1995">1995</div><div class="xdsoft_option " data-value="1996">1996</div><div class="xdsoft_option " data-value="1997">1997</div><div class="xdsoft_option " data-value="1998">1998</div><div class="xdsoft_option " data-value="1999">1999</div><div class="xdsoft_option " data-value="2000">2000</div><div class="xdsoft_option " data-value="2001">2001</div><div class="xdsoft_option " data-value="2002">2002</div><div class="xdsoft_option " data-value="2003">2003</div><div class="xdsoft_option " data-value="2004">2004</div><div class="xdsoft_option " data-value="2005">2005</div><div class="xdsoft_option " data-value="2006">2006</div><div class="xdsoft_option " data-value="2007">2007</div><div class="xdsoft_option " data-value="2008">2008</div><div class="xdsoft_option " data-value="2009">2009</div><div class="xdsoft_option " data-value="2010">2010</div><div class="xdsoft_option " data-value="2011">2011</div><div class="xdsoft_option " data-value="2012">2012</div><div class="xdsoft_option " data-value="2013">2013</div><div class="xdsoft_option " data-value="2014">2014</div><div class="xdsoft_option " data-value="2015">2015</div><div class="xdsoft_option " data-value="2016">2016</div><div class="xdsoft_option " data-value="2017">2017</div><div class="xdsoft_option " data-value="2018">2018</div><div class="xdsoft_option xdsoft_current" data-value="2019">2019</div><div class="xdsoft_option " data-value="2020">2020</div><div class="xdsoft_option " data-value="2021">2021</div><div class="xdsoft_option " data-value="2022">2022</div><div class="xdsoft_option " data-value="2023">2023</div><div class="xdsoft_option " data-value="2024">2024</div><div class="xdsoft_option " data-value="2025">2025</div><div class="xdsoft_option " data-value="2026">2026</div><div class="xdsoft_option " data-value="2027">2027</div><div class="xdsoft_option " data-value="2028">2028</div><div class="xdsoft_option " data-value="2029">2029</div><div class="xdsoft_option " data-value="2030">2030</div><div class="xdsoft_option " data-value="2031">2031</div><div class="xdsoft_option " data-value="2032">2032</div><div class="xdsoft_option " data-value="2033">2033</div><div class="xdsoft_option " data-value="2034">2034</div><div class="xdsoft_option " data-value="2035">2035</div><div class="xdsoft_option " data-value="2036">2036</div><div class="xdsoft_option " data-value="2037">2037</div><div class="xdsoft_option " data-value="2038">2038</div><div class="xdsoft_option " data-value="2039">2039</div><div class="xdsoft_option " data-value="2040">2040</div><div class="xdsoft_option " data-value="2041">2041</div><div class="xdsoft_option " data-value="2042">2042</div><div class="xdsoft_option " data-value="2043">2043</div><div class="xdsoft_option " data-value="2044">2044</div><div class="xdsoft_option " data-value="2045">2045</div><div class="xdsoft_option " data-value="2046">2046</div><div class="xdsoft_option " data-value="2047">2047</div><div class="xdsoft_option " data-value="2048">2048</div><div class="xdsoft_option " data-value="2049">2049</div><div class="xdsoft_option " data-value="2050">2050</div></div><div class="xdsoft_scrollbar"><div class="xdsoft_scroller" style="display: block; height: 10px; margin-top: 109.717px;"></div></div></div>
</div>
*/

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
          yearToUse = year;
          monthToUse = month;
          // add year select action
          console.log("year less than current");
          const SelectYear = SelectYearAction();
          SelectYear.resultPayload = year;
          ActionList.splice(index, 0, SelectYear);

          ListOutActions(ActionList, index);

          if(currentlySelectedMonth != month){
            // add month select action
            const SelectMonth = SelectMonthAction();
            SelectMonth.checkPayload = yearToUse;
            SelectMonth.resultPayload = monthToUse;
            ActionList.splice(index+1, 0, SelectMonth);

            ListOutActions(ActionList, index);

            ActionList[index+2].checkPayload = {year: yearToUse, month: monthToUse};
            console.log(`altered check payload: ${ActionList[index+1].note}`);
          }
          else{
            ActionList[index+1].checkPayload = {year: yearToUse, month: monthToUse};
            console.log(`altered check payload: ${ActionList[index+2].note}`);
          }
        }
        else if(currentlySelectedYear == year
              && currentlySelectedMonth < month){
          yearToUse = year;
          monthToUse = month;
          // add month select action
          console.log("month less than current");
          const SelectMonth = SelectMonthAction();
          SelectMonth.checkPayload = yearToUse;
          SelectMonth.resultPayload = monthToUse;
          ActionList.splice(index, 0, SelectMonth);

          ListOutActions(ActionList, index);

          ActionList[index+1].checkPayload = {year:yearToUse, month:monthToUse};
          console.log(`altered check payload: ${ActionList[index+1].note}`);
        }
        else{
          // either we're int he same month/year,
          // or the selected due date is later than today
          yearToUse = currentlySelectedYear;
          monthToUse = currentlySelectedMonth;

          ListOutActions(ActionList, index);

          ActionList[index+1].checkPayload = {year:yearToUse, month:monthToUse};
          console.log("after setting checkPayload");
          // console.log(`altered check payload: ${ActionList[index+1].note}`);
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
      if(matchYear){
        console.log(`MATCH FOUND FOR YEAR: ${year}`);
      }
      else{
        console.log(`NO MATCH YEAR FOR ${year}`);
      }
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

function CalendarTraversalAction(){
  return {
    checkFunction: ({year, month}) => {
      // check that the selected month and year values match
      return DoesSelectedYearMatch(year)
        && DoesSelectedMonthMatch(month);
    },
    resultFunction: () => {
      // look for the current date and selected due date
      // I should be able to find at least one of them
      // if I find both, then use the latest

      console.log("calendar traversal is hard!!!!!");
    },
    checkPayload: null,
    resultPayload: null,
    checkInterval: 50,
    maxInterval: 2000,
    note: "Calendar Traversal"
  };
}

function ListOutActions(ActionList, index){
  for(let i = 0; i < ActionList.length; i++){
    console.log(`Action at ${i}: ${ActionList[i].note}, current index: ${index}`);
  }
}

function DoesSelectedMonthMatch(month){
  return true;
}

function DoesSelectedYearMatch(year){
  return true;
}

// function NextMonthCalendarAction(){
//   return {
//     checkFunction,
//     resultFunction,
//     checkPayload,
//     resultPayload,
//     checkInterval,
//     maxInterval,
//     note
//   };
// }
//
// function AddSnoozeValueActionAndClose(){
//   return {
//     checkFunction,
//     resultFunction,
//     checkPayload,
//     resultPayload,
//     checkInterval,
//     maxInterval,
//     note
//   }';'
// }

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
        RunTimedLoopingCheck(Actions[index++], index, Actions, callback);
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
  index,
  ActionList,
  callback) {

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
