
function marksentbuttonscript_init(){
  var checks = 0;
  var checkLimit = 200;
  var checkTime = 20;

  const rollingTransferCheck = function(){
    console.log(`MARK SENT BUTTON checking for UTILITIES and API: ${checks} out of ${checkLimit}`);
    try{
      if(UtilitiesLoaded != undefined
        && APILoaded != undefined){
        SetupMarkSentButton();
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

marksentbuttonscript_init();

//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//
// change "sent" date to today
// change task to "Done"
// run the Done API call
//
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////

//
//
//
function SetupMarkSentButton(){
  document.addEventListener("click", (event) => {
    const element = event.target;
    if(element.matches("span.yn-overflow")){
      RunTimedLoopingCheck(CreateMarkSentOptionAction());
    }
  }, false);
}

//
//
//
function CreateMarkSentOptionAction(){
  return {
    checkFunction: () => {
      const optionListFirstElement = document.querySelector("li[data-tooltip='Delete this task permanently']");
      return optionListFirstElement;
    },
    resultFunction: CreateMarkSentOption,
    checkPayload: null,
    resultPayload: null,
    checkInterval: 20,
    maxInterval: 400,
    note: "Create Mark As Sent Option Action"
  };
}

//
//
//
function CreateMarkSentOption(){

  console.log("Creating mark sent!");

  const selector = "li[data-tooltip='Delete this task permanently']";
  const optionListFirstElement = document.querySelector(selector);

  if(optionListFirstElement){
    const optionList = optionListFirstElement.parentElement;
    let listItem = document.createElement('li');
    listItem.className = "yn-task-oo-li";
    listItem.setAttribute("role", "presentation");
    listItem.appendChild(document.createTextNode("Mark as Sent"));
    listItem.addEventListener("click", (event) => {
      RunMarkSent();
    });
    optionList.appendChild(listItem);
  }
  else{
    console.log(`can't find list element for mark sent: ${selector}`);
  }
}

//
//
//
function RunMarkSent(){
  console.log("MARKING SENT!");
  const Actions = [];

  const currentDate = GetDashedCurrentDate();
  let sentDate = null;

  let count = 0;
  let valid = false;
  let message = "Enter sent date (YYYY-MM-DD)";

  while(!valid && count++ < 3){
    sentDate = prompt(message, currentDate);
    valid = isStringValidDashedDate(sentDate);
    if(count == 1){
      message = "[INVALID] " + message;
    }
  }

  if(!valid){
    CloseCurrentTask();
    alert("please try again later");
    return;
  }

  Actions.push(RunMarkSentAPICallAction(addEmptyTimestampToDate(sentDate)));

  RunActions(Actions);
}

//
//
//
function RunMarkSentAPICallAction(sentDate){
  return {
    checkFunction: () => {
      return true;
    },
    resultFunction: async () => {
      try{
        const taskId = GetTaskId();
        CloseCurrentTask();
        const task = await GetTaskFromAPICall(taskId);
        const doneStatusId = await GetDoneStatusCodeFromAPICall(task.listId);
        await MarkAsSentAPICall(task, doneStatusId, sentDate);
      }
      catch(err){
        alert(`error on Mark Sent: ${err}`);
      }
    },
    checkPayload: null,
    resultPayload: null,
    checkInterval: 20,
    maxInterval: 500,
    note: "Run Mark Sent API Action"
  };
}

//
//
//
function GetTaskId(){
  const taskDiv = document.querySelector("div.yanado-holder-replace");
  const divId = taskDiv.getAttribute("id");
  console.log(divId);
  const id = divId.substring(divId.lastIndexOf("-")+1);
  console.log(`task id: ${id}`);
  return id;
}

//
//
//
async function GetTaskFromAPICall(taskId){
  if(!taskId){
      throw new Error("no task Id supplied");
  }

  options = {
    URLExtension: `tasks/${taskId}`,
    Method: GET_METHOD,
    params: null,
    Description: `GET test API task`
  };

  const response = await APICallAsPromise(options);
  const task = JSON.parse(response);
  return task;
}

//
//
//
async function GetDoneStatusCodeFromAPICall(listId){
  const options = {
    URLExtension: `lists/${listId}/statuses`,
    Method: GET_METHOD,
    params: null,
    Description: `GET status list for ${listId}`
  };

  const response = await APICallAsPromise(options);
  const statusList = JSON.parse(response);

  console.log(statusList);

  for(let status of statusList){
    if(status.name == "Done"){
      console.log("found the Done status");
      return status.id;
    }
  }

  return null;
}

//
//
//
async function MarkAsSentAPICall(task, doneStatusId, sentDate){
    const sentPropName = GetSentPropName(task);

    console.log(task);

    const options = {
      URLExtension: `tasks/${task.taskId}`,
      Method: PUT_METHOD,
      params: {
        "name":AppendDueDateToTaskName(task),
        "taskId":task.taskId,
        "listId": task.listId,
        "dueDate":null
      },
      Description: `PUT Mark Sent API task`
    };

    console.log("initial options set");

    options.params[sentPropName] = sentDate;

    if(task.statusId != doneStatusId){
      options.params.statusId = doneStatusId;
    }

    console.log(options.params);
    const response = await APICallAsPromise(options);
}

//
//
//
function GetSentPropName(task){
  for(let prop in task){
    if(prop.indexOf("sent") > -1){
      return prop;
    }
  }

  return null;
}
