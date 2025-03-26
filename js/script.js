document.addEventListener('DOMContentLoaded', async function() {
    // Get login status from localStorage
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    // Update navbar based on login status
    updateNavbar(isLoggedIn);
    
    // Check login status for protected pages
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
    if (currentPage && currentPage !== 'login' && currentPage !== 'index') {
        checkLoginStatus();
    }
    
    // Get current page and activate correct tab
    if (currentPage) {
        activateTab(currentPage);
    }
    
    // Initialize the form tabs on nhap_tin_bao page
    if (currentPage === 'nhap_tin_bao') {
        initFormTabs();
    }
    
    // Initialize reports on thong_ke_tin page
    if (currentPage === 'thong_ke_tin') {
        loadReports(getCurrentPeriod() || '1month');
    }
    
    // Check if login form exists and add event listeners
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Check if report form exists and add event listeners
    const reportForm = document.getElementById('reportForm');
    if (reportForm) {
        reportForm.addEventListener('submit', handleReportSubmission);
    }
    
    // Initialize logout buttons
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
});

// Function to update navbar based on login status
function updateNavbar(isLoggedIn) {
    const navbarRight = document.querySelector('.navbar-right');
    if (!navbarRight) return;
    
    if (isLoggedIn === 'true') {
        navbarRight.innerHTML = `<button id="logoutBtn" class="logout-btn" style="background-color: #f44336; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: bold; margin-right: 20px;">Đăng xuất</button>`;
        document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    } else {
        navbarRight.innerHTML = '<a href="login.html" class="logout-btn" style="background-color: #4CAF50; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: bold; text-decoration: none; margin-right: 20px;">Đăng nhập</a>';
    }
}

// Function to handle login with Supabase
async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Simple validation
    if (!username || !password) {
        alert('Vui lòng nhập tên đăng nhập và mật khẩu');
        return;
    }
    
    try {
        // Show loading state
        const submitButton = e.target.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Đang xử lý...';
        submitButton.disabled = true;
        
        // Check hardcoded credentials
        if (username === 'admin' && password === '123456') {
            // Set localStorage values
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('username', 'admin');
            localStorage.setItem('userId', 'admin');
            
            // Update navbar
            updateNavbar('true');
            
            // Redirect to home page
            window.location.href = 'index.html';
        } else {
            alert('Tên đăng nhập hoặc mật khẩu không đúng');
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    } catch (err) {
        console.error('Login error:', err);
        alert('Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.');
        
        // Reset button state
        const submitButton = e.target.querySelector('button[type="submit"]');
        submitButton.textContent = 'Đăng nhập';
        submitButton.disabled = false;
    }
}

// Function to handle logout
async function handleLogout() {
    try {
        // Clear localStorage
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username');
        localStorage.removeItem('userId');
        
        // Redirect to login page
        window.location.href = 'login.html';
    } catch (err) {
        console.error('Logout error:', err);
        alert('Đã xảy ra lỗi khi đăng xuất. Vui lòng thử lại.');
    }
}

// Function to activate current tab
function activateTab(pageName) {
    const navLinks = document.querySelectorAll('.navbar a');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.includes(pageName)) {
            link.classList.add('active');
        }
    });
}

// Function to initialize form tabs on nhap_tin_bao page
function initFormTabs() {
    const formTabs = document.querySelectorAll('.navbar-form a');
    const formTypeInput = document.getElementById('formType');
    
    formTabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            const formType = this.getAttribute('data-form-type');
            
            // Update active tab
            formTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Update hidden form type
            if (formTypeInput) {
                formTypeInput.value = formType;
            }
        });
    });
}

// Function to handle form submission on nhap_tin_bao page with Supabase
async function handleReportSubmission(e) {
    e.preventDefault();
    console.log('Form submission started'); // Debug log
    
    // Check login status first
    if (!checkLoginStatus()) {
        return;
    }
    
    // Get form data
    const tinhHinh = document.getElementById('tinhHinh').value;
    const diaBan = document.getElementById('diaBan').value;
    const capBaoTin = document.getElementById('capBaoTin').value;
    const donViBao = document.getElementById('donViBao').value;
    const formType = document.getElementById('formType').value;
    
    console.log('Form data:', { tinhHinh, diaBan, capBaoTin, donViBao, formType }); // Debug log
    
    // Validate form
    if (!tinhHinh || !diaBan || !capBaoTin || !donViBao) {
        alert('Vui lòng điền đầy đủ thông tin');
        return;
    }
    
    try {
        // Show loading state
        const submitButton = e.target.querySelector('button[type="submit"]');
        if (!submitButton) {
            console.error('Submit button not found');
            alert('Lỗi kỹ thuật: Không tìm thấy nút gửi');
            return;
        }
        
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Đang xử lý...';
        submitButton.disabled = true;
        
        console.log('Sending data to Supabase'); // Debug log
        
        // Create the report object
        const newReport = { 
            tinh_hinh: tinhHinh,
            dia_ban: diaBan,
            cap_bao_tin: capBaoTin,
            don_vi_bao: donViBao,
            form_type: formType,
            user_id: localStorage.getItem('userId') || 'admin',
            created_at: new Date().toISOString()
        };
        
        // Try to create report in Supabase
        const { data, error } = await supabaseClient
            .from('reports')
            .insert([newReport])
            .select();
        
        console.log('Supabase response:', { data, error }); // Debug log
        
        // If there's an error with Supabase, save to localStorage instead
        if (error) {
            console.error('Error saving report to Supabase:', error);
            
            // Save to localStorage
            saveReportToLocalStorage(newReport);
            
            // Show success message (we're handling it locally even if Supabase failed)
            alert('Báo cáo đã được lưu thành công!');
            
            // Redirect to thong_ke_tin page
            window.location.href = 'thong_ke_tin.html?period=1month';
            return;
        }
        
        // Show success message
        alert('Báo cáo đã được lưu thành công!');
        
        // Redirect to thong_ke_tin page
        window.location.href = 'thong_ke_tin.html?period=1month';
    } catch (err) {
        console.error('Report submission error:', err);
        alert('Đã xảy ra lỗi khi gửi báo cáo. Vui lòng thử lại.');
        
        // Reset button state
        const submitButton = e.target.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.textContent = 'Xác nhận';
            submitButton.disabled = false;
        }
    }
}

// Function to save a report to localStorage
function saveReportToLocalStorage(report) {
    // Get existing reports from localStorage
    let reports = JSON.parse(localStorage.getItem('localReports') || '[]');
    
    // Add the new report
    reports.push(report);
    
    // Save back to localStorage
    localStorage.setItem('localReports', JSON.stringify(reports));
    
    console.log('Report saved to localStorage:', report);
}

// Global variable to track if we're in delete mode
let deleteMode = false;
let selectedReports = [];

// Function to initialize delete mode button
function initDeleteButton() {
    const deleteBtn = document.getElementById('deleteReportBtn');
    if (!deleteBtn) return;
    
    deleteBtn.addEventListener('click', toggleDeleteMode);
}

// Function to toggle delete mode
function toggleDeleteMode() {
    const deleteBtn = document.getElementById('deleteReportBtn');
    const table = document.getElementById('reportTableBody');
    if (!deleteBtn || !table) return;
    
    deleteMode = !deleteMode;
    selectedReports = [];
    
    if (deleteMode) {
        // Enter delete mode
        deleteBtn.textContent = 'Xác nhận xóa';
        deleteBtn.style.backgroundColor = '#d32f2f';
        
        // Add selection checkboxes to each row
        const rows = table.querySelectorAll('tr');
        rows.forEach(row => {
            const firstCell = row.querySelector('td');
            if (firstCell) {
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'report-checkbox';
                checkbox.dataset.id = row.dataset.id || '';
                checkbox.dataset.created = row.dataset.created || '';
                checkbox.style.marginRight = '10px';
                checkbox.style.transform = 'scale(1.5)';
                firstCell.prepend(checkbox);
                
                // Make rows selectable
                row.style.cursor = 'pointer';
                row.addEventListener('click', function(e) {
                    if (e.target.type !== 'checkbox') {
                        const cb = this.querySelector('.report-checkbox');
                        if (cb) cb.checked = !cb.checked;
                    }
                });
            }
        });
        
        // Add cancel button
        const cancelBtn = document.createElement('button');
        cancelBtn.id = 'cancelDeleteBtn';
        cancelBtn.textContent = 'Hủy';
        cancelBtn.style.padding = '15px 25px';
        cancelBtn.style.backgroundColor = '#607d8b';
        cancelBtn.style.color = 'white';
        cancelBtn.style.border = 'none';
        cancelBtn.style.fontSize = '16px';
        cancelBtn.style.borderRadius = '5px';
        cancelBtn.style.cursor = 'pointer';
        cancelBtn.style.marginRight = '10px';
        cancelBtn.addEventListener('click', cancelDeleteMode);
        
        deleteBtn.parentNode.insertBefore(cancelBtn, deleteBtn);
    } else {
        // Exit delete mode and perform deletion
        const checkboxes = document.querySelectorAll('.report-checkbox:checked');
        if (checkboxes.length === 0) {
            alert('Vui lòng chọn ít nhất một báo cáo để xóa');
            cancelDeleteMode();
            return;
        }
        
        if (confirm(`Bạn có chắc chắn muốn xóa ${checkboxes.length} báo cáo đã chọn?`)) {
            // Collect all selected reports
            checkboxes.forEach(checkbox => {
                selectedReports.push({
                    id: checkbox.dataset.id,
                    created: checkbox.dataset.created
                });
            });
            
            // Delete selected reports
            deleteSelectedReports();
        } else {
            cancelDeleteMode();
        }
    }
}

// Function to cancel delete mode
function cancelDeleteMode() {
    deleteMode = false;
    selectedReports = [];
    
    // Reset UI
    const deleteBtn = document.getElementById('deleteReportBtn');
    if (deleteBtn) {
        deleteBtn.textContent = 'Xóa tin báo';
        deleteBtn.style.backgroundColor = '#f44336';
    }
    
    // Remove checkboxes
    const checkboxes = document.querySelectorAll('.report-checkbox');
    checkboxes.forEach(cb => cb.remove());
    
    // Remove row click handlers
    const rows = document.querySelectorAll('#reportTableBody tr');
    rows.forEach(row => {
        row.style.cursor = 'default';
        row.replaceWith(row.cloneNode(true)); // Remove event listeners
    });
    
    // Remove cancel button
    const cancelBtn = document.getElementById('cancelDeleteBtn');
    if (cancelBtn) cancelBtn.remove();
    
    // Reload reports to reset the view
    const urlParams = new URLSearchParams(window.location.search);
    const currentPeriod = urlParams.get('period') || '1month';
    loadReports(currentPeriod);
}

// Function to delete selected reports
async function deleteSelectedReports() {
    try {
        for (const report of selectedReports) {
            // Try to delete from Supabase if we have an ID
            if (report.id && !report.id.startsWith('demo-')) {
                const { error } = await supabaseClient
                    .from('reports')
                    .delete()
                    .eq('id', report.id);
                
                if (error) {
                    console.error('Error deleting from Supabase:', error);
                } else {
                    console.log('Successfully deleted from Supabase:', report.id);
                }
            }
            
            // Delete from localStorage using created_at as unique identifier
            if (report.created) {
                deleteReportFromLocalStorage(report.created);
            }
        }
        
        // Show success message
        alert(`Đã xóa thành công ${selectedReports.length} báo cáo!`);
        
        // Reset delete mode and reload reports
        cancelDeleteMode();
    } catch (err) {
        console.error('Error deleting reports:', err);
        alert('Đã xảy ra lỗi khi xóa báo cáo. Vui lòng thử lại.');
        cancelDeleteMode();
    }
}

// Function to load reports on thong_ke_tin page from Supabase
async function loadReports(period) {
    try {
        // Check login status first
        if (!checkLoginStatus()) {
            return;
        }
        
        // Show loading state
        const reportTableBody = document.getElementById('reportTableBody');
        if (!reportTableBody) return;
        
        reportTableBody.innerHTML = '<tr><td colspan="7">Đang tải dữ liệu...</td></tr>';
        
        // Calculate date range based on period
        const now = new Date();
        let startDate;
        
        switch(period) {
            case '1month':
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                break;
            case '1period':
                startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
                break;
            case '6months':
                startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
                break;
            case '1year':
                startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        }
        
        // Format date for filtering
        const formattedStartDate = startDate.toISOString();
        
        console.log('Loading reports, start date:', formattedStartDate);
        
        // Try to get reports from Supabase first
        let reports = [];
        let useLocalStorage = false;
        
        try {
            const { data, error } = await supabaseClient
                .from('reports')
                .select('*')
                .gte('created_at', formattedStartDate)
                .order('created_at', { ascending: false });
            
            if (error) {
                console.error('Error loading reports from Supabase:', error);
                useLocalStorage = true;
            } else if (data && data.length > 0) {
                reports = data;
                console.log('Reports loaded from Supabase:', reports.length);
            } else {
                useLocalStorage = true;
            }
        } catch (err) {
            console.error('Supabase error:', err);
            useLocalStorage = true;
        }
        
        // If Supabase failed or returned no results, try localStorage
        if (useLocalStorage) {
            console.log('Using localStorage for reports');
            reports = getReportsFromLocalStorage(formattedStartDate);
            console.log('Reports loaded from localStorage:', reports.length);
        }
        
        // Clear existing rows
        reportTableBody.innerHTML = '';
        
        // Check if there are reports to display
        if (!reports || reports.length === 0) {
            console.log('No reports found, displaying demo data');
            displayDemoReports(reportTableBody, period);
            return;
        }
        
        // Display reports
        reports.forEach((report, index) => {
            const row = document.createElement('tr');
            
            // Format date
            const date = new Date(report.created_at);
            const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
            
            // Get display values
            const capBaoTinDisplay = getCapBaoTinDisplay(report.cap_bao_tin);
            const donViBaoDisplay = report.don_vi_bao;
            const formTypeDisplay = getFormTypeDisplay(report.form_type);
            
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${formattedDate}</td>
                <td style="text-align: left;">${report.tinh_hinh}</td>
                <td>${report.dia_ban}</td>
                <td>${capBaoTinDisplay}</td>
                <td>${donViBaoDisplay}</td>
                <td>${formTypeDisplay}</td>
                <td>
                    <button class="delete-btn" data-index="${index}" data-id="${report.id || ''}" data-created="${report.created_at}" style="background-color: #f44336; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">
                        Xóa
                    </button>
                </td>
            `;
            
            reportTableBody.appendChild(row);
        });
        
        // Add event listeners to delete buttons
        const deleteButtons = document.querySelectorAll('.delete-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', handleDeleteReport);
        });
        
        // Update period title
        const periodTitle = document.getElementById('periodTitle');
        if (periodTitle) {
            periodTitle.textContent = getPeriodDisplay(period);
        }
        
        // Update period links
        const periodLinks = document.querySelectorAll('.period-link');
        periodLinks.forEach(link => {
            const linkPeriod = link.getAttribute('data-period');
            if (linkPeriod === period) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    } catch (err) {
        console.error('Error loading reports:', err);
        const reportTableBody = document.getElementById('reportTableBody');
        if (reportTableBody) {
            reportTableBody.innerHTML = '<tr><td colspan="7">Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại.</td></tr>';
        }
    }
}

// Function to get reports from localStorage filtered by date
function getReportsFromLocalStorage(startDateIso) {
    // Get reports from localStorage
    const reports = JSON.parse(localStorage.getItem('localReports') || '[]');
    
    // Filter by date if startDateIso is provided
    if (startDateIso) {
        return reports.filter(report => {
            return report.created_at >= startDateIso;
        });
    }
    
    return reports;
}

// Function to display demo reports when there's an RLS error
function displayDemoReports(tableBody, period) {
    // Create some demo data
    const demoReports = [];
    
    // Clear table
    tableBody.innerHTML = '';
    
    // Add demo data to table
    demoReports.forEach((report, index) => {
        const row = document.createElement('tr');
        
        // Format date
        const formattedDate = `${report.date.getDate()}/${report.date.getMonth() + 1}/${report.date.getFullYear()}`;
        
        // Get display values
        const capBaoTinDisplay = getCapBaoTinDisplay(report.cap_bao_tin);
        const donViBaoDisplay = report.don_vi_bao;
        const formTypeDisplay = getFormTypeDisplay(report.form_type);
        
        // Create a unique ID for demo reports
        const demoId = 'demo-' + Date.now() + '-' + index;
        const createdAt = report.date.toISOString();
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${formattedDate}</td>
            <td style="text-align: left;">${report.tinh_hinh}</td>
            <td>${report.dia_ban}</td>
            <td>${capBaoTinDisplay}</td>
            <td>${donViBaoDisplay}</td>
            <td>${formTypeDisplay}</td>
            <td>
                <button class="delete-btn" data-index="${index}" data-id="${demoId}" data-created="${createdAt}">
                    Xóa
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to delete buttons
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', handleDeleteReport);
    });
    
    // Update period title
    const periodTitle = document.getElementById('periodTitle');
    if (periodTitle) {
        periodTitle.textContent = getPeriodDisplay(period);
    }
}

// Helper function to get current period from URL
function getCurrentPeriod() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('period');
}

// Helper function to get display value for cap_bao_tin
function getCapBaoTinDisplay(capBaoTin) {
    const map = {
        'cap-bo': 'Cấp Bộ',
        'ban-giam-doc': 'Ban giám đốc',
        'lanh-dao-phong': 'Lãnh đạo phòng'
    };
    return map[capBaoTin] || capBaoTin;
}

// Helper function to get display value for form_type
function getFormTypeDisplay(formType) {
    const map = {
        'dac-tinh': 'ĐT',
        'cong-tac-vien': 'CTV',
        'co-so-bi-mat': 'CSBM'
    };
    return map[formType] || formType;
}

// Helper function to get display value for period
function getPeriodDisplay(period) {
    const map = {
        '1month': '1 Tháng',
        '1period': '1 Quý',
        '6months': '6 Tháng',
        '1year': '1 Năm'
    };
    return map[period] || period;
}

// Function to handle report deletion
async function handleDeleteReport(e) {
    if (!confirm('Bạn có chắc chắn muốn xóa báo cáo này?')) {
        return;
    }
    
    const index = e.target.getAttribute('data-index');
    const id = e.target.getAttribute('data-id');
    const created = e.target.getAttribute('data-created');
    
    console.log('Deleting report:', { index, id, created });
    
    try {
        // Try to delete from Supabase if we have an ID
        if (id) {
            const { error } = await supabaseClient
                .from('reports')
                .delete()
                .eq('id', id);
            
            if (error) {
                console.error('Error deleting from Supabase:', error);
            } else {
                console.log('Successfully deleted from Supabase');
            }
        }
        
        // Also delete from localStorage using created_at as unique identifier
        deleteReportFromLocalStorage(created);
        
        // Reload the current page to refresh the report list
        const urlParams = new URLSearchParams(window.location.search);
        const currentPeriod = urlParams.get('period') || '1month';
        loadReports(currentPeriod);
        
        alert('Báo cáo đã được xóa thành công!');
    } catch (err) {
        console.error('Error deleting report:', err);
        alert('Đã xảy ra lỗi khi xóa báo cáo. Vui lòng thử lại.');
    }
}

// Function to delete a report from localStorage
function deleteReportFromLocalStorage(createdAt) {
    // Get existing reports
    let reports = JSON.parse(localStorage.getItem('localReports') || '[]');
    
    // Filter out the report with matching created_at
    reports = reports.filter(report => report.created_at !== createdAt);
    
    // Save back to localStorage
    localStorage.setItem('localReports', JSON.stringify(reports));
    
    console.log('Report removed from localStorage:', createdAt);
}

// Function to check login status and redirect if not logged in
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn !== 'true') {
        alert('Vui lòng đăng nhập để truy cập trang này');
        window.location.href = 'login.html';
        return false;
    }
    return true;
}
