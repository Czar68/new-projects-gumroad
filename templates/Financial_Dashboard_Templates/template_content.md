# Complete Financial Dashboard Template for Digital Creators

I'll create a comprehensive, hard-difficulty financial dashboard template with all requested features. This template will include real-time data simulation, interactive charts, expense tracking, and investment analytics.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FinDash Pro | Financial Dashboard for Digital Creators</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/luxon@3.3.0"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-luxon@1.2.0"></script>
    <style>
        :root {
            --primary: #2A4365;
            --primary-light: #3182CE;
            --secondary: #805AD5;
            --success: #38A169;
            --warning: #D69E2E;
            --danger: #E53E3E;
            --dark: #1A202C;
            --light: #F7FAFC;
            --gray: #CBD5E0;
            --gray-dark: #718096;
            --border-radius: 10px;
            --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            --transition: all 0.3s ease;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        body {
            background-color: #F5F7FA;
            color: var(--dark);
            overflow-x: hidden;
        }

        .dashboard-container {
            display: grid;
            grid-template-columns: 250px 1fr;
            min-height: 100vh;
        }

        /* Sidebar */
        .sidebar {
            background-color: var(--primary);
            color: white;
            padding: 25px 20px;
            position: sticky;
            top: 0;
            height: 100vh;
            overflow-y: auto;
        }

        .logo {
            display: flex;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .logo i {
            font-size: 28px;
            margin-right: 10px;
            color: var(--primary-light);
        }

        .logo h1 {
            font-size: 22px;
            font-weight: 700;
        }

        .nav-menu {
            list-style: none;
            margin-bottom: 40px;
        }

        .nav-menu li {
            margin-bottom: 10px;
        }

        .nav-menu a {
            display: flex;
            align-items: center;
            padding: 12px 15px;
            color: rgba(255, 255, 255, 0.8);
            text-decoration: none;
            border-radius: var(--border-radius);
            transition: var(--transition);
        }

        .nav-menu a:hover, .nav-menu a.active {
            background-color: rgba(255, 255, 255, 0.1);
            color: white;
        }

        .nav-menu i {
            margin-right: 12px;
            width: 20px;
            text-align: center;
        }

        .user-info {
            display: flex;
            align-items: center;
            padding-top: 20px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .user-avatar {
            width: 45px;
            height: 45px;
            border-radius: 50%;
            background-color: var(--secondary);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
            font-weight: bold;
            font-size: 18px;
        }

        .user-details h3 {
            font-size: 16px;
            margin-bottom: 5px;
        }

        .user-details p {
            font-size: 13px;
            color: rgba(255, 255, 255, 0.7);
        }

        /* Main Content */
        .main-content {
            padding: 30px;
            overflow-y: auto;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
        }

        .header h2 {
            font-size: 28px;
            color: var(--dark);
        }

        .date-display {
            background-color: white;
            padding: 10px 20px;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow);
            font-weight: 500;
        }

        /* KPI Cards */
        .kpi-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .kpi-card {
            background-color: white;
            border-radius: var(--border-radius);
            padding: 25px;
            box-shadow: var(--shadow);
            transition: var(--transition);
        }

        .kpi-card:hover {
            transform: translateY(-5px);
        }

        .kpi-card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }

        .kpi-card-title {
            font-size: 14px;
            color: var(--gray-dark);
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .kpi-card-icon {
            width: 45px;
            height: 45px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            color: white;
        }

        .kpi-card-value {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 5px;
        }

        .kpi-card-change {
            font-size: 14px;
            display: flex;
            align-items: center;
        }

        .positive {
            color: var(--success);
        }

        .negative {
            color: var(--danger);
        }

        .neutral {
            color: var(--gray-dark);
        }

        /* Charts Section */
        .charts-section {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 25px;
            margin-bottom: 30px;
        }

        .chart-container {
            background-color: white;
            border-radius: var(--border-radius);
            padding: 25px;
            box-shadow: var(--shadow);
        }

        .chart-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        .chart-title {
            font-size: 18px;
            font-weight: 700;
        }

        .chart-actions {
            display: flex;
            gap: 10px;
        }

        .chart-btn {
            background-color: var(--light);
            border: none;
            padding: 8px 15px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            transition: var(--transition);
        }

        .chart-btn:hover {
            background-color: var(--gray);
        }

        .chart-btn.active {
            background-color: var(--primary);
            color: white;
        }

        canvas {
            width: 100% !important;
            height: 300px !important;
        }

        /* Expense Tracking */
        .expense-section {
            background-color: white;
            border-radius: var(--border-radius);
            padding: 25px;
            box-shadow: var(--shadow);
            margin-bottom: 30px;
        }

        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
        }

        .section-title {
            font-size: 22px;
            font-weight: 700;
        }

        .add-expense-btn {
            background-color: var(--primary);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: var(--border-radius);
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 600;
            transition: var(--transition);
        }

        .add-expense-btn:hover {
            background-color: var(--primary-light);
        }

        .expense-categories {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .category-card {
            padding: 20px;
            border-radius: var(--border-radius);
            background-color: var(--light);
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .category-icon {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 22px;
            color: white;
        }

        .category-info h4 {
            font-size: 16px;
            margin-bottom: 5px;
        }

        .category-info p {
            font-size: 20px;
            font-weight: 700;
        }

        .expense-table {
            width: 100%;
            border-collapse: collapse;
        }

        .expense-table th {
            text-align: left;
            padding: 15px;
            border-bottom: 2px solid var(--gray);
            color: var(--gray-dark);
            font-weight: 600;
            text-transform: uppercase;
            font-size: 14px;
        }

        .expense-table td {
            padding: 15px;
            border-bottom: 1px solid var(--gray);
        }

        .expense-actions {
            display: flex;
            gap: 10px;
        }

        .expense-actions button {
            background: none;
            border: none;
            cursor: pointer;
            color: var(--gray-dark);
            font-size: 16px;
            transition: var(--transition);
        }

        .expense-actions button:hover {
            color: var(--primary);
        }

        /* Investment Analytics */
        .investment-section {
            background-color: white;
            border-radius: var(--border-radius);
            padding: 25px;
            box-shadow: var(--shadow);
        }

        .portfolio-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 25px;
            margin-bottom: 30px;
        }

        .portfolio-card {
            border-radius: var(--border-radius);
            padding: 20px;
            box-shadow: var(--shadow);
            background-color: var(--light);
        }

        .portfolio-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }

        .portfolio-title {
            font-size: 18px;
            font-weight: 700;
        }

        .portfolio-value {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 5px;
        }

        .portfolio-change {
            font-size: 16px;
        }

        .investment-table {
            width: 100%;
            border-collapse: collapse;
        }

        .investment-table th {
            text-align: left;
            padding: 15px;
            border-bottom: 2px solid var(--gray);
            color: var(--gray-dark);
            font-weight: 600;
            text-transform: uppercase;
            font-size: 14px;
        }

        .investment-table td {
            padding: 15px;
            border-bottom: 1px solid var(--gray);
        }

        .stock-ticker {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .stock-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
        }

        /* Modal */
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 1000;
            justify-content: center;
            align-items: center;
        }

        .modal-content {
            background-color: white;
            border-radius: var(--border-radius);
            padding: 30px;
            width: 90%;
            max-width: 500px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
        }

        .modal-title {
            font-size: 22px;
            font-weight: 700;
        }

        .close-modal {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: var(--gray-dark);
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
        }

        .form-control {
            width: 100%;
            padding: 12px 15px;
            border: 1px solid var(--gray);
            border-radius: 8px;
            font-size: 16px;
        }

        .form-actions {
            display: flex;
            justify-content: flex-end;
            gap: 15px;
            margin-top: 30px;
        }

        .btn {
            padding: 12px 25px;
            border-radius: 8px;
            border: none;
            cursor: pointer;
            font-weight: 600;
            transition: var(--transition);
        }

        .btn-primary {
            background-color: var(--primary);
            color: white;
        }

        .btn-secondary {
            background-color: var(--gray);
            color: var(--dark);
        }

        .btn-primary:hover {
            background-color: var(--primary-light);
        }

        /* Real-time indicator */
        .real-time-indicator {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            color: var(--success);
            margin-top: 10px;
        }

        .pulse {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background-color: var(--success);
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }

        /* Responsive */
        @media (max-width: 1200px) {
            .charts-section {
                grid-template-columns: 1fr;
            }
        }

        @media (max-width: 992px) {
            .dashboard-container {
                grid-template-columns: 1fr;
            }
            
            .sidebar {
                height: auto;
                position: relative;
            }
            
            .nav-menu {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
            }
            
            .nav-menu li {
                margin-bottom: 0;
            }
            
            .nav-menu a {
                padding: 10px 15px;
            }
        }

        @media (max-width: 768px) {
            .main-content {
                padding: 20px;
            }
            
            .kpi-grid {
                grid-template-columns: repeat(2, 1fr);
            }
            
            .expense-categories {
                grid-template-columns: repeat(2, 1fr);
            }
            
            .portfolio-grid {
                grid-template-columns: 1fr;
            }
        }

        @media (max-width: 576px) {
            .kpi-grid {
                grid-template-columns: 1fr;
            }
            
            .expense-categories {
                grid-template-columns: 1fr;
            }
            
            .header {
                flex-direction: column;
                align-items: flex-start;
                gap: 15px;
            }
            
            .section-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="dashboard-container">
        <!-- Sidebar -->
        <aside class="sidebar">
            <div class="logo">
                <i class="fas fa-chart-line"></i>
                <h1>FinDash Pro</h1>
            </div>
            
            <ul class="nav-menu">
                <li><a href="#" class="active"><i class="fas fa-home"></i> Dashboard</a></li>
                <li><a href="#"><i class="fas fa-wallet"></i> Accounts</a></li>
                <li><a href="#"><i class="fas fa-chart-pie"></i> Budget</a></li>
                <li><a href="#"><i class="fas fa-chart-bar"></i> Analytics</a></li>
                <li><a href="#"><i class="fas fa-cog"></i> Settings</a></li>
                <li><a href="#"><i class="fas fa-question-circle"></i> Help</a></li>
            </ul>
            
            <div class="user-info">
                <div class="user-avatar">JD</div>
                <div class="user-details">
                    <h3>Jane Doe</h3>
                    <p>Digital Creator</p>
                </div>
            </div>
        </aside>
        
        <!-- Main Content -->
        <main class="main-content">
            <!-- Header -->
            <div class="header">
                <h2>Financial Dashboard</h2>
                <div class="date-display">
                    <i class="fas fa-calendar-alt"></i> <span id="current-date">Loading...</span>
                </div>
            </div>
            
            <!-- KPI Cards -->
            <div class="kpi-grid">
                <div class="kpi-card">
                    <div class="kpi-card-header">
                        <span class="kpi-card-title">Total Revenue</span>
                        <div class="kpi-card-icon" style="background-color: var(--success);">
                            <i class="fas fa-dollar-sign"></i>
                        </div>
                    </div>
                    <div class="kpi-card-value" id="total-revenue">$47,850</div>
                    <div class="kpi-card-change positive">
                        <i class="fas fa-arrow-up"></i> 12.5% from last month
                    </div>
                    <div class="real-time-indicator">
                        <div class="pulse"></div>
                        <span>Live updates</span>
                    </div>
                </div>
                
                <div class="kpi-card">
                    <div class="kpi-card-header">
                        <span class="kpi-card-title">Monthly Expenses</span>
                        <div class="kpi-card-icon" style="background-color: var(--danger);">
                            <i class="fas fa-receipt"></i>
                        </div>
                    </div>
                    <div class="kpi-card-value" id="monthly-expenses">$8,420</div>
                    <div class="kpi-card-change negative">
                        <i class="fas fa-arrow-up"></i> 3.2% from last month
                    </div>
                    <div class="real-time-indicator">
                        <div class="pulse"></div>
                        <span>Live updates</span>
                    </div>
                </div>
                
                <div class="kpi-card">
                    <div class="kpi-card-header">
                        <span class="kpi-card-title">Investment Portfolio</span>
                        <div class="kpi-card-icon" style="background-color: var(--secondary);">
                            <i class="fas fa-chart-line"></i>
                        </div>
                    </div>
                    <div class="kpi-card-value" id="portfolio-value">$125,400</div>
                    <div class="kpi-card-change positive">
                        <i class="fas fa-arrow-up"></i> 5.8% this month
                    </div>
                    <div class="real-time-indicator">
                        <div class="pulse"></div>
                        <span>Live updates</span>
                    </div>
                </div>
                
                <div class="kpi-card">
                    <div class="kpi-card-header">
                        <span class="kpi-card-title">Net Profit Margin</span>
                        <div class="kpi-card-icon" style="background-color: var(--warning);">
                            <i class="fas fa-percentage"></i>
                        </div>
                    </div>
                    <div class="kpi-card-value" id="profit-margin">32.4%</div>
                    <div class="kpi-card-change positive">
                        <i class="fas fa-arrow-up"></i> 2.1% from last month
                    </div>
                    <div class="real-time-indicator">
                        <div class="pulse"></div>
                        <span>Live updates</span>
                    </div>
                </div>
            </div>
            
            <!-- Charts Section -->
            <div class="charts-section">
                <div class="chart-container">
                    <div class="chart-header">
                        <div class="chart-title">Revenue & Expenses Trend</div>
                        <div class="chart-actions">
                            <button class="chart-btn active" data-period="month">Month</button>
                            <button class="chart-btn" data-period="quarter">Quarter</button>
                            <button class="chart-btn" data-period="year">Year</button>
                        </div>
                    </div>
                    <canvas id="revenueExpenseChart"></canvas>
                </div>
                
                <div class="chart-container">
                    <div class="chart-header">
                        <div class="chart-title">Portfolio Allocation</div>
                        <div class="chart-actions">
                            <button class="chart-btn active" data-chart="pie">Pie</button>
                            <button class="chart-btn" data-chart="doughnut">Doughnut</button>
                        </div>
                    </div>
                    <canvas id="portfolioAllocationChart"></canvas>
                </div>
            </div>
            
            <!-- Expense Tracking Section -->
            <div class="expense-section">
                <div class="section-header">
                    <div class="section-title">Expense Tracking</div>
                    <button class="add-expense-btn" id="add-expense-btn">
                        <i class="fas fa-plus"></i> Add Expense
                    </button>
                </div>
                
                <div class="expense-categories">
                    <div class="category-card">
                        <div class="category-icon" style="background-color: var(--danger);">
                            <i class="fas fa-home"></i>
                        </div>
                        <div class="category-info">
                            <h4>Housing</h4>
                            <p>$2,800</p>
                        </div>
                    </div>
                    
                    <div class="category-card">
                        <div class="category-icon" style="background-color: var(--warning);">
                            <i class="fas fa-utensils"></i>
                        </div>
                        <div class="category-info">
                            <h4>Food & Dining</h4>
                            <p>$1,250</p>
                        </div>
                    </div>
                    
                    <div class="category-card">
                        <div class="category-icon" style="background-color: var(--primary-light);">
                            <i class="fas fa-car"></i>
                        </div>
                        <div class="category-info">
                            <h4>Transportation</h4>
                            <p>$650</p>
                        </div>
                    </div>
                    
                    <div class="category-card">
                        <div class="category-icon" style="background-color: var(--secondary);">
                            <i class="fas fa-laptop"></i>
                        </div>
                        <div class="category-info">
                            <h4>Business Expenses</h4>
                            <p>$1,720</p>
                        </div>
                    </div>
                </div>
                
                <table class="expense-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Category</th>
                            <th>Amount</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="expense-table-body">
                        <!-- Expenses will be populated here -->
                    </tbody>
                </table>
            </div>
            
            <!-- Investment Analytics Section -->
            <div class="investment-section">
                <div class="section-header">
                    <div class="section-title">Investment Analytics</div>
                    <button class="add-expense-btn" id="add-investment-btn">
                        <i class="fas fa-plus"></i> Add Investment
                    </button>
                </div>
                
                <div class="portfolio-grid">
                    <div class="portfolio-card">
                        <div class="portfolio-header">
                            <div class="portfolio-title">Stocks Portfolio</div>
                            <div class="portfolio-change positive">+5.2%</div>
                        </div>
                        <div class="portfolio-value">$78,450</div>
                        <div class="real-time-indicator">
                            <div class="pulse"></div>
                            <span>Live market data</span>
                        </div>
                    </div>
                    
                    <div class="portfolio-card">
                        <div class="portfolio-header">
                            <div class="portfolio-title">Crypto Portfolio</div>
                            <div class="portfolio-change positive">+12.7%</div>
                        </div>
                        <div class="portfolio-value">$32,150</div>
                        <div class="real-time-indicator">
                            <div class="pulse"></div>
                            <span>Live market data</span>
                        </div>
                    </div>
                    
                    <div class="portfolio-card">
                        <div class="portfolio-header">
                            <div class="portfolio-title">Real Estate</div>
                            <div class="portfolio-change positive">+3.8%</div>
                        </div>
                        <div class="portfolio-value">$14,800</div>
                        <div class="real-time-indicator">
                            <div class="pulse"></div>
                            <span>Monthly valuation</span>
                        </div>
                    </div>
                </div>
                
                <table class="investment-table">
                    <thead>
                        <tr>
                            <th>Asset</th>
                            <th>Current Price</th>
                            <th>24h Change</th>
                            <th>Shares/Units</th>
                            <th>Total Value</th>
                            <th>Allocation</th>
                        </tr>
                    </thead>
                    <tbody id="investment-table-body">
                        <!-- Investments will be populated here -->
                    </tbody>
                </table>
            </div>
        </main>
    </div>
    
    <!-- Add Expense Modal -->
    <div class="modal" id="expense-modal">
        <div class="modal-content">
            <div class="modal-header">
                <div class="modal-title">Add New Expense</div>
                <button class="close-modal" id="close-expense-modal">&times;</button>
            </div>
            <form id="expense-form">
                <div class="form-group">
                    <label for="expense-description">Description</label>
                    <input type="text" id="expense-description" class="form-control" placeholder="Enter expense description" required>
                </div>
                <div class="form-group">
                    <label for="expense-amount">Amount ($)</label>
                    <input type="number" id="expense-amount" class="form-control" placeholder="0.00" min="0" step="0.01" required>
                </div>
                <div class="form-group">
                    <label for="expense-category">Category</label>
                    <select id="expense-category" class="form-control" required>
                        <option value="">Select a category</option>
                        <option value="Housing">Housing</option>
                        <option value="Food & Dining">Food & Dining</option>
                        <option value="Transportation">Transportation</option>
                        <option value="Business">Business Expenses</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="expense-date">Date</label>
                    <input type="date" id="expense-date" class="form-control" required>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" id="cancel-expense">Cancel</button>
                    <button type="submit" class="btn btn-primary">Add Expense</button>
                </div>
            </form>
        </div>
    </div>
    
    <!-- Add Investment Modal -->
    <div class="modal" id="investment-modal">
        <div class="modal-content">
            <div class="modal-header">
                <div class="modal-title">Add New Investment</div>
                <button class="close-modal" id="close-investment-modal">&times;</button>
            </div>
            <form id="investment-form">
                <div class="form-group">
                    <label for="investment-name">Asset Name</label>
                    <input type="text" id="investment-name" class="form-control" placeholder="e.g., Apple Inc. (AAPL)" required>
                </div>
                <div class="form-group">
                    <label for="investment-type">Asset Type</label>
                    <select id="investment-type" class="form-control" required>
                        <option value="">Select asset type</option>
                        <option value="Stock">Stock</option>
                        <option value="Crypto">Cryptocurrency</option>
                        <option value="ETF">ETF</option>
                        <option value="Bond">Bond</option>
                        <option value="Real Estate">Real Estate</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="investment-shares">Shares/Units</label>
                    <input type="number" id="investment-shares" class="form-control" placeholder="0" min="0" step="0.0001" required>
                </div>
                <div class="form-group">
                    <label for="investment-price">Purchase Price ($)</label>
                    <input type="number" id="investment-price" class="form-control" placeholder="0.00" min="0" step="0.01" required>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" id="cancel-investment">Cancel</button>
                    <button type="submit" class="btn btn-primary">Add Investment</button>
                </div>
            </form>
        </div>
    </div>

    <script>
        // Initialize date
        document.addEventListener('DOMContentLoaded', function() {
            const now = new Date();
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            document.getElementById('current-date').textContent = now.toLocaleDateString('en-US', options);
            
            // Set default date in forms to today
            document.getElementById('expense-date').valueAsDate = now;
            
            // Initialize data
            initExpenseData();
            initInvestmentData();
            initCharts();
            setupRealTimeUpdates();
            
            // Setup event listeners
            setupEventListeners();
        });
        
        // Initialize expense data
        function initExpenseData() {
            const expenseData = [
                { id: 1, date: '2023-10-15', description: 'Office rent', category: 'Housing', amount: 1200 },
                { id: 2, date: '2023-10-14', description: 'Client dinner', category: 'Food & Dining', amount: 85 },
                { id: 3, date: '2023-10-13', description: 'Adobe Creative Cloud', category: 'Business', amount: 52.99 },
                { id: 4, date: '2023-10-12', description: 'Uber rides', category: 'Transportation', amount: 42.50 },
                { id: 5, date: '2023-10-11', description: 'New microphone', category: 'Business', amount: 149.99 }
            ];
            
            const expenseTableBody = document.getElementById('expense-table-body');
            expenseTableBody.innerHTML = '';
            
            expenseData.forEach(expense => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${formatDate(expense.date)}</td>
                    <td>${expense.description}</td>
                    <td>${expense.category}</td>
                    <td>$${expense.amount.toFixed(2)}</td>
                    <td class="expense-actions">
                        <button class="edit-expense" data-id="${expense.id}"><i class="fas fa-edit"></i></button>
                        <button class="delete-expense" data-id="${expense.id}"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                expenseTableBody.appendChild(row);
            });
        }
        
        // Initialize investment data
        function initInvestmentData() {
            const investmentData = [
                { id: 1, name: 'Apple Inc.', ticker: 'AAPL', type
