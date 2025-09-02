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

  const userName = localStorage.getItem('name');
  const userRole = localStorage.getItem('role');
  document.getElementById('userName').textContent = userName;

  // Mostrar botón de admin si es admin
  if (userRole === 'admin') {
    const adminBtn = document.createElement('button');
    adminBtn.textContent = 'Panel de Administrador';
    adminBtn.style.background = '#9400d3';
    adminBtn.style.marginTop = '10px';
    adminBtn.style.padding = '8px 16px';
    adminBtn.style.borderRadius = '8px';
    adminBtn.style.color = 'white';
    adminBtn.style.border = 'none';
    adminBtn.onclick = loadAdminPanel;
    document.querySelector('.header').appendChild(adminBtn);
  }

  loadTasks();
}

async function loadAdminPanel() {
  const token = localStorage.getItem('token');
  const res = await fetch('/api/admin/tasks', {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (res.ok) {
    const tasks = await res.json();
    let msg = 'Tareas de todos los usuarios:\n\n';
    tasks.forEach(t => {
      msg += `🔹 ${t.title} | Creada por: ${t.creator} (${t.email}) | Estado: ${t.status}\n`;
    });
    alert(msg);
  } else {
    alert('Error al cargar datos de administrador');
  }
}