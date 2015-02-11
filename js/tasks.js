// constants
var addTaskLinkText = "+ Add task";
var addTaskText = "Input task text here";
var addTaskSaveText = "Save";
var addTaskCancelText = "Cancel";

// button icons
var inactiveIcon = "img/del-inactive.png";
var activeIcon = "img/del-active.png";

$(document).ready(function() {
  $.ajax({
    type : "GET",
    url : "/get",
    success : function(response) {
      var tasks = response.tasks;
      for (var i = 0; i < tasks.length; i++) { createTask(tasks[i]); }
    }
  });

  /* add handlers */

  // 'add task' link
  $("#add-task-link").text(addTaskLinkText).click(function() { toggleAddTaskFormAndLink(); });

  // add task 'text' control
  resetAddTaskText();
  $("#add-task-text").click(function() { $(this).val() == addTaskText ? $(this).val("") : "" });
  
  $("#add-task-save-btn").text(addTaskSaveText).click(function() {
    var taskText = $("#add-task-text").val();
    $.ajax({
      type : "POST",
      url : "/add",
      data : { "tasktext" : taskText },
      success : function(response) {
        toggleAddTaskFormAndLink();
        resetAddTaskText();
        createTask(task(response.taskid, taskText, 0));
        // add task to ul with db-generated id
      }});
  });

  // add task 'cancel' button
  $("#add-task-cancel-btn").text(addTaskCancelText).click(function() {
    toggleAddTaskFormAndLink(); resetAddTaskText();
  });});

/* helper functions */
function createTask(task) {
  var taskIdText = "task" + task.id;
  var taskCheckbox = $("<input />").attr({
    "id" : taskIdText + "-checkbox",
    "type" : "checkbox",
    "checked" : task.status == "true" ? true : false
  }).prop("disabled", task.status == "true" ? true : false).addClass("task-ctrl");
  taskCheckbox.click(function() {
    // update handler
    var checkbox = $(this);
    $.ajax({
      type : "POST",
      url : "/upd",
      data : {
        "taskid" : task.id,
      },
      success : function(response) {
        // do stuff
        checkbox.prop("disabled", true);
      },
      error : function(response){
        checkbox.prop("checked", checkbox.is(":checked") ? false : true);
      }});
  });
  
  var taskText = $("<span />").attr("id", taskIdText + "-text").addClass("task-ctrl task-span").text(task.text);
  var taskBtn = $("<button />").attr("id", taskIdText + "-del").addClass("task-ctrl").append($("<img>").attr("src", inactiveIcon));
  taskBtn.hover(function() { $(this).children().attr("src", activeIcon); }, function() { $(this).children().attr("src", inactiveIcon); } );
  taskBtn.click(function() {
    // delete handler
    var taskId = $(this).attr("id").replace("task", "").replace("-del", "");
    $.ajax({
      type : "POST",
      url : "/del",
      data : { "taskid" : taskId },
      success : function(response) { $("#task-" + taskId).remove(); }});
  });

  $("#tasks-ul").append($("<li />").addClass("task-li").attr("id", "task-" + task.id).append(taskCheckbox, taskText, taskBtn));        
}

// task constructor
function task(id, text, status) {
  return { id : id, text : text, status: status };
}

function toggleAddTaskFormAndLink() {
  $("#add-task-form").toggle();
  $("#add-task-link").toggle();
}

function resetAddTaskText() {
  $("#add-task-text").val(addTaskText);
}