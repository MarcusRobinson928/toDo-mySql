$(document).ready(function() {
    
    var $newItemInput = $('#todo');
    var $todoContainer = $('#todoList');
    
    $(document).on('keypress', '#todo', insertTodo);
    $(document).on('click', '#circle', completed);
    $(document).on('click', '#remove', deleteTodo);
    $(document).on('click', '#todo-item', editTodo);
    $(document).on('keyup', '.edit', finishEdit);
    $(document).on('blur', '.edit', cancelEdit);

    function getDate() {
      var d = new Date();
      var days = ['Sun', 'Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat'];
      var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
      document.getElementById('day').innerHTML = days[d.getDay()]
      document.getElementById('date').innerHTML = months[d.getMonth()] + '  ' + d.getDate() + `<br>` + d.getFullYear();
      }
  
    var todos = [];
  
    getTodos();
    getDate()

    function newTodo(todo) {
      var $newInputRow = $(
        [
          "<li id='todo-item'>",
          '<span>',
          todo.text,
          '</span>',
          '</li>',
          "<div id='buttons'><button id='circle' class='far fa-circle'></button></div>",
          "<input type='text' class='edit' style='display: none;'>",
        ].join('')
      );
      console.log($newInputRow.find('span').data())
      $newInputRow.find('#circle').data('id', todo.id);
      $newInputRow.find('input.edit').css('display', 'none');
      $newInputRow.data('todo', todo);
      if (todo.complete) {
        $newInputRow.find('span').css('text-decoration', 'line-through');
      }
      return $newInputRow;
    }
  
    function createList() {
      $todoContainer.empty();
      var rowsToAdd = [];
      for (var i = 0; i < todos.length; i++) {
        rowsToAdd.push(newTodo(todos[i]));
      }
      $todoContainer.prepend(rowsToAdd);
    }
  
    function getTodos() {
      $.get('/todos', function(data) {
        todos = data;
        createList();
      });
    }

  function insertTodo(event) {
    if (event.which === 13) {
      event.preventDefault();
      todo = {
        text: $('#todo').val(),
        complete: false
      }
      if (todo.text === '') {
          alert('Must Enter A ToDo')
      } else {
        $.post('/todos', todo, getTodos);
        $newItemInput.val('');
      }
  }
  }

  function editTodo() {
    var currentTodo = $(this).data('todo');
    console.log($(this).parent().children('span'))         
    $(this).parent().children().hide();
    $(this).parent().children('input.edit').val(currentTodo.text)
    $(this).parent().children('input.edit').show();
    $(this).parent().children('input.edit').focus();
  }

  function cancelEdit() {
    var currentTodo = $(this).data('todo');
    console.log(currentTodo)
    if (currentTodo) {
      $(this).parent().children().hide();
      $(this).parent().children('input.edit').val(currentTodo.text);
      console.log($(this).parent().children('input.edit'))
      $(this).parent().children('span').children().show();
      $(this).parent().children().children().show();
    }
  }

  function finishEdit(event) {
    var updatedTodo = $(this).data('todo');
    if (event.which === 13) {
      updatedTodo.text = $(this).parent().children('input').val();
      $(this).blur();
      updateTodo(updatedTodo);
    }
  }

  function updateTodo(todo) {
    $.ajax({
      method: 'PUT',
      url: '/todos',
      data: todo
    }).then(getTodos);
  }

  function completed() {
    var todo = $(this).parent().data('todo');
    var currentTodo = $(this).parent().parent().children().data()
    console.log(todo)
    todo.complete = !todo.complete;
    $.ajax({
      method: 'PUT',
      url: '/todos',
      data: todo
    }).then(
    $('button').remove('#circle'),
    $('#buttons').html(`<button id='remove' class='far fa-times-circle'></button>`),
    $('#todo-item').toggleClass('complete'),
    getTodos()
)}
  
  function deleteTodo(event) {
    event.stopPropagation();
    var id = $(this).parent().parent().children().data().todo.id;
      $.ajax({
        method: 'DELETE',
        url: '/todos/' + id
      }).then(getTodos);
    }
  });