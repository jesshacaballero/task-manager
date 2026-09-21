<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Taskflow | Focus on what matters</title>
    @php
        $manifest = json_decode(file_get_contents(public_path('build/manifest.json')), true);
        $cssAsset = $manifest['resources/css/app.css']['file'] ?? null;
        $jsAsset = $manifest['resources/js/app.js']['file'] ?? null;
    @endphp
    @if ($cssAsset)
        <link rel="stylesheet" href="{{ '/build/' . $cssAsset }}">
    @endif
    @if ($jsAsset)
        <script type="module" src="{{ '/build/' . $jsAsset }}"></script>
    @endif
</head>
<body>
    <div class="app-shell">
        <aside class="sidebar">
            <a class="brand" href="#" aria-label="Taskflow home"><span class="brand-mark">T</span><span>taskflow</span></a>
            <div class="sidebar-section"><p class="eyebrow">Jessha's Tasks</p><nav class="side-nav" aria-label="Main navigation">
                <button class="nav-item is-active" type="button" data-view="all"><span class="nav-icon">[]</span> All tasks <span class="nav-count" id="all-count">0</span></button>
                <button class="nav-item" type="button" data-view="today"><span class="nav-icon">o</span> Today <span class="nav-count" id="today-count">0</span></button>
                <button class="nav-item" type="button" data-view="completed"><span class="nav-icon">v</span> Completed <span class="nav-count" id="completed-count">0</span></button>
            </nav></div>
            <div class="sidebar-note"><strong>Small steps,<br>big progress.</strong><p>Keep your attention where it counts.</p></div>
            <div class="sidebar-footer"><span class="status-dot"></span> Jessha's Personal workspace</div>
        </aside>
        <main class="main-content">
            <div class="dashboard-container">
            <header class="topbar"><div><p class="date-label" id="current-date"></p><h1>Good day, <em>Jessha.</em></h1></div></header>
            <section class="progress-strip" aria-label="Task progress"><div class="progress-copy"><span>Weekly momentum</span><strong id="progress-label">0% complete</strong></div><div class="progress-track"><span id="progress-bar"></span></div><p id="progress-message">Start with one small win today.</p></section>
            <section class="overview-grid" aria-label="Task overview"><article class="overview-card"><span class="overview-label">Open tasks</span><strong id="open-count">0</strong><span class="overview-detail">Keep the momentum going</span></article><article class="overview-card overview-card-accent"><span class="overview-label">Due today</span><strong id="due-count">0</strong><span class="overview-detail">Tasks on your radar</span></article><article class="overview-card"><span class="overview-label">Completed</span><strong id="done-count">0</strong><span class="overview-detail">Wins worth noticing</span></article></section>
            <section class="content-header"><div><p class="eyebrow">Your space</p><h2 id="view-title">All tasks</h2></div><button class="primary-button" id="open-add" type="button"><span>+</span> Add task</button></section>
            <div class="toolbar"><label class="search-box"><span>?</span><input id="search-input" type="search" placeholder="Search tasks..." aria-label="Search tasks"></label><div class="filter-tabs" role="tablist" aria-label="Task filters"><button class="filter-tab is-active" type="button" data-filter="all">All</button><button class="filter-tab" type="button" data-filter="pending">Pending</button><button class="filter-tab" type="button" data-filter="completed">Completed</button></div></div>
            <section class="task-list" id="task-list" aria-live="polite"></section>
            </div>
        </main>
    </div>
    <div class="modal-backdrop" id="modal-backdrop" hidden><section class="task-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button class="modal-close" id="close-modal" type="button" aria-label="Close">x</button><p class="eyebrow">Make it happen</p><h2 id="modal-title">Add a new task</h2><form id="task-form"><input type="hidden" id="task-id"><label>Task name <input id="task-title" type="text" maxlength="100" placeholder="What needs your attention?" required></label><label>Details <textarea id="task-description" maxlength="240" rows="3" placeholder="Add a little context..."></textarea></label><div class="form-row"><label>Due date <input id="task-date" type="date"></label><label>Status <select id="task-status"><option value="Pending" selected>Pending</option><option value="Completed">Completed</option></select></label></div><div class="modal-actions"><button class="text-button" id="cancel-modal" type="button">Cancel</button><button class="primary-button" type="submit">Save task</button></div></form></section></div>
</body>
</html>
