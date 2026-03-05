// 백엔드 API 주소 ( .env 의 API_BASE → node generate-config.js 로 config.js 생성 후 사용 )
const API_BASE =
  (typeof window !== "undefined" && window.__ENV?.API_BASE) || "";

if (!API_BASE) throw new Error("API_BASE missing");

console.log("[APP_FINGERPRINT]", "JS_PATH:", "C:\\Users\\admin\\Desktop\\vibe-coding\\todo\\todo-firebase\\app.js", "TIME:", new Date().toISOString());
console.log("[APP_FINGERPRINT]", "location.href:", location.href);
console.log("[APP_FINGERPRINT]", "localStorage keys:", Object.keys(localStorage));
console.log("[APP_FINGERPRINT]", "todos raw:", localStorage.getItem("todos"));

function toTodo(item) {
  const idRaw =
    item?._id ?? item?.id ?? item?.todoId ?? item?.uuid ?? '';

  const textRaw =
    item?.title ?? item?.text ?? item?.name ?? '';

  const doneRaw =
    item?.completed ?? item?.done ?? false;

  const id = idRaw != null ? String(idRaw) : '';
  const text = textRaw != null ? String(textRaw).trim() : '';
  const done = Boolean(doneRaw);
  

  return { id, text, done };
}

(function () {
  'use strict';

  let todos = [];
  try {
    const stored = localStorage.getItem('todos');
    todos = stored ? JSON.parse(stored) : [];
  } catch {
    todos = [];
  }
  let currentFilter = 'all';
  let editingId = null;

  const todoInput = document.getElementById('todoInput');
  const addBtn = document.getElementById('addBtn');
  const todoList = document.getElementById('todoList');
  const todoCount = document.getElementById('todoCount');
  const emptyState = document.getElementById('emptyState');
  const editModal = document.getElementById('editModal');
  const editInput = document.getElementById('editInput');
  const saveEditBtn = document.getElementById('saveEditBtn');
  const cancelEditBtn = document.getElementById('cancelEditBtn');

  const filterBtns = document.querySelectorAll('.filter-btn');
  const apiErrorEl = document.getElementById('apiError');

  function updateCount() {
    const active = todos.filter(function (t) { return !t.done; }).length;
    todoCount.textContent = '할일 ' + active + '개';
  }

  function getFilteredTodos() {
    if (currentFilter === 'active') return todos.filter(function (t) { return !t.done; });
    if (currentFilter === 'done') return todos.filter(function (t) { return t.done; });
    return todos;
  }

  function toggleEmptyState() {
    const filtered = getFilteredTodos();
    emptyState.classList.toggle('hidden', filtered.length > 0);
  }

  function showError(msg) {
    if (!apiErrorEl) return;
    apiErrorEl.textContent = msg;
    apiErrorEl.classList.add('visible');
  }

  function clearError() {
    if (apiErrorEl) {
      apiErrorEl.textContent = '';
      apiErrorEl.classList.remove('visible');
    }
  }

  function saveToStorage() {
    todos = todos.filter(function (t) { return t && t.id && t.text; });
    localStorage.setItem('todos', JSON.stringify(todos));
    console.log("[SAVE]", todos);
  }

  async function loadTodos() {
    clearError();
    try {
      const res = await fetch(API_BASE + '/todos');
      if (!res.ok) {
        const data = await res.json().catch(function () { return {}; });
        throw new Error(data.error || '목록을 불러올 수 없습니다.');
      }
      const data = await res.json();
      todos = Array.isArray(data) ? data.map(toTodo).filter(function (t) { return t.id && t.text; }) : [];
      saveToStorage();
      render();
      updateCount();
    } catch (err) {
      console.error('할일 목록 로드 실패:', err);
      showError('연결 실패: ' + (err.message || err) + ' (백엔드 연결을 확인하세요.)');
    }
  }

  function createTodoElement(todo) {
    const li = document.createElement('li');
    li.className = 'todo-item' + (todo.done ? ' done' : '');
    li.dataset.id = todo.id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'todo-checkbox';
    checkbox.checked = todo.done;
    checkbox.setAttribute('aria-label', '완료 표시');

    const span = document.createElement('span');
    span.className = 'todo-text';
    span.textContent = todo.text;

    const actions = document.createElement('div');
    actions.className = 'todo-actions';

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'btn btn-edit';
    editBtn.textContent = '수정';

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'btn btn-delete';
    deleteBtn.textContent = '삭제';

    checkbox.addEventListener('change', async function () {
      todo.done = checkbox.checked;
      li.classList.toggle('done', todo.done);
      try {
        const res = await fetch(API_BASE + '/todos/' + encodeURIComponent(todo.id), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ completed: todo.done }),
        });
        if (!res.ok) {
          const data = await res.json().catch(function () { return {}; });
          throw new Error(data.error || res.statusText);
        }
        clearError();
        saveToStorage();
      } catch (err) {
        console.error('완료 상태 저장 실패:', err);
        todo.done = !todo.done;
        checkbox.checked = todo.done;
        li.classList.toggle('done', todo.done);
        showError('완료 상태 저장 실패: ' + (err.message || err));
      }
      updateCount();
    });

    editBtn.addEventListener('click', function () {
      openEditModal(todo);
    });

    deleteBtn.addEventListener('click', async function () {
      clearError();
      try {
        const res = await fetch(API_BASE + '/todos/' + encodeURIComponent(todo.id), {
          method: 'DELETE',
        });
        if (!res.ok) {
          const data = await res.json().catch(function () { return {}; });
          throw new Error(data.error || res.statusText);
        }
        todos = todos.filter(function (t) { return t.id !== todo.id; });
        saveToStorage();
        render();
        updateCount();
      } catch (err) {
        console.error('할일 삭제 실패:', err);
        showError('삭제 실패: ' + (err.message || err));
      }
    });

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(actions);

    return li;
  }

  function render() {
    const filtered = getFilteredTodos();
    todoList.innerHTML = '';
    filtered.forEach(function (todo) {
      todoList.appendChild(createTodoElement(todo));
    });
    toggleEmptyState();
  }

  async function addTodo() {
    const text = todoInput.value.trim();
    if (!text) return;

    console.log("[ADD]", { text });

    clearError();
    var tempId = 'temp-' + Date.now();
    var newTodo = { id: tempId, text: text, done: false };
    todos.push(newTodo);
    saveToStorage();
    todoInput.value = '';
    todoInput.focus();
    render();
    updateCount();
    addBtn.disabled = true;

    try {
      const res = await fetch(API_BASE + '/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: text, text: text }),
      });
      const data = await res.json().catch(function () { return {}; });
      if (!res.ok) {
        throw new Error(data.error || res.statusText);
      }
      var idx = todos.findIndex(function (t) { return t.id === tempId; });
      if (idx !== -1) {
        var mapped = toTodo(data);
        if (mapped.id && mapped.text) {
          todos[idx] = mapped;
        }
      }
      saveToStorage();
      render();
      updateCount();
    } catch (err) {
      console.error('할일 추가 실패:', err);
      todos = todos.filter(function (t) { return t.id !== tempId; });
      render();
      updateCount();
      showError('추가 실패: ' + (err.message || err));
    } finally {
      addBtn.disabled = false;
    }
  }

  function openEditModal(todo) {
    editingId = todo.id;
    editInput.value = todo.text;
    editInput.focus();
    editModal.classList.add('open');
    editModal.setAttribute('aria-hidden', 'false');
  }

  function closeEditModal() {
    editingId = null;
    editInput.value = '';
    editModal.classList.remove('open');
    editModal.setAttribute('aria-hidden', 'true');
  }

  async function saveEdit() {
    const text = editInput.value.trim();
    if (!text || !editingId) {
      closeEditModal();
      return;
    }
  
    const todo = todos.find(function (t) { return t.id === editingId; });
  
    if (todo) {
      clearError();
      try {
        const res = await fetch(API_BASE + '/todos/' + encodeURIComponent(todo.id), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: text }),
        });
  
        if (!res.ok) {
          const data = await res.json().catch(function () { return {}; });
          throw new Error(data.error || res.statusText);
        }
  
        // 👇 여기에 들어간다
        const patchData = await res.json().catch(function () { return {}; });
        const mapped = toTodo(patchData);
  
        if (mapped.text) todo.text = mapped.text;
        else todo.text = text;
  
        saveToStorage();
        render();
  
      } catch (err) {
        console.error('할일 수정 저장 실패:', err);
        showError('수정 저장 실패: ' + (err.message || err));
      }
    }
  
    closeEditModal();
  }

  addBtn.addEventListener('click', addTodo);

  todoInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTodo();
    }
  });

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      render();
    });
  });

  saveEditBtn.addEventListener('click', saveEdit);
  cancelEditBtn.addEventListener('click', closeEditModal);

  editInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') saveEdit();
    if (e.key === 'Escape') closeEditModal();
  });

  editModal.addEventListener('click', function (e) {
    if (e.target === editModal) closeEditModal();
  });

  render();
  updateCount();
  loadTodos();
})();
