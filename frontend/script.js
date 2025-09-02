function showRegister() {
  document.getElementById('login-container').classList.add('hidden');
  document.getElementById('register-container').classList.remove('hidden');
}

function showLogin() {
  document.getElementById('register-container').classList.add('hidden');
  document.getElementById('login-container').classList.remove('hidden');
}

async function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  if (res.ok) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('name', data.name);
    loadTasks();
    showTasks();
  } else {
    alert(data.message);
  }
}

async function register() {
  const name = document.getElementById('name').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;

  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });

  const data = await res.json();
  if (res.ok) {
    alert('Registro exitoso');
    showLogin();
  } else {
    alert(data.message);
  }
}

function showTasks() {
  document.getElementById('login-container').classList.add('hidden');
  document.getElementById('register-container').classList.add('hidden');
  document.getElementById('tasks-container').classList.remove('hidden');
  document.getElementById('userName').textContent = localStorage.getItem('name');
}

async function loadTasks() {
  const token = localStorage.getItem('token');
  const res = await fetch('/api/tasks', {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (res.ok) {
    const tasks = await res.json();
    const pendingList = document.getElementById('pending-list');
    const inProgressList = document.getElementById('in-progress-list');
    const completedList = document.getElementById('completed-list');

    pendingList.innerHTML = '';
    inProgressList.innerHTML = '';
    completedList.innerHTML = '';

    tasks.forEach(t => {
      const li = document.createElement('li');
      const priority = t.priority || 'media';
      const priorityBadge = `<span class="priority ${priority}">${priority}</span>`;
      
      li.innerHTML = `
        <div>
          <strong>${t.title}</strong>
          ${priorityBadge}
          ${t.due_date ? `<small style="color:#00bfff; margin-left:8px;">📅 ${t.due_date}</small>` : ''}
        </div>
        <select onchange="updateTaskStatus(${t.id}, this.value)" style="font-size:0.8em; padding:4px;">
          <option value="pendiente" ${t.status === 'pendiente' ? 'selected' : ''}>Pendiente</option>
          <option value="en_proceso" ${t.status === 'en_proceso' ? 'selected' : ''}>En Proceso</option>
          <option value="completada" ${t.status === 'completada' ? 'selected' : ''}>Completada</option>
        </select>
        <button onclick="deleteTask(${t.id})" style="background:#eb5a46; color:white; border:none; padding:6px 10px; border-radius:4px; font-size:0.8em; margin-left:4px;">🗑️</button>
      `;

      if (t.status === 'completada') {
        completedList.appendChild(li);
      } else if (t.status === 'en_proceso') {
        inProgressList.appendChild(li);
      } else {
        pendingList.appendChild(li);
      }
    });
  }
}

async function createTask() {
  const title = document.getElementById('taskTitle').value;
  const desc = document.getElementById('taskDesc').value;
  const dueDate = document.getElementById('taskDueDate').value;
  const priority = document.getElementById('taskPriority').value;
  const status = document.getElementById('taskStatus').value;
  const token = localStorage.getItem('token');

  console.log('Enviando tarea:', { title, description: desc, due_date: dueDate, priority, status }); // 👈 Depuración

  const res = await fetch('/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ title, description: desc, due_date: dueDate, priority, status })
  });

  if (res.ok) {
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskDesc').value = '';
    document.getElementById('taskDueDate').value = '';
    loadTasks();
  } else {
    const error = await res.json();
    console.error('Error al crear tarea:', error);
    alert('Error al crear tarea');
  }
}

async function updateTaskStatus(id, status) {
  const token = localStorage.getItem('token');
  const res = await fetch(`/api/tasks/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  });

  if (res.ok) loadTasks();
}

async function deleteTask(id) {
  const token = localStorage.getItem('token');
  const res = await fetch(`/api/tasks/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (res.ok) loadTasks();
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('name');
  document.getElementById('tasks-container').classList.add('hidden');
  document.getElementById('login-container').classList.remove('hidden');
}