RunSetup();

function RunSetup(){
  document.querySelector('body').addEventListener('click', function (event) {
    if (event.target.classList.contains('yn-group-kanban-view-name')
	|| event.target.classList.contains('yn-group-list-view-name')
	|| event.target.classList.contains('yn-group-card-view-name')
    ) {
	let content = event.target.innerHTML;
	let groupId = event.target.getAttribute("yn-group-id");
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
  let projects = document.querySelectorAll(".projectName");
  if(projects != null){
    let index;
    for(index = 0; index < projects.length; index++){
	let value = projects[index].innerHTML;
	if(value === name){	  
	  projects[index].click();
	  break;
	}
    }
  }
}