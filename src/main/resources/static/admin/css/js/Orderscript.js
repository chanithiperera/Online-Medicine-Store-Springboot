// Orderscript.js
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const orderTableBody = document.querySelector('#orderTableBody');
    const orderDetailModal = document.getElementById('orderDetailModal');
    const closeModalBtn = document.querySelector('.modal .close');
    const selectAllCheckbox = document.getElementById('selectAll');
    const exportOrdersBtn = document.getElementById('exportOrdersBtn');
    const printInvoicesBtn = document.getElementById('printInvoicesBtn');
    const applyBulkActionBtn = document.getElementById('applyBulkAction');
    const dateRangeSelect = document.getElementById('dateRange');
    const customDateRange = document.getElementById('customDateRange');
    const changeStatusSelect = document.getElementById('changeStatus');
    const statusUpdateBtn = document.querySelector('.status-update .btn-primary');
    const totalOrdersElement = document.querySelector('.order-summary .box:nth-child(1) .text h3');
    const pendingOrdersElement = document.querySelector('.order-summary .box:nth-child(2) .text h3');
    const processingOrdersElement = document.querySelector('.order-summary .box:nth-child(3) .text h3');
    const deliveredOrdersElement = document.querySelector('.order-summary .box:nth-child(4) .text h3');
    const avgOrderValueElement = document.querySelector('.order-summary .box:nth-child(5) .text h3');

    let orders = []; // Store fetched orders
    const itemsPerPage = 10; // Default items per page
    let currentPage = 1;

    // Fetch and Load Orders
    async function loadOrders(page = 1) {
        try {
            const response = await fetch(`/api/orders`);
            if (!response.ok) throw new Error('Failed to fetch orders');
            orders = await response.json();
            console.log('Fetched orders:', orders);

            // Update Summary Cards
            updateSummaryCards();

            // Render Table
            renderOrdersTable(page);
        } catch (error) {
            console.error('Error fetching orders:', error);
            showNotification('Failed to load orders');
        }
    }

    // Update Summary Cards
    function updateSummaryCards() {
        const totalOrders = orders.length;
        const pendingOrders = orders.filter(order => order.status.toLowerCase() === 'pending').length;
        const processingOrders = orders.filter(order => order.status.toLowerCase() === 'processing').length;
        const deliveredOrders = orders.filter(order => order.status.toLowerCase() === 'delivered').length;
        const avgOrderValue = totalOrders > 0 ? (orders.reduce((sum, order) => sum + order.totalAmount, 0) / totalOrders).toFixed(2) : 0;

        totalOrdersElement.textContent = totalOrders;
        pendingOrdersElement.textContent = pendingOrders;
        processingOrdersElement.textContent = processingOrders;
        deliveredOrdersElement.textContent = deliveredOrders;
        avgOrderValueElement.textContent = `LKR ${avgOrderValue}`;
    }

    // Render Orders Table
    function renderOrdersTable(page) {
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedOrders = orders.slice(start, end);

        orderTableBody.innerHTML = '';
        paginatedOrders.forEach(order => {
            const row = document.createElement('tr');
            const productNames = order.items.map(item => item.productName).join(', ');
            const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
            row.innerHTML = `
                <td><input type="checkbox" class="order-select" data-id="${order.id}"></td>
                <td>${order.id}</td>
                <td>${order.userEmail}</td>
                <td>${productNames}</td>
                <td>${totalQuantity}</td>
                <td><span class="status ${order.status.toLowerCase()}">${order.status}</span></td>
                <td>${new Date(order.orderDate).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                <td>LKR ${order.totalAmount.toFixed(2)}</td>
                <td class="action-buttons">
                    <button class="btn btn-view" data-id="${order.id}">View</button>
                    <button class="btn btn-edit" data-id="${order.id}">Edit</button>
                </td>
            `;
            orderTableBody.appendChild(row);
        });

        // Update Pagination
        updatePagination();

        // Reattach event listeners for view/edit buttons
        attachViewEditListeners();
        stripeTableRows();
    }

    // Update Pagination
    function updatePagination() {
        const totalPages = Math.ceil(orders.length / itemsPerPage);
        const pageInfo = document.querySelector('.page-info span');
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

        const pagination = document.querySelector('.pagination');
        pagination.innerHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
            btn.textContent = i;
            btn.addEventListener('click', () => {
                currentPage = i;
                renderOrdersTable(currentPage);
            });
            pagination.appendChild(btn);
        }
    }

    // Attach View/Edit Button Listeners
    function attachViewEditListeners() {
        const viewOrderBtns = document.querySelectorAll('.btn-view');
        const editOrderBtns = document.querySelectorAll('.btn-edit');

        viewOrderBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const orderId = btn.getAttribute('data-id');
                openOrderModal(orderId);
            });
        });

        editOrderBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const orderId = btn.getAttribute('data-id');
                console.log(`Editing order ${orderId}`);
                openOrderModal(orderId); // For now, open view modal
            });
        });
    }

    // Show Order Detail Modal
    async function openOrderModal(orderId) {
        try {
            const response = await fetch(`/api/orders/${orderId}`);
            if (!response.ok) throw new Error('Failed to fetch order details');
            const order = await response.json();

            // Update Modal Content
            document.querySelector('.modal-header .order-id').textContent = `#${order.id}`;
            document.querySelector('.modal-header .order-status').textContent = order.status;
            document.querySelector('.modal-header .order-status').className = `order-status ${order.status.toLowerCase()}`;
            document.querySelector('.order-date').textContent = new Date(order.orderDate).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
            document.querySelector('.customer-name').textContent = `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`;
            document.querySelector('.customer-email').textContent = order.userEmail;
            document.querySelector('.customer-phone').textContent = order.paymentDetails.cardNumber; // Adjust if phone is available
            document.querySelector('.subtotal').textContent = `LKR ${(order.totalAmount - 250).toFixed(2)}`; // Assuming 250 is shipping
            document.querySelector('.shipping').textContent = `LKR 250.00`;
            document.querySelector('.tax').textContent = `LKR 0.00`;
            document.querySelector('.total').textContent = `LKR ${order.totalAmount.toFixed(2)}`;

            // Update Order Items Table
            const itemsTableBody = document.querySelector('.items-table tbody');
            itemsTableBody.innerHTML = '';
            order.items.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>
                        <div class="item-info">
                            <span class="item-name">${item.productName}</span>
                            <span class="item-meta">${item.category}, Prescription: ${item.prescription}</span>
                        </div>
                    </td>
                    <td>LKR ${item.price.toFixed(2)}</td>
                    <td>${item.quantity}</td>
                    <td>LKR ${(item.price * item.quantity).toFixed(2)}</td>
                `;
                itemsTableBody.appendChild(row);
            });

            // Update Timeline
            updateOrderTimeline(order.status.toLowerCase());

            // Show Modal
            orderDetailModal.style.display = 'block';
        } catch (error) {
            console.error('Error fetching order details:', error);
            showNotification('Failed to load order details');
        }
    }

    // Close Modal
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            orderDetailModal.style.display = 'none';
        });
    }

    // Close Modal on Outside Click
    window.addEventListener('click', (e) => {
        if (e.target === orderDetailModal) {
            orderDetailModal.style.display = 'none';
        }
    });

    // Select All Orders
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', () => {
            const orderCheckboxes = document.querySelectorAll('.order-select');
            orderCheckboxes.forEach(checkbox => {
                checkbox.checked = selectAllCheckbox.checked;
            });
        });
    }

    // Update Order Status
    if (statusUpdateBtn) {
        statusUpdateBtn.addEventListener('click', async () => {
            const newStatus = changeStatusSelect.value;
            const orderId = document.querySelector('.modal-header .order-id').textContent.replace('#', '');

            try {
                const response = await fetch(`/api/orders/${orderId}/status`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: newStatus })
                });
                if (!response.ok) throw new Error('Failed to update status');
                const updatedOrder = await response.json();
                updateOrderTimeline(newStatus);
                document.querySelector('.modal-header .order-status').textContent = newStatus;
                document.querySelector('.modal-header .order-status').className = `order-status ${newStatus.toLowerCase()}`;
                showNotification(`Order #${orderId} status updated to ${newStatus}`);
                loadOrders(currentPage); // Refresh table
            } catch (error) {
                console.error('Error updating status:', error);
                showNotification('Failed to update order status');
            }
        });
    }

    // Date Range Filter
    if (dateRangeSelect) {
        dateRangeSelect.addEventListener('change', () => {
            if (dateRangeSelect.value === 'custom') {
                customDateRange.style.display = 'block';
            } else {
                customDateRange.style.display = 'none';
            }
        });
    }

    // Apply Filters
    const applyFilterBtn = document.querySelector('.btn-apply-filter');
    if (applyFilterBtn) {
        applyFilterBtn.addEventListener('click', async () => {
            const dateRange = dateRangeSelect.value;
            const orderStatus = document.getElementById('orderStatus').value;
            const paymentStatus = document.getElementById('paymentStatus').value;

            // Fetch filtered orders (requires backend support for filtering)
            try {
                let url = `/api/orders`;
                const params = new URLSearchParams();
                if (orderStatus) params.append('status', orderStatus);
                // Add date range and payment status filters if backend supports them
                if (dateRange !== 'all' && dateRange !== 'custom') {
                    params.append('dateRange', dateRange);
                }
                if (params.toString()) url += `?${params.toString()}`;
                const response = await fetch(url);
                if (!response.ok) throw new Error('Failed to fetch filtered orders');
                orders = await response.json();
                renderOrdersTable(1);
                updateSummaryCards();
                showNotification('Filters applied successfully');
            } catch (error) {
                console.error('Error applying filters:', error);
                showNotification('Failed to apply filters');
            }
        });
    }

    // Export Orders
    if (exportOrdersBtn) {
        exportOrdersBtn.addEventListener('click', () => {
            console.log('Exporting orders...');
            showNotification('Orders export started. The file will download shortly.');
            // Implement actual export logic (e.g., CSV download)
        });
    }

    // Print Invoices
    if (printInvoicesBtn) {
        printInvoicesBtn.addEventListener('click', () => {
            const selectedOrders = [];
            document.querySelectorAll('.order-select:checked').forEach(checkbox => {
                selectedOrders.push(checkbox.getAttribute('data-id'));
            });
            if (selectedOrders.length === 0) {
                alert('Please select at least one order to print');
                return;
            }
            console.log(`Printing invoices for orders: ${selectedOrders.join(', ')}`);
            window.print();
        });
    }

    // Change Items Per Page
    const perPageSelect = document.getElementById('perPage');
    if (perPageSelect) {
        perPageSelect.addEventListener('change', (e) => {
            const perPage = parseInt(e.target.value);
            currentPage = 1;
            renderOrdersTable(currentPage);
            showNotification(`Showing ${perPage} items per page`);
        });
    }

    // Initialize
    loadOrders();
    console.log('Order Management System initialized');
});

// Update Order Timeline (unchanged from original)
function updateOrderTimeline(status) {
    const steps = document.querySelectorAll('.timeline-step');
    steps.forEach(step => step.classList.remove('active'));

    const statusIndices = {
        'pending': 0,
        'confirmed': 1,
        'processing': 2,
        'shipped': 3,
        'delivered': 4
    };

    const statusIndex = statusIndices[status.toLowerCase()] || 0;

    for (let i = 0; i <= statusIndex; i++) {
        if (steps[i]) {
            steps[i].classList.add('active');
            if (i < statusIndex) {
                steps[i].querySelector('.step-date').textContent = getCurrentDateTime();
            }
        }
    }

    const modalStatusElement = document.querySelector('.modal-header .order-status');
    if (modalStatusElement) {
        modalStatusElement.className = `order-status ${status.toLowerCase()}`;
        modalStatusElement.textContent = status.charAt(0).toUpperCase() + status.slice(1);
    }
}

// Helper Functions (unchanged from original)
function getCurrentDateTime() {
    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[now.getMonth()];
    const day = now.getDate();
    const year = now.getFullYear();
    let hours = now.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${month} ${day}, ${year} - ${hours}:${minutes} ${ampm}`;
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification-toast';
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = 'var(--blue)';
    notification.style.color = 'white';
    notification.style.padding = '12px 20px';
    notification.style.borderRadius = '5px';
    notification.style.zIndex = '5000';
    notification.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
    notification.style.transition = 'opacity 0.3s ease';

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function stripeTableRows() {
    const rows = document.querySelectorAll('#orderTableBody tr');
    rows.forEach((row, index) => {
        if (index % 2 === 1) {
            row.style.backgroundColor = 'var(--grey)';
        }
    });
}