document.addEventListener('DOMContentLoaded', function() {
    // SIDEBAR TOGGLE
    const menuBar = document.querySelector('#content nav .bx.bx-menu');
    const sidebar = document.getElementById('sidebar');

    if (menuBar && sidebar) {
        menuBar.addEventListener('click', function () {
            sidebar.classList.toggle('hide');
        });
    }

    // SIDEBAR ACTIVE STATE
    const currentPath = window.location.pathname.split('/').pop() || '/index.html';
    const sidebarLinks = document.querySelectorAll('#sidebar .side-menu li a');

    sidebarLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        const linkLi = link.parentElement;
        if (linkPath === currentPath) {
            linkLi.classList.add('active');
        } else {
            linkLi.classList.remove('active');
        }
    });

    // TODO LIST FUNCTIONALITY (only on pages with a todo list, e.g., index.html)
    const addTodoBtn = document.getElementById('add-todo-btn');
    const todoInputDiv = document.querySelector('.todo-input');
    const newTodoInput = document.getElementById('new-todo');
    const submitTodoBtn = document.getElementById('submit-todo');
    const todoList = document.querySelector('.todo-list');

    if (addTodoBtn && todoInputDiv && newTodoInput && submitTodoBtn && todoList) {
        // Load todos from localStorage
        const loadTodos = () => {
            const todos = JSON.parse(localStorage.getItem('todos')) || [
                'Verify new prescriptions',
                'Restock Paracetamol',
                'Reply to customer emails',
                'Dispatch 10 pending orders',
                'Check inventory alerts',
                'Update patient records',
                'Review sales report'
            ];
            todoList.innerHTML = '';
            todos.forEach(todo => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <p>${todo}</p>
                    <i class='bx bx-trash delete-todo'></i>
                `;
                todoList.appendChild(li);
            });
        };

        // Save todos to localStorage
        const saveTodos = () => {
            const todos = [];
            todoList.querySelectorAll('li p').forEach(p => {
                todos.push(p.textContent);
            });
            localStorage.setItem('todos', JSON.stringify(todos));
        };

        // Initial load
        loadTodos();

        // Toggle input field
        addTodoBtn.addEventListener('click', () => {
            todoInputDiv.style.display = todoInputDiv.style.display === 'none' ? 'flex' : 'none';
            newTodoInput.focus();
        });

        // Add new todo
        submitTodoBtn.addEventListener('click', () => {
            const todoText = newTodoInput.value.trim();
            if (todoText !== '') {
                const li = document.createElement('li');
                li.innerHTML = `
                    <p>${todoText}</p>
                    <i class='bx bx-trash delete-todo'></i>
                `;
                todoList.appendChild(li);
                newTodoInput.value = '';
                todoInputDiv.style.display = 'none';
                saveTodos();
            }
        });

        // Delete todo
        todoList.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-todo')) {
                e.target.parentElement.remove();
                saveTodos();
            }
        });

        // Submit todo with Enter key
        newTodoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                submitTodoBtn.click();
            }
        });
    }

    // MEDICINE MANAGEMENT (only on medicines.html)
    let medicines = JSON.parse(localStorage.getItem('medicines')) || [];

    // DOM elements for medicine management
    const medicineForm = document.getElementById('medicineForm');
    const medicineTableBody = document.getElementById('medicineTableBody');
    const medicineId = document.getElementById('medicineId');
    const medicineName = document.getElementById('medicineName');
    const medicineCategory = document.getElementById('medicineCategory');
    const medicinePrice = document.getElementById('medicinePrice');
    const medicineStock = document.getElementById('medicineStock');
    const medicineDescription = document.getElementById('medicineDescription');
    const prescriptionRequired = document.getElementById('prescriptionRequired');
    const formTitle = document.getElementById('form-title');
    const saveButton = document.getElementById('saveButton');
    const cancelButton = document.getElementById('cancelButton');

    // Check if medicine management elements exist (i.e., we're on medicines.html)
    if (medicineForm && medicineTableBody && medicineId && medicineName && medicineCategory && medicinePrice && medicineStock && medicineDescription && prescriptionRequired && formTitle && saveButton && cancelButton) {
        // Display medicines in the table
        function renderMedicines() {
            if (medicines.length === 0) {
                medicineTableBody.innerHTML = `
                    <tr>
                        <td colspan="7" class="empty-state">No medicines added yet</td>
                    </tr>
                `;
                return;
            }

            medicineTableBody.innerHTML = '';

            medicines.forEach(medicine => {
                let statusClass = '';
                let statusText = '';

                if (medicine.stock <= 0) {
                    statusClass = 'out-of-stock';
                    statusText = 'Out of Stock';
                } else if (medicine.stock <= 10) {
                    statusClass = 'low-stock';
                    statusText = 'Low Stock';
                } else {
                    statusClass = 'in-stock';
                    statusText = 'In Stock';
                }

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${medicine.name}</td>
                    <td>${medicine.category}</td>
                    <td>LKR ${parseFloat(medicine.price).toFixed(2)}</td>
                    <td>${medicine.stock}</td>
                    <td><span class="status ${statusClass}">${statusText}</span></td>
                    <td>${medicine.prescription}</td>
                    <td class="action-buttons">
                        <button class="btn btn-warning btn-edit" data-id="${medicine.id}">
                            <i class='bx bx-edit'></i>
                        </button>
                        <button class="btn btn-danger btn-delete" data-id="${medicine.id}">
                            <i class='bx bx-trash'></i>
                        </button>
                    </td>
                `;
                medicineTableBody.appendChild(tr);
            });

            document.querySelectorAll('.btn-edit').forEach(button => {
                button.addEventListener('click', editMedicine);
            });

            document.querySelectorAll('.btn-delete').forEach(button => {
                button.addEventListener('click', deleteMedicine);
            });
        }

        async function addMedicine(e) {
            e.preventDefault();

            if (!medicineForm.checkValidity()) {
                alert('Please fill all required fields');
                return;
            }

            const medicine = {
                id: medicineId.value ? parseInt(medicineId.value) : null, // Convert to integer
                name: medicineName.value,
                category: medicineCategory.value,
                price: parseFloat(medicinePrice.value),
                stock: parseInt(medicineStock.value),
                description: medicineDescription.value,
                prescription: prescriptionRequired.value || 'Yes'
            };

            try {
                const method = medicineId.value ? 'PUT' : 'POST';
                const url = medicineId.value ? `/api/products/${medicine.id}` : '/api/products';

                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(medicine)
                });

                if (!response.ok) {
                    throw new Error('Failed to save medicine');
                }

                // Get the updated product from the response
                const savedMedicine = await response.json();
                console.log('Medicine saved successfully:', savedMedicine);

                alert(medicineId.value ? 'Medicine updated successfully!' : 'Medicine added successfully!');
                resetForm();
                await loadMedicinesFromAPI(); // Refresh list with await
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred while saving the medicine.');
            }
        }


        async function loadMedicinesFromAPI() {
            try {
                const res = await fetch('/api/products');
                if (!res.ok) throw new Error('Failed to fetch medicines');

                medicines = await res.json();
                renderMedicines();
            } catch (err) {
                console.error(err);
                medicineTableBody.innerHTML = `<tr><td colspan="7" class="empty-state">Failed to load medicines</td></tr>`;
            }
        }


        function editMedicine(e) {
            const id = e.currentTarget.dataset.id;
            const medicine = medicines.find(med => med.id === id);

            if (!medicine) return;

            medicineId.value = medicine.id;
            medicineName.value = medicine.name;
            medicineCategory.value = medicine.category;
            medicinePrice.value = medicine.price;
            medicineStock.value = medicine.stock;
            medicineDescription.value = medicine.description;
            prescriptionRequired.value = medicine.prescriptionRequired;

            formTitle.textContent = 'Update Medicine';
            saveButton.textContent = 'Update Medicine';
            cancelButton.style.display = 'inline-block';

            document.querySelector('.medicine-form').scrollIntoView({ behavior: 'smooth' });
        }

        async function deleteMedicine(e) {
            const id = e.currentTarget.dataset.id;

            if (!confirm('Are you sure you want to delete this medicine?')) return;

            try {
                const response = await fetch(`/api/products/${id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    throw new Error('Failed to delete medicine');
                }

                alert('Medicine deleted successfully!');
                loadMedicinesFromAPI(); // Refresh list
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred while deleting the medicine.');
            }
        }


        function resetForm() {
            medicineId.value = '';
            medicineForm.reset();
            formTitle.textContent = 'Add Medicine';
            saveButton.textContent = 'Add Medicine';
            cancelButton.style.display = 'none';
        }

        renderMedicines();

        loadMedicinesFromAPI();

        medicineForm.addEventListener('submit', addMedicine);
        cancelButton.addEventListener('click', resetForm);
    }

    // DARK MODE TOGGLE
    const switchMode = document.getElementById('switch-mode');

    if (switchMode) {
        switchMode.addEventListener('change', function () {
            if (this.checked) {
                document.body.classList.add('dark');
            } else {
                document.body.classList.remove('dark');
            }
        });
    }
});