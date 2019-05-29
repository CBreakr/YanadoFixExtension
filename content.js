
AddScriptToPage("utilities.js");
AddScriptToPage("yanadoAPICall.js");
AddScriptToPage("features/headerclick.js");
AddScriptToPage("features/toddbutton.js");
AddScriptToPage("features/snoozebutton.js");
AddScriptToPage("features/donebutton.js");
AddScriptToPage("features/marksentbutton.js");
AddScriptToPage("features/archive_subtask_hover.js");

function AddScriptToPage(filename){
  var source = document.createElement('script');
  // TODO: add "script.js" to web_accessible_resources in manifest.json
  source.src = chrome.runtime.getURL(filename);
  source.onload = function() {
      this.remove();
  };
  (document.head || document.documentElement).appendChild(source);

  console.log(`script added: ${filename}`);
}
