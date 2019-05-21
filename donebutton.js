
function donebuttonscript_init(){
  var checks = 0;
  var checkLimit = 200;
  var checkTime = 20;

  const rollingTransferCheck = function(){
    console.log(`DONE BUTTON checking for UTILITIES and API: ${checks} out of ${checkLimit}`);
    try{
      if(UtilitiesLoaded != undefined
        && APILoaded != undefined){
        CreateDoneButton();
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

donebuttonscript_init();

//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//
// remove due dates from "Done" tasks
//
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////

const modalData = {};

function ResetModalData(){
  modalData.listTotal = null;
  modalData.listCompleteCount = 0;
  modalData.taskInListTotal = null;
  modalData.taskInListCompleteCount = 0;
  modalData.error = null;
  modalData.haltCommand = false;
  modalData.isTesting = false;
}

function ResetModalTaskData(){
  modalData.taskInListTotal = null;
  modalData.taskInListCompleteCount = 0;
}

let UpdateModalDisplay = null;

//
//
//
function CreateDoneButton() {
  console.log("INSIDE CREATE DONE BUTTON");
  RunTimedLoopingCheck(CreateDoneButtonAction());
}

//
//
//
function CreateDoneButtonAction(){
  return {
    checkFunction:isVisible,
    resultFunction:() => {
      console.log("CREATING DONE BUTTON RESULT");
      const YanadoButton = document.getElementById("yn-top-bar-widget");
      var rect = YanadoButton.getBoundingClientRect();

      const NewButton = document.createElement("button");
      NewButton.innerHTML = "Clear Done";
      NewButton.className = "DoneButton";

      NewButton.style.position="absolute";
      NewButton.style.right = "10%";
      // adding an extra 23 because this needs
      // to go beneath the Todd Button
      NewButton.style.top = rect.top + 40 + 23 + "px";
      NewButton.style.zIndex = "10";

      YanadoButton.parentNode.insertBefore(NewButton, YanadoButton.nextSibling);

      NewButton.addEventListener("click", RemoveDoneDueDates);
    },
    checkPayload:"#yn-top-bar-widget",
    resultPayload:null,
    checkInterval:200,
    maxInterval:15000,
    note:"yanado button check"
  };
}

// OK, well the first thing to do is to run a test:
// taskId 22412431
//
// load task from API
// run PUT on that task
// reload task from APICall
// test that the entries are the same for all but title/dueDate
// if no: halt (and give BIG error, make sure they contact me)
// if yes: update entry back to previous state
//   and then proceed to run for the rest of the tasks

//
// so this thing that's tripping me up is the callback/promise
// structure for all of this...
//


//
//
//
async function RemoveDoneDueDates(event) {
  const result = window.confirm(`Do you want to remove due dates from "Done" tasks.\n\r You should not use Gmail or Yanado while this is processing.`);
  if(result){
    console.log("remove due dates from done tasks");

    ResetModalData();
    CreateModalForm();
    RunDoneAPICalls();
  }
}

//
//
//
async function RunDoneAPICalls(){
  try{
    const workingAsExpected = await TestPUTAPI();
    if(workingAsExpected === true){
      await ProcessDoneTasksInAllLists();
    }
    else{
      // hmm...
      modalData.error = "THE API IS NOT FUNCTIONING AS EXPECTED, PLEASE CONTACT ROB!!";
      UpdateModalDisplay();
    }
  }
  catch(error){
    console.log(`Error: ${error}`);
  }
}

const TEST_API_TASK_ID = "22412431";

//
//
//
async function TestPUTAPI(){

  modalData.isTesting = true;
  UpdateModalDisplay();

  console.log("beginning testing");

  const ret = await InnerAPI_PUT_Test();

  console.log(`done testing: ${ret}`);

  modalData.isTesting = false;
  UpdateModalDisplay();

  return ret;
}

async function InnerAPI_PUT_Test(){
  try{
    options = {
      URLExtension: `tasks/${TEST_API_TASK_ID}`,
      Method: GET_METHOD,
      params: null,
      Description: `GET test API task`
    };

    const initialTask = JSON.parse(await APICallAsPromise(options));

    console.log(initialTask);

    options.Method = PUT_METHOD;
    options.params = {
      "name":"AAA",
      "taskId":"22412431",
      "listId": "project_51450_1550598362429",
      "dueDate":null
    };
    options.Description = "UPDATE test API task";

    const updatedTask = JSON.parse(await APICallAsPromise(options));

    console.log(updatedTask);

    if(CheckTaskObjectUpdateMatch(initialTask, updatedTask)){
      options.params.name = initialTask.name;
      options.params.dueDate = initialTask.dueDate;

      console.log(options);

      const resetTask = await APICallAsPromise(options);
      console.log(resetTask);

      console.log("SUCCESSFUL TEST");

      return true;
    }
    else{
      console.log("object mismatch");
      return false;
    }
  }
  catch(error){
    console.log("Error: ");
    console.log(error);
    return false;
  }
}

function CheckTaskObjectUpdateMatch(first, second){
  var firstKeys = Object.keys(first);
  var secondKeys = Object.keys(second);

  console.log(firstKeys);
  console.log(secondKeys);

  if(firstKeys.length != secondKeys.length){
    console.log(`key length mismatch: ${firstKeys.length} vs ${secondKeys.length}`);
    return false;
  }

  for(let i = 0; i < firstKeys.length; i++){
    // skip these two
    let key = firstKeys[i];
    if(key == "name" || key == "dueDate"){
      continue;
    }

    if(!secondKeys.includes(key)){
      console.log(`missing key at ${key}`);
      return false;
    }
    if(first[key] != second[key]){
      console.log(`key mismatch: ${first[key]} vs ${second[key]}`);
      return false;
    }
  }

  return true;
}

//
//
//
async function ProcessDoneTasksInAllLists(){
  let options = {
    URLExtension: "lists",
    Method: GET_METHOD,
    params: null,
    Description:"GET all lists"
  };

  const response = await APICallAsPromise(options)

  console.log("successful promise");
  // console.log(response);

  const lists = JSON.parse(response);
  console.log(lists);

  modalData.listTotal = lists.length;
  UpdateModalDisplay();

  for(let i = 0; i < lists.length; i++){
    if(modalData.haltCommand){
      console.log("HALT HALT HALT HALT HALT HALT");
      break;
    }

    console.log(`list name: ${lists[i].name}`);

    let listId = lists[i].id;

    options = {
      URLExtension: "tasks",
      Method: GET_METHOD,
      params: {"listId":listId},
      Description: `GET all tasks in list ${listId}`
    };

    const taskResponse = await APICallAsPromise(options);
    if(taskResponse){
      const tasks = JSON.parse(taskResponse);
      console.log(`tasks in list ${listId}: count: ${tasks.length}`);

      modalData.taskInListTotal = tasks.length;
      UpdateModalDisplay();

      for(let j = 0; j < tasks.length; j++){
        let taskId = tasks[j].taskId;
        const task = JSON.parse(await GetIndividualTaskById(taskId));

        console.log(task);

        await RemoveDueDateFromTaskIfDone(task);
        modalData.taskInListCompleteCount++;
        UpdateModalDisplay();
      }

      modalData.listCompleteCount++;
      ResetModalTaskData();
    }
    else{
      console.log(`no response for list: ${listId}`);
    }
  }

  // final update
  UpdateModalDisplay();
}

async function GetIndividualTaskById(taskId){
  const options = {
    URLExtension: `tasks/${taskId}`,
    Method: GET_METHOD,
    params: null,
    Description: `GET task to check ${taskId}`
  };

  return await APICallAsPromise(options);
}

const statusDoneName = "Done"; // statusName

//
//
//
async function RemoveDueDateFromTaskIfDone(task){
  try{
    console.log(`Remove Due Date: ${task.name}, with ${task.statusName}, at ${task.dueDate}`);

    if(task.statusName == statusDoneName && task.dueDate){
      const data = {
        "name":AppendDueDateToTaskName(task),
        "taskId":task.taskId,
        "listId": task.listId,
        "dueDate":null
      };

      const options = {
        URLExtension: `tasks/${data.taskId}`,
        Method: PUT_METHOD,
        params: data,
        Description: `UPDATE done task with due date`
      };

      const updatedTask = await APICallAsPromise(options);
    }
    else{
      console.log(`No due date needed: ${task.statusName} ${dueDate}`);
    }
  }
  catch(error){
    console.log(`error in done task: ${error}`);
  }
}

/*
STEPS:
Fetching Lists
<for each list, serially ==> show done/count>
Fetching Tasks in List
<for each task, serially ==> show done/count, independent of Lists>
Processing Task
*/

function CreateModalForm(){

  const modalDiv = document.createElement("div");
  modalDiv.classList.add("modal");

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.appendChild(document.createTextNode("Close"));
  closeButton.classList.add("CloseButton");
  modalDiv.appendChild(closeButton);

  const hr = document.createElement("hr");
  modalDiv.appendChild(hr);

  const displayDiv = document.createElement("div");
  modalDiv.appendChild(displayDiv);

  closeButton.addEventListener("click", (event) => {
    modalDiv.remove();
    modalData.haltCommand = true;
  });

  document.body.appendChild(modalDiv);

  UpdateModalDisplay = () => {
    /*
    modalData.listTotal = null;
    modalData.listCompleteCount = 0;
    modalData.taskInListTotal = null;
    modalData.taskInListCompleteCount = 0;
    */
    // use the modalData to update the form

    let display = "";

    if(modalData.isTesting){
      display = "<br />Testing API, please wait a momemt<hr />";
    }
    else{
      display = `<br />&nbsp;&nbsp;Completed: ${modalData.listCompleteCount} LISTS out of ${modalData.listTotal}`;

      if(modalData.error){
        display += `<br /><br />&nbsp;&nbsp;We have an error, please try again at a later time: <br />&nbsp;&nbsp;${modalData.error}<br /><hr /><br />`;
      }
      else if(modalData.listTotal == modalData.listCompleteCount){
        display += "<br /><br />&nbsp;&nbsp;PROCESSING IS FINISHED<br /><br />";
      }
      else{
        display += `<br /><br />&nbsp;&nbsp;Completed: ${modalData.taskInListCompleteCount} TASKS out of ${modalData.taskInListTotal} in current list<br />`;
      }
    }

    displayDiv.innerHTML = display;
  }
}
