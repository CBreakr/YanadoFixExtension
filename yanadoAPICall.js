
const GET_METHOD = "GET";
const POST_METHOD = "POST";
const PUT_METHOD = "PUT";

const API_KEY = "d2c34c57-3521-47a0-983e-77916347d2c5";

function APICallAsPromise (options) {
  return new Promise(function (resolve, reject) {
    console.log(`API Call: ${options.Method} for ${options.Description}`);

    const xhr = CreateRequest(resolve, reject, options.Description);
    SendRequest(xhr, options);
  });
}

function CreateRequest(resolve, reject, Description){
  const xhr = new XMLHttpRequest();

  xhr.onload = function () {
    if (this.status >= 200 && this.status < 300) {
      console.log(`${Description}: XHR RESPONSE 200`);
      resolve(xhr.response);
    } else {
      console.log(`${Description}: XHR STATUS: ${xhr.status}`);
      reject({
        status: this.status,
        statusText: xhr.statusText
      });
    }
  };

  xhr.onerror = function () {
    console.log(`${Description}: XHR STATUS: ${xhr.status}`);
    reject({
      status: this.status,
      statusText: xhr.statusText
    });
  };

  return xhr;
}

function SendRequest(xhr, options){
  const {URLExtension, Method, params, timeout} = options;

  xhr.timeout = timeout || 10000;

  let URL = `https://api.yanado.com/public-api/${URLExtension}`;

  let body = null;

  if(Method == GET_METHOD && params){
    URL = URL + formatGETParams(params);
  }

  xhr.open(Method, URL, true);

  if((Method == POST_METHOD || Method == PUT_METHOD)
      && params){
    // body = createPOSTPUTParameters(params, xhr);
    body = JSON.stringify(params);
    xhr.setRequestHeader("Content-Type", "application/json");
  }

  xhr.setRequestHeader('X-API-Key', API_KEY);
  xhr.send(body);
}

//
// general method for API call
//
function APICall(URLExtension, Method, params, callback, timeout, Description)
{
  console.log(`API Call: ${Method} for ${Description}`);
  const xhr = new XMLHttpRequest();
  xhr.timeout = timeout || 10000;
  xhr.onload = function() {
    if (xhr.status == 200) {
      console.log(`${Description}: XHR RESPONSE 200`);
      if(callback){
        callback(xhr.response);
      }
    }
    else{
      console.log(`${Description}: XHR STATUS: ${xhr.status}`);
    }
  };
  let URL = `https://api.yanado.com/public-api/${URLExtension}`;

  let body = null;

  if(Method == GET_METHOD && params){
    URL = URL + formatGETParams(params);
  }

  xhr.open(Method, URL, true);

  if((Method == POST_METHOD || Method == PUT_METHOD)
      && params){
    // body = createPOSTPUTParameters(params, xhr);
    body = JSON.stringify(params);
    xhr.setRequestHeader("Content-Type", "application/json");
  }

  xhr.setRequestHeader('X-API-Key', API_KEY);
  xhr.send(body);
}

function formatGETParams(params){
  if(params && Object.keys(params).length != 0){
    return "?" + Object
          .keys(params)
          .map(function(key){
            return key+"="+encodeURIComponent(params[key])
          })
          .join("&");
  }
  else{
    return "";
  }
}

//
//
//
function createPOSTPUTParameters(params, request){
  if(params){
    const data = new FormData();
    for(let key in params){
      data.append(key, params[key]);
    }
  }
  return null;
}

//
//
//
function AppendDueDateToTaskName(task){
  let name = task.name;

  if(task.dueDate){
    let dueDate = task.dueDate.substring(0, task.dueDate.indexOf("T"));
    const year = dueDate.substring(0,4);
    const monthAndDay = dueDate.substring(5);
    dueDate = `${monthAndDay}-${year}`;
    name = `${name} (DD: ${dueDate})`;
    console.log(name);
  }

  return name;
}

const APILoaded = true;
