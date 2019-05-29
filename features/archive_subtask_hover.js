
const tooltipReplacementText = "Complete";
const subtaskClass = ".yn-subtask-finish-cb";

SetupHoverCheck();

function SetupHoverCheck(){
  document.addEventListener("mouseover", (event) => {
    const element = event.target;
    if(element.matches(subtaskClass)){
      console.log("we have the subtask");
      ChangeTooltip(element);
    }
  })
}

function ChangeTooltip(element){
  element.setAttribute("data-tooltip", tooltipReplacementText);
}
