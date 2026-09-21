let tasks = [];
let currentView = 'all'; let currentFilter = 'all'; const $ = (selector) => document.querySelector(selector);
const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[character]));
const formatDate = (date) => date ? new Date(`${date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No due date';
const isToday = (date) => date === new Date().toISOString().slice(0, 10);
const fromApi = (task) => ({ ...task, date: task.due_date || '' });
async function request(url, options = {}) {
    const response = await fetch(url, { ...options, headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken, ...options.headers } });
    if (!response.ok) throw new Error('The task could not be saved.');
    return response.status === 204 ? null : response.json();
}
async function loadTasks() { tasks = (await request('/tasks')).map(fromApi); render(); }
function render() {
    const search = $('#search-input').value.trim().toLowerCase();
    const visibleTasks = tasks.filter((task) => {
        const matchesView = currentView === 'all' || (currentView === 'today' && isToday(task.date)) || (currentView === 'completed' && task.status === 'Completed');
        const matchesFilter = currentFilter === 'all' || (currentFilter === 'pending' && task.status === 'Pending') || (currentFilter === 'completed' && task.status === 'Completed');
        return matchesView && matchesFilter && `${task.task_name} ${task.description}`.toLowerCase().includes(search);
    });
    $('#task-list').innerHTML = visibleTasks.length ? visibleTasks.map(taskTemplate).join('') : '<div class="empty-state"><strong>Nothing here yet.</strong><p>Add a task and make today count.</p></div>';
    $('#view-title').textContent = currentView === 'today' ? 'Today' : currentView === 'completed' ? 'Completed' : 'All tasks';
    $('#all-count').textContent = tasks.filter((task) => task.status !== 'Completed').length; $('#today-count').textContent = tasks.filter((task) => isToday(task.date) && task.status !== 'Completed').length; $('#completed-count').textContent = tasks.filter((task) => task.status === 'Completed').length;
    $('#open-count').textContent = tasks.filter((task) => task.status !== 'Completed').length; $('#due-count').textContent = tasks.filter((task) => isToday(task.date) && task.status !== 'Completed').length; $('#done-count').textContent = tasks.filter((task) => task.status === 'Completed').length;
    const completeCount = tasks.filter((task) => task.status === 'Completed').length; const progress = tasks.length ? Math.round((completeCount / tasks.length) * 100) : 0;
    $('#progress-label').textContent = `${progress}% complete`; $('#progress-bar').style.width = `${progress}%`; $('#progress-message').textContent = progress === 100 ? 'Everything is wrapped up. Nicely done.' : progress ? 'You are building a good rhythm.' : 'Start with one small win today.';
}
function taskTemplate(task) { return `<article class="task-card ${task.status === 'Completed' ? 'is-done' : ''}"><button class="task-check" type="button" data-action="toggle" data-id="${task.id}" aria-label="Toggle task status">${task.status === 'Completed' ? '✓' : ''}</button><div class="task-copy"><h3>${escapeHtml(task.task_name)}</h3><p>${escapeHtml(task.description || 'No details added.')}</p></div><div class="task-meta"><span class="task-date">${formatDate(task.date)}</span><span class="status-badge status-${task.status.toLowerCase()}">${task.status}</span><div class="task-actions"><button class="icon-button" type="button" data-action="edit" data-id="${task.id}" aria-label="Edit task">e</button><button class="icon-button" type="button" data-action="delete" data-id="${task.id}" aria-label="Delete task">x</button></div></div></article>`; }
function openModal(task = null) { $('#modal-title').textContent = task ? 'Edit task' : 'Add a new task'; $('#task-id').value = task?.id || ''; $('#task-title').value = task?.task_name || ''; $('#task-description').value = task?.description || ''; $('#task-date').value = task?.date || ''; $('#task-status').value = task?.status || 'Pending'; $('#modal-backdrop').hidden = false; $('#task-title').focus(); }
function closeModal() { $('#modal-backdrop').hidden = true; }
document.addEventListener('DOMContentLoaded', () => {
    $('#current-date').textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }); render();
    $('#open-add').addEventListener('click', () => openModal()); $('#close-modal').addEventListener('click', closeModal); $('#cancel-modal').addEventListener('click', closeModal); $('#modal-backdrop').addEventListener('click', (event) => { if (event.target.id === 'modal-backdrop') closeModal(); }); $('#search-input').addEventListener('input', render);
    document.querySelectorAll('[data-view]').forEach((button) => button.addEventListener('click', () => { currentView = button.dataset.view; document.querySelectorAll('[data-view]').forEach((item) => item.classList.toggle('is-active', item === button)); render(); }));
    document.querySelectorAll('[data-filter]').forEach((button) => button.addEventListener('click', () => { currentFilter = button.dataset.filter; document.querySelectorAll('[data-filter]').forEach((item) => item.classList.toggle('is-active', item === button)); render(); }));
    $('#task-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const id = $('#task-id').value;
        const existing = tasks.find((item) => item.id === Number(id));
        const payload = { task_name: $('#task-title').value.trim(), description: $('#task-description').value.trim(), due_date: $('#task-date').value || null, status: $('#task-status').value };
        try {
            const saved = await request(id ? `/tasks/${id}` : '/tasks', { method: id ? 'PUT' : 'POST', body: JSON.stringify(payload) });
            tasks = id ? tasks.map((item) => item.id === Number(id) ? fromApi(saved) : item) : [fromApi(saved), ...tasks];
            render(); closeModal();
        } catch (error) { alert(error.message); }
    });
    $('#task-list').addEventListener('click', async (event) => {
        const button = event.target.closest('[data-action]'); if (!button) return;
        const id = Number(button.dataset.id); const task = tasks.find((item) => item.id === id);
        if (button.dataset.action === 'edit') { openModal(task); return; }
        if (button.dataset.action === 'delete' && confirm('Delete this task?')) {
            try { await request(`/tasks/${id}`, { method: 'DELETE' }); tasks = tasks.filter((item) => item.id !== id); render(); } catch (error) { alert(error.message); }
            return;
        }
        if (button.dataset.action === 'toggle') {
            try { const saved = await request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify({ status: task.status === 'Completed' ? 'Pending' : 'Completed' }) }); tasks = tasks.map((item) => item.id === id ? fromApi(saved) : item); render(); } catch (error) { alert(error.message); }
        }
    });
    loadTasks().catch((error) => { $('#task-list').innerHTML = `<div class="empty-state"><strong>Could not load tasks.</strong><p>${escapeHtml(error.message)}</p></div>`; });
});
