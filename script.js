RunSetup();

function RunSetup(){
  document.querySelector('body').addEventListener('click', function (event) {
    if (event.target.classList.contains('yn-group-kanban-view-name')
	|| event.target.classList.contains('yn-group-list-view-name')
	|| event.target.classList.contains('yn-group-card-view-name')
    ) {
	var content = event.target.innerHTML;
	var groupId = event.target.getAttribute("yn-group-id");
	if(groupId == null || groupId.indexOf("project") !== -1){
	  FindMatchAndClick(content);
	}
	else{
	//  alert("not a project name");
	}
    }
  });
}

function FindMatchAndClick(name){
  var projects = document.querySelectorAll(".projectName");
  if(projects != null){
    var index;
    for(index = 0; index < projects.length; index++){
	var value = projects[index].innerHTML;
	if(value === name){
	  projects[index].click();
	  break;
	}
    }
  }
}