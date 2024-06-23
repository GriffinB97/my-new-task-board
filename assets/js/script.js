// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Generate a unique task id
function generateTaskId() {
  return nextId++;
}

// Save the task list and nextId to localStorage
function saveToLocalStorage() {
  localStorage.setItem('tasks', JSON.stringify(taskList));
  localStorage.setItem('nextId', JSON.stringify(nextId));
}

// Create a task card
function createTaskCard(task) {
  let taskCard = $('<div>')
    .addClass('task-card')
    .attr('data-id', task.id)
    .attr('data-status', task.status)
    .append(
      $('<h3>').text(task.title),
      $('<p>').text(task.description),
      $('<p>').text(`Due: ${task.dueDate}`),
      $('<span>').addClass('task-delete').html('<i class="fas fa-trash"></i>')
    );

  // Color coding based on deadline
  let now = dayjs();
  let dueDate = dayjs(task.dueDate);
  if (dueDate.isBefore(now, 'day')) {
    taskCard.addClass('overdue');
  } else if (dueDate.isSameOrBefore(now.add(2, 'day'), 'day')) {
    taskCard.addClass('near-deadline');
  }

  return taskCard;
}

// Render the task list and make cards draggable
function renderTaskList() {
  $('#todo-cards, #in-progress-cards, #done-cards').empty();

  taskList.forEach(task => {
    let card = createTaskCard(task);
    $(`#${task.status}-cards`).append(card);
  });

  $('.task-card').draggable({
    revert: 'invalid',
    helper: 'clone'
  });
}

// Handle adding a new task
function handleAddTask(event) {
  event.preventDefault();

  let title = $('#taskTitle').val();
  let description = $('#taskDescription').val();
  let dueDate = $('#taskDueDate').val();

  if (!title || !description || !dueDate) return;

  let newTask = {
    id: generateTaskId(),
    title,
    description,
    dueDate,
    status: 'to-do'
  };

  taskList.push(newTask);
  saveToLocalStorage();

  renderTaskList();
  $('#formModal').modal('hide');
  $('#taskForm')[0].reset();
}

// Handle deleting a task
function handleDeleteTask(event) {
  let taskId = $(event.target).closest('.task-card').data('id');
  taskList = taskList.filter(task => task.id !== taskId);
  saveToLocalStorage();

  renderTaskList();
}

// Handle dropping a task into a new status lane
function handleDrop(event, ui) {
  let taskId = ui.draggable.data('id');
  let newStatus = $(event.target).closest('.lane').attr('id').split('-')[0];

  let task = taskList.find(task => task.id === taskId);
  task.status = newStatus;
  saveToLocalStorage();

  renderTaskList();
}

$(document).ready(function () {
  // Render the task list on page load
  renderTaskList();

  // Add event listeners
  $('#taskForm').on('submit', handleAddTask);
  $(document).on('click', '.task-delete', handleDeleteTask);

  // Make lanes droppable
  $('.lane').droppable({
    accept: '.task-card',
    drop: handleDrop
  });

  // Make the due date field a date picker
  $('#taskDueDate').datepicker({ dateFormat: 'yy-mm-dd' });
});
