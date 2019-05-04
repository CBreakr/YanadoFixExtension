
function toddbuttonscript_init(){
  var checks = 0;
  var checkLimit = 200;
  var checkTime = 20;

  const rollingTransferCheck = function(){
    console.log(`TODD BUTTON checking for UTILITIES: ${checks} out of ${checkLimit}`);
    try{
      if(UtilitiesLoaded != undefined){
        CreateToddButton();
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

toddbuttonscript_init();

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
  console.log("INSIDE CREATE TODD BUTTON");
  RunTimedLoopingCheck(CreateToddButtonAction());
}

//
//
//
function CreateToddButtonAction(){
  return {
    checkFunction:isVisible,
    resultFunction:() => {
      console.log("CREATING TODD BUTTON RESULT");
      const YanadoButton = document.getElementById("yn-top-bar-widget");
      var rect = YanadoButton.getBoundingClientRect();

      const NewButton = document.createElement("button");
      NewButton.innerHTML = "Todd Action";
      NewButton.className = "ToddButton";

      NewButton.style.position="absolute";
      NewButton.style.right = "10%";
      NewButton.style.top = rect.top + 40 + "px";
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
    // ***
    // this has the edge case of not working when
    // there are no tasks currently displayed
    // ... I want to at least wait for a this one here
    const task = document.querySelector("div[yn-type='TASK']");
    return task;
  },
  resultFunction:() => {
    ; // nothing to do in here, we just needed to wait
  },
  failFunction: () => {
    // check if we have a filter in place already
    if(isVisible(".yn-input-search")){
      const input = document.querySelector(".yn-input-search");
      if(input.value){
        return true;
      }
      return false;
    }
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
    // wait for the filter to be done
    const task = document.querySelector("div[yn-type='TASK']");
    return task;
  },
  resultFunction:() => {
    if(!isVisible(".yn-input-search") || isDisabled(".yn-input-search")){
      document.querySelector(".yn-toggle-search-icon").click();
    }
  },
  failFunction: () => {
    // if we're here, then just run the result function
    return true;
  },
  checkPayload:null,
  resultPayload:null,
  checkInterval:50,
  maxInterval:1000,
  note:"question icon click"};
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
