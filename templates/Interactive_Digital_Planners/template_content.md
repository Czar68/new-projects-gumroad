# Interactive Digital Planner Template

I'll create a comprehensive digital planner template with all requested features. This will be a self-contained web application that works entirely in the browser.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Digital Planner Pro | Interactive Planner for Creators</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary-color: #4361ee;
            --secondary-color: #3a0ca3;
            --accent-color: #4cc9f0;
            --light-color: #f8f9fa;
            --dark-color: #212529;
            --gray-color: #6c757d;
            --light-gray: #e9ecef;
            --success-color: #4ade80;
            --warning-color: #fbbf24;
            --danger-color: #f87171;
            --border-radius: 8px;
            --shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            --transition: all 0.3s ease;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Roboto', sans-serif;
            background-color: var(--light-color);
            color: var(--dark-color);
            line-height: 1.6;
            transition: var(--transition);
        }

        body.dark-mode {
            background-color: #121212;
            color: #e0e0e0;
        }

        .container {
            display: flex;
            min-height: 100vh;
            max-width: 1600px;
            margin: 0 auto;
        }

        /* Sidebar Styles */
        .sidebar {
            width: 250px;
            background-color: white;
            box-shadow: var(--shadow);
            padding: 20px 0;
            z-index: 100;
            transition: var(--transition);
        }

        .dark-mode .sidebar {
            background-color: #1e1e1e;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .logo {
            padding: 0 20px 20px;
            border-bottom: 1px solid var(--light-gray);
            margin-bottom: 20px;
        }

        .logo h1 {
            font-family: 'Poppins', sans-serif;
            font-size: 1.5rem;
            color: var(--primary-color);
        }

        .logo p {
            font-size: 0.8rem;
            color: var(--gray-color);
        }

        .nav-links {
            list-style: none;
            padding: 0 15px;
        }

        .nav-links li {
            margin-bottom: 5px;
        }

        .nav-links a {
            display: flex;
            align-items: center;
            padding: 12px 15px;
            text-decoration: none;
            color: var(--dark-color);
            border-radius: var(--border-radius);
            transition: var(--transition);
        }

        .dark-mode .nav-links a {
            color: #e0e0e0;
        }

        .nav-links a:hover,
        .nav-links a.active {
            background-color: var(--primary-color);
            color: white;
        }

        .nav-links i {
            margin-right: 10px;
            width: 20px;
            text-align: center;
        }

        /* Main Content */
        .main-content {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 15px;
            border-bottom: 1px solid var(--light-gray);
        }

        .dark-mode .header {
            border-bottom: 1px solid #333;
        }

        .header h2 {
            font-family: 'Poppins', sans-serif;
            font-weight: 600;
        }

        .theme-toggle {
            display: flex;
            align-items: center;
            background-color: var(--light-gray);
            border-radius: 50px;
            padding: 5px;
            cursor: pointer;
        }

        .dark-mode .theme-toggle {
            background-color: #333;
        }

        .theme-toggle-btn {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: white;
            transition: var(--transition);
        }

        .dark-mode .theme-toggle-btn {
            background-color: var(--dark-color);
            transform: translateX(100%);
        }

        /* Planner Pages */
        .planner-page {
            background-color: white;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow);
            padding: 25px;
            margin-bottom: 25px;
            min-height: 500px;
            transition: var(--transition);
        }

        .dark-mode .planner-page {
            background-color: #1e1e1e;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 1px solid var(--light-gray);
        }

        .dark-mode .page-header {
            border-bottom: 1px solid #333;
        }

        .page-title {
            font-family: 'Poppins', sans-serif;
            font-weight: 600;
            color: var(--primary-color);
        }

        /* Calendar Styles */
        .calendar-container {
            margin-top: 20px;
        }

        .calendar-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        .calendar-nav button {
            background-color: var(--primary-color);
            color: white;
            border: none;
            border-radius: 4px;
            padding: 8px 15px;
            margin: 0 5px;
            cursor: pointer;
            transition: var(--transition);
        }

        .calendar-nav button:hover {
            background-color: var(--secondary-color);
        }

        .calendar-grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 5px;
        }

        .calendar-day-header {
            text-align: center;
            font-weight: 600;
            padding: 10px;
            background-color: var(--light-gray);
            border-radius: 4px;
        }

        .dark-mode .calendar-day-header {
            background-color: #333;
        }

        .calendar-day {
            height: 80px;
            padding: 8px;
            background-color: white;
            border-radius: 4px;
            border: 1px solid var(--light-gray);
            cursor: pointer;
            transition: var(--transition);
            overflow-y: auto;
        }

        .dark-mode .calendar-day {
            background-color: #252525;
            border-color: #333;
        }

        .calendar-day:hover {
            background-color: #f0f5ff;
        }

        .dark-mode .calendar-day:hover {
            background-color: #2a2a2a;
        }

        .calendar-day.today {
            background-color: #e6f0ff;
            border-color: var(--primary-color);
        }

        .dark-mode .calendar-day.today {
            background-color: #1a2a4a;
        }

        .calendar-day-number {
            font-weight: 600;
            margin-bottom: 5px;
        }

        .calendar-event {
            font-size: 0.7rem;
            padding: 2px 4px;
            margin-bottom: 2px;
            border-radius: 3px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .event-work {
            background-color: #dbeafe;
            color: #1e40af;
        }

        .event-personal {
            background-color: #f0f9ff;
            color: #0369a1;
        }

        .event-meeting {
            background-color: #fef3c7;
            color: #92400e;
        }

        /* Sticker Packs */
        .sticker-packs-container {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }

        .sticker-pack {
            background-color: var(--light-gray);
            border-radius: var(--border-radius);
            padding: 15px;
            text-align: center;
            cursor: pointer;
            transition: var(--transition);
        }

        .dark-mode .sticker-pack {
            background-color: #252525;
        }

        .sticker-pack:hover {
            transform: translateY(-5px);
            box-shadow: var(--shadow);
        }

        .sticker-pack i {
            font-size: 2.5rem;
            margin-bottom: 10px;
            color: var(--primary-color);
        }

        .sticker-pack h4 {
            margin-bottom: 10px;
            font-family: 'Poppins', sans-serif;
        }

        .sticker-pack p {
            font-size: 0.9rem;
            color: var(--gray-color);
        }

        .dark-mode .sticker-pack p {
            color: #aaa;
        }

        /* Sticker Canvas */
        .sticker-canvas {
            min-height: 400px;
            border: 2px dashed var(--light-gray);
            border-radius: var(--border-radius);
            padding: 20px;
            margin-top: 20px;
            position: relative;
        }

        .dark-mode .sticker-canvas {
            border-color: #333;
        }

        .sticker {
            position: absolute;
            cursor: move;
            user-select: none;
            transition: var(--transition);
        }

        .sticker:hover {
            transform: scale(1.05);
            z-index: 10;
        }

        .sticker-content {
            width: 80px;
            height: 80px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border-radius: 10px;
            padding: 10px;
            text-align: center;
            box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
        }

        .sticker i {
            font-size: 1.5rem;
            margin-bottom: 5px;
        }

        /* To-Do List */
        .todo-container {
            margin-top: 20px;
        }

        .todo-input-container {
            display: flex;
            margin-bottom: 20px;
        }

        .todo-input {
            flex: 1;
            padding: 12px 15px;
            border: 1px solid var(--light-gray);
            border-radius: var(--border-radius) 0 0 var(--border-radius);
            font-size: 1rem;
        }

        .dark-mode .todo-input {
            background-color: #252525;
            border-color: #333;
            color: #e0e0e0;
        }

        .add-todo-btn {
            background-color: var(--primary-color);
            color: white;
            border: none;
            padding: 0 20px;
            border-radius: 0 var(--border-radius) var(--border-radius) 0;
            cursor: pointer;
            transition: var(--transition);
        }

        .add-todo-btn:hover {
            background-color: var(--secondary-color);
        }

        .todo-list {
            list-style: none;
        }

        .todo-item {
            display: flex;
            align-items: center;
            padding: 12px 15px;
            background-color: var(--light-gray);
            border-radius: var(--border-radius);
            margin-bottom: 10px;
            transition: var(--transition);
        }

        .dark-mode .todo-item {
            background-color: #252525;
        }

        .todo-item:hover {
            background-color: #e2e8f0;
        }

        .dark-mode .todo-item:hover {
            background-color: #2d2d2d;
        }

        .todo-checkbox {
            margin-right: 15px;
            width: 20px;
            height: 20px;
            cursor: pointer;
        }

        .todo-text {
            flex: 1;
        }

        .todo-text.completed {
            text-decoration: line-through;
            color: var(--gray-color);
        }

        .todo-delete {
            background: none;
            border: none;
            color: var(--danger-color);
            cursor: pointer;
            font-size: 1.1rem;
        }

        /* Notes Section */
        .notes-container {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }

        .note {
            background-color: #fff9db;
            border-radius: var(--border-radius);
            padding: 20px;
            min-height: 200px;
            transition: var(--transition);
            box-shadow: var(--shadow);
            position: relative;
        }

        .dark-mode .note {
            background-color: #2d2a1e;
        }

        .note-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }

        .dark-mode .note-header {
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .note-title {
            font-weight: 600;
            font-family: 'Poppins', sans-serif;
        }

        .note-date {
            font-size: 0.8rem;
            color: var(--gray-color);
        }

        .note-content {
            line-height: 1.5;
        }

        /* Footer */
        .footer {
            text-align: center;
            padding: 20px;
            margin-top: 30px;
            color: var(--gray-color);
            font-size: 0.9rem;
            border-top: 1px solid var(--light-gray);
        }

        .dark-mode .footer {
            border-top: 1px solid #333;
        }

        /* Responsive */
        @media (max-width: 992px) {
            .container {
                flex-direction: column;
            }
            
            .sidebar {
                width: 100%;
                padding: 15px;
            }
            
            .nav-links {
                display: flex;
                overflow-x: auto;
                padding-bottom: 10px;
            }
            
            .nav-links li {
                margin-right: 10px;
                margin-bottom: 0;
            }
            
            .nav-links a {
                white-space: nowrap;
            }
        }

        @media (max-width: 576px) {
            .main-content {
                padding: 15px;
            }
            
            .calendar-day {
                height: 60px;
                padding: 5px;
                font-size: 0.9rem;
            }
            
            .sticker-packs-container {
                grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            }
            
            .notes-container {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Sidebar Navigation -->
        <aside class="sidebar">
            <div class="logo">
                <h1><i class="fas fa-book-open"></i> Planner Pro</h1>
                <p>Digital Planner for Creators</p>
            </div>
            <ul class="nav-links">
                <li><a href="#dashboard" class="active" id="nav-dashboard"><i class="fas fa-home"></i> Dashboard</a></li>
                <li><a href="#calendar" id="nav-calendar"><i class="fas fa-calendar-alt"></i> Calendar</a></li>
                <li><a href="#weekly" id="nav-weekly"><i class="fas fa-calendar-week"></i> Weekly Planner</a></li>
                <li><a href="#daily" id="nav-daily"><i class="fas fa-calendar-day"></i> Daily Planner</a></li>
                <li><a href="#stickers" id="nav-stickers"><i class="fas fa-sticky-note"></i> Sticker Packs</a></li>
                <li><a href="#todo" id="nav-todo"><i class="fas fa-tasks"></i> To-Do List</a></li>
                <li><a href="#notes" id="nav-notes"><i class="fas fa-edit"></i> Notes</a></li>
            </ul>
        </aside>

        <!-- Main Content -->
        <main class="main-content">
            <div class="header">
                <h2 id="page-title">Dashboard</h2>
                <div class="theme-toggle" id="theme-toggle">
                    <div class="theme-toggle-btn">
                        <i class="fas fa-moon"></i>
                    </div>
                    <span style="margin-left: 10px;">Dark Mode</span>
                </div>
            </div>

            <!-- Dashboard Page -->
            <div id="dashboard-page" class="planner-page active-page">
                <div class="page-header">
                    <h3 class="page-title">Welcome to Your Digital Planner</h3>
                    <div class="date-display" id="current-date"></div>
                </div>
                <p>Welcome to your interactive digital planner designed for students, professionals, and entrepreneurs. This planner includes all the tools you need to organize your schedule, tasks, and notes effectively.</p>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-top: 25px;">
                    <div style="background-color: #e6f0ff; padding: 20px; border-radius: var(--border-radius);">
                        <h4><i class="fas fa-calendar-check"></i> Upcoming Events</h4>
                        <ul style="margin-top: 10px; padding-left: 20px;">
                            <li>Team Meeting - Tomorrow, 10:00 AM</li>
                            <li>Project Deadline - Friday</li>
                            <li>Dentist Appointment - Next Monday</li>
                        </ul>
                    </div>
                    <div style="background-color: #f0f9ff; padding: 20px; border-radius: var(--border-radius);">
                        <h4><i class="fas fa-tasks"></i> Today's Tasks</h4>
                        <ul style="margin-top: 10px; padding-left: 20px;">
                            <li>Complete project proposal</li>
                            <li>Email client follow-up</li>
                            <li>Gym workout</li>
                        </ul>
                    </div>
                    <div style="background-color: #fef3c7; padding: 20px; border-radius: var(--border-radius);">
                        <h4><i class="fas fa-lightbulb"></i> Quick Tips</h4>
                        <p style="margin-top: 10px;">Use sticker packs to visually organize your planner. Try dragging stickers onto your calendar or notes!</p>
                    </div>
                </div>
            </div>

            <!-- Calendar Page -->
            <div id="calendar-page" class="planner-page">
                <div class="page-header">
                    <h3 class="page-title">Monthly Calendar</h3>
                    <div class="calendar-nav">
                        <button id="prev-month"><i class="fas fa-chevron-left"></i></button>
                        <span id="current-month-year">June 2023</span>
                        <button id="next-month"><i class="fas fa-chevron-right"></i></button>
                    </div>
                </div>
                <p>View and manage your monthly schedule. Click on any day to add events or view details.</p>
                
                <div class="calendar-container">
                    <div class="calendar-grid" id="calendar-days-header">
                        <!-- Day headers will be generated by JavaScript -->
                    </div>
                    <div class="calendar-grid" id="calendar-days">
                        <!-- Calendar days will be generated by JavaScript -->
                    </div>
                </div>
                
                <div style="margin-top: 30px;">
                    <h4>Event Legend</h4>
                    <div style="display: flex; gap: 15px; margin-top: 10px;">
                        <div style="display: flex; align-items: center;">
                            <div class="calendar-event event-work" style="width: 20px; height: 20px; margin-right: 5px;"></div>
                            <span>Work</span>
                        </div>
                        <div style="display: flex; align-items: center;">
                            <div class="calendar-event event-personal" style="width: 20px; height: 20px; margin-right: 5px;"></div>
                            <span>Personal</span>
                        </div>
                        <div style="display: flex; align-items: center;">
                            <div class="calendar-event event-meeting" style="width: 20px; height: 20px; margin-right: 5px;"></div>
                            <span>Meeting</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Weekly Planner Page -->
            <div id="weekly-page" class="planner-page">
                <div class="page-header">
                    <h3 class="page-title">Weekly Planner</h3>
                    <div class="calendar-nav">
                        <button id="prev-week"><i class="fas fa-chevron-left"></i></button>
                        <span id="current-week">Week 25, June 19-25, 2023</span>
                        <button id="next-week"><i class="fas fa-chevron-right"></i></button>
                    </div>
                </div>
                <p>Plan your week with hourly breakdowns for each day. Add tasks, events, and notes to stay organized.</p>
                
                <div id="weekly-grid" style="margin-top: 20px;">
                    <!-- Weekly grid will be generated by JavaScript -->
                </div>
            </div>

            <!-- Daily Planner Page -->
            <div id="daily-page" class="planner-page">
                <div class="page-header">
                    <h3 class="page-title">Daily Planner</h3>
                    <div class="calendar-nav">
                        <button id="prev-day"><i class="fas fa-chevron-left"></i></button>
                        <span id="current-day">Monday, June 19, 2023</span>
                        <button id="next-day"><i class="fas fa-chevron-right"></i></button>
                    </div>
                </div>
                <p>Focus on today's tasks, schedule, and priorities. Time-block your day for maximum productivity.</p>
                
                <div id="daily-schedule" style="margin-top: 20px;">
                    <!-- Daily schedule will be generated by JavaScript -->
                </div>
            </div>

            <!-- Sticker Packs Page -->
            <div id="stickers-page" class="planner-page">
                <div class="page-header">
                    <h3 class="page-title">Sticker Packs</h3>
                    <button id="clear-stickers" style="background-color: var(--danger-color); color: white; border: none; padding: 8px 15px; border-radius: var(--border-radius); cursor: pointer;">Clear All Stickers</button>
                </div>
                <p>Drag and drop stickers onto your planner pages to visually organize your schedule and tasks.</p>
                
                <div class="sticker-packs-container">
                    <div class="sticker-pack" data-pack="productivity">
                        <i class="fas fa-rocket"></i>
                        <h4>Productivity</h4>
                        <p>Motivational and focus stickers</p>
                    </div>
                    <div class="sticker-pack" data-pack="work">
                        <i class="fas fa-briefcase"></i>
                        <h4>Work & Business</h4>
                        <p>Professional and meeting stickers</p>
                    </div>
                    <div class="sticker-pack" data-pack="study">
                        <i class="fas fa-graduation-cap"></i>
                        <h4>Study & Education</h4>
                        <p>Academic and learning stickers</p>
                    </div>
                    <div class="sticker-pack" data-pack="personal">
                        <i class="fas fa-heart"></i>
                        <h4>Personal & Wellness</h4>
                        <p>Health and self-care stickers</p>
                    </div>
                </div>
                
                <h4 style="margin-top: 30px;">Sticker Canvas</h4>
                <p>Drag stickers from the packs above and drop them here to organize them for use in your planner.</p>
                
                <div class="sticker-canvas" id="sticker-canvas">
                    <!-- Stickers will be added here by drag and drop -->
                    <div class="sticker" style="top: 50px; left: 30px;">
                        <div class="sticker-content" style="background-color: #dbeafe;">
                            <i class="fas fa-check-circle"></i>
                            <span>Done</span>
                        </div>
                    </div>
                    <div class="sticker" style="top: 50px; left: 150px;">
                        <div class="sticker-content" style="background-color: #fef3c7;">
                            <i class="fas fa-exclamation-triangle"></i>
                            <span>Important</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- To-Do List Page -->
            <div id="todo-page" class="planner-page">
                <div class="page-header">
                    <h3 class="page-title">To-Do List</h3>
                    <button id="clear-completed" style="background-color: var(--gray-color); color: white; border: none; padding: 8px 15px; border-radius: var(--border-radius); cursor: pointer;">Clear Completed</button>
                </div>
                <p>Manage your tasks and track your progress. Add new tasks, mark them as complete, or delete them.</p>
                
                <div class="todo-container">
                    <div class="todo-input-container">
                        <input type="text" class="todo-input" id="todo-input" placeholder="Add a new task...">
                        <button class="add-todo-btn" id="add-todo-btn"><i class="fas fa-plus"></i> Add</button>
                    </div>
                    
                    <ul class="todo-list" id="todo-list">
                        <!-- To-do items will be added here by JavaScript -->
                    </ul>
                </div>
            </div>

            <!-- Notes Page -->
            <div id="notes-page" class="planner-page">
                <div class="page-header">
                    <h3 class="page-title">Notes</h3>
                    <button id="add-note" style="background-color: var(--primary-color); color: white; border: none; padding: 8px 15px; border-radius: var(--border-radius); cursor: pointer;"><i class="fas fa-plus"></i> Add Note</button>
                </div>
                <p>Create and organize notes for your projects, ideas, and reminders. All notes are saved automatically.</p>
                
                <div class="notes-container" id="notes-container">
                    <!-- Notes will be added here by JavaScript -->
                </div>
            </div>

            <!-- Footer -->
            <div class="footer">
                <p>Interactive Digital Planner Template &copy; 2023 | Designed for Students, Professionals, and Entrepreneurs</p>
                <p style="margin-top: 5px; font-size: 0.8rem;">All data is stored locally in your browser. Your information is never sent to a server.</p>
            </div>
        </main>
    </div>

    <script>
        // DOM Elements
        const body = document.body;
        const themeToggle = document.getElementById('theme-toggle');
        const currentDateElement = document.getElementById('current-date');
        const navLinks = document.querySelectorAll('.nav-links a');
        const plannerPages = document.querySelectorAll('.planner-page');
        const pageTitle = document.getElementById('page-title');
        
        // Calendar Elements
        const calendarDaysHeader = document.getElementById('calendar-days-header');
        const calendarDays = document.getElementById('calendar-days');
        const currentMonthYear = document.getElementById('current-month-year');
        const prevMonthBtn = document.getElementById('prev-month');
        const nextMonthBtn = document.getElementById('next-month');
        
        // Weekly Planner Elements
        const weeklyGrid = document.getElementById('weekly-grid');
        const currentWeek = document.getElementById('current-week');
        const prevWeekBtn = document.getElementById('prev-week');
        const nextWeekBtn = document.getElementById('next-week');
        
        // Daily Planner Elements
        const dailySchedule = document.getElementById('daily-schedule');
        const currentDay = document.getElementById('current-day');
        const prevDayBtn = document.getElementById('prev-day');
        const nextDayBtn = document.getElementById('next-day');
        
        // Sticker Elements
        const stickerPacks = document.querySelectorAll('.sticker-pack');
        const stickerCanvas = document.getElementById('sticker-canvas');
        const clearStickersBtn = document.getElementById('clear-stickers');
        
        // To-Do Elements
        const todoInput = document.getElementById('todo-input');
        const addTodoBtn = document.getElementById('add-todo-btn');
        const todoList = document.getElementById('todo-list');
        const clearCompletedBtn = document.getElementById('clear-completed');
        
        // Notes Elements
        const addNoteBtn = document.getElementById('add-note');
        const notesContainer = document.getElementById('notes-container');
        
        // Current Date
        const now = new Date();
        let currentMonth = now.getMonth();
        let currentYear = now.getFullYear();
        let currentWeekOffset = 0;
        let currentDayOffset = 0;
        
        // Sticker Data
        const stickerData = {
            productivity: [
                { icon: 'fas fa-rocket', text: 'Launch', color: '#dbeafe' },
                { icon: 'fas fa-bullseye', text: 'Target', color: '#fef3c7' },
                { icon: 'fas fa-flag-checkered', text: 'Finish', color: '#dcfce7' },
                { icon: 'fas fa-lightbulb', text: 'Idea', color: '#f3e8ff' }
            ],
            work: [
                { icon: 'fas fa-briefcase', text: 'Work', color: '#dbeafe' },
                { icon: 'fas fa-users', text: 'Meeting', color: '#fce7f3' },
                { icon: 'fas fa-file-contract', text: 'Deadline', color: '#fef3c7' },
                { icon: 'fas fa-chart-line', text: 'Growth', color: '#dcfce7' }
            ],
            study: [
                { icon: 'fas fa-graduation-cap', text: 'Study', color: '#f3e8ff' },
                { icon: 'fas fa-book', text: 'Read', color: '#dbeafe' },
                { icon: 'fas fa-pen-fancy', text: 'Essay', color: '#fce7f3' },
                { icon: 'fas fa-flask', text: 'Lab', color: '#dcfce7' }
            ],
            personal: [
                { icon: 'fas fa-heart', text: 'Self-care', color: '#fce7f3' },
                { icon: 'fas fa-dumbbell', text: 'Workout', color: '#dcfce7' },
                { icon: 'fas fa-utensils', text: 'Meal', color: '#fef3c7' },
                { icon: 'fas fa-bed', text: 'Rest', color: '#dbeafe' }
            ]
        };
        
        // To-Do Items Data
        let todoItems = [
            { id: 1, text: 'Complete project proposal', completed: false },
            { id: 2, text: 'Email client
