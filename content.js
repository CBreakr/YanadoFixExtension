
AddScriptToPage("utilities.js");
AddScriptToPage("yanadoAPICall.js");
AddScriptToPage("headerclick.js");
AddScriptToPage("toddbutton.js");
AddScriptToPage("snoozebutton.js");
AddScriptToPage("donebutton.js");

function AddScriptToPage(filename){
  var source = document.createElement('script');
  // TODO: add "script.js" to web_accessible_resources in manifest.json
  source.src = chrome.extension.getURL(filename);
  source.onload = function() {
      this.remove();
  };
  (document.head || document.documentElement).appendChild(source);

  console.log(`script added: ${filename}`);
}
