import { auth, db } from './firebase-config.js';
import AuthManager from './auth.js';
import { 
    collection, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc, 
    getDocs, 
    query, 
    where,
    orderBy,
    onSnapshot 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

class FinanControl {
    constructor() {
        this.authManager = new AuthManager();
        this.userId = null;
        this.accounts = [];
        this.cards = [];
        this.transactions = [];
        this.budgets = [];
        this.reminders = [];
        this.categories = {
            expense: [
                'Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Educação',
                'Lazer', 'Vestuário', 'Telecomunicações', 'Impostos', 'Outros'
            ],
            income: [
                'Salário', 'Freelance', 'Investimentos', 'Vendas', 'Outros'
            ]
        };
        
        this.init();
    }

    init() {
        // Aguardar autenticação
        auth.onAuthStateChanged((user) => {
            if (user) {
                this.userId = user.uid;
                document.getElementById('userEmail').textContent = user.email;
                this.setupEventListeners();
                this.loadData();
                this.hideLoading();
            }
        });
    }

    hideLoading() {
        setTimeout(() => {
            document.getElementById('loadingScreen').style.display = 'none';
        }, 1000);
    }

    setupEventListeners() {
        // Navegação
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetScreen = e.currentTarget.dataset.screen;
                this.switchScreen(targetScreen);
            });
        });

        // Logout
        document.getElementById('btnLogout').addEventListener('click', async () => {
            await this.authManager.logout();
        });

        // Botões de adicionar
        document.getElementById('btnAddAccount').addEventListener('click', () => this.openAccountModal());
        document.getElementById('btnAddCard').addEventListener('click', () => this.openCardModal());
        document.getElementById('btnAddTransaction').addEventListener('click', () => this.openTransactionModal());
        document.getElementById('btnAddBudget').addEventListener('click', () => this.openBudgetModal());
        document.getElementById('btnAddReminder').addEventListener('click', () => this.openReminderModal());

        // Formulários
        document.getElementById('formAccount').addEventListener('submit', (e) => this.saveAccount(e));
        document.getElementById('formCard').addEventListener('submit', (e) => this.saveCard(e));
        document.getElementById('formTransaction').addEventListener('submit', (e) => this.saveTransaction(e));

        // Botões de cancelar modais
        document.getElementById('btnCancelAccount').addEventListener('click', () => this.closeModal('modalAccount'));
        document.getElementById('btnCancelCard').addEventListener('click', () => this.closeModal('modalCard'));
        document.getElementById('btnCancelTransaction').addEventListener('click', () => this.closeModal('modalTransaction'));

        // Filtros de transações
        document.getElementById('filterType').addEventListener('change', () => this.filterTransactions());
        document.getElementById('filterCategory').addEventListener('change', () => this.filterTransactions());
        document.getElementById('filterAccount').addEventListener('change', () => this.filterTransactions());
        document.getElementById('filterMonth').addEventListener('change', () => this.filterTransactions());

        // Mudança de tipo de transação
        document.getElementById('transactionType').addEventListener('change', () => this.updateTransactionCategories());

        // Data padrão para transação
        document.getElementById('transactionDate').valueAsDate = new Date();

        // Mês atual para orçamento
        const today = new Date();
        const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
        document.getElementById('budgetMonth').value = currentMonth;
        document.getElementById('budgetMonth').addEventListener('change', () => this.loadBudgets());

        // Período de relatórios
        document.getElementById('reportStartMonth').value = currentMonth;
        document.getElementById('reportEndMonth').value = currentMonth;
        document.getElementById('reportStartMonth').addEventListener('change', () => this.generateReports());
        document.getElementById('reportEndMonth').addEventListener('change', () => this.generateReports());
    }

    switchScreen(screenId) {
        // Remover active de todas as telas e botões
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('tab-active'));

        // Ativar tela e botão selecionados
        document.getElementById(screenId).classList.add('active');
        document.querySelector(`[data-screen="${screenId}"]`).classList.add('tab-active');

        // Recarregar dados específicos da tela
        if (screenId === 'screenDashboard') {
            this.updateDashboard();
        } else if (screenId === 'screenTransactions') {
            this.loadTransactions();
        } else if (screenId === 'screenBudget') {
            this.loadBudgets();
        } else if (screenId === 'screenReminders') {
            this.loadReminders();
        } else if (screenId === 'screenReports') {
            this.generateReports();
        }
    }

    // ========== CRUD CONTAS ==========
    openAccountModal(account = null) {
        document.getElementById('modalAccount').classList.remove('hidden');
        document.getElementById('modalAccount').classList.add('flex');

        if (account) {
            document.getElementById('accountId').value = account.id;
            document.getElementById('accountName').value = account.name;
            document.getElementById('accountBank').value = account.bank;
            document.getElementById('accountBalance').value = account.balance;
            document.getElementById('accountColor').value = account.color;
        } else {
            document.getElementById('formAccount').reset();
            document.getElementById('accountId').value = '';
        }
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.add('hidden');
        document.getElementById(modalId).classList.remove('flex');
    }

    async saveAccount(e) {
        e.preventDefault();

        const accountData = {
            userId: this.userId,
            name: document.getElementById('accountName').value,
            bank: document.getElementById('accountBank').value,
            balance: parseFloat(document.getElementById('accountBalance').value),
            color: document.getElementById('accountColor').value,
            type: 'bank',
            createdAt: new Date().toISOString()
        };

        const accountId = document.getElementById('accountId').value;

        try {
            if (accountId) {
                await updateDoc(doc(db, 'accounts', accountId), accountData);
            } else {
                await addDoc(collection(db, 'accounts'), accountData);
            }

            this.closeModal('modalAccount');
            this.loadAccounts();
        } catch (error) {
            console.error('Erro ao salvar conta:', error);
            alert('Erro ao salvar conta!');
        }
    }

    async loadAccounts() {
        try {
            const q = query(
                collection(db, 'accounts'),
                where('userId', '==', this.userId),
                where('type', '==', 'bank')
            );

            const querySnapshot = await getDocs(q);
            this.accounts = [];

            querySnapshot.forEach((doc) => {
                this.accounts.push({ id: doc.id, ...doc.data() });
            });

            this.renderAccounts();
            this.updateDashboard();
        } catch (error) {
            console.error('Erro ao carregar contas:', error);
        }
    }

    renderAccounts() {
        const container = document.getElementById('accountsList');
        
        if (this.accounts.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-sm text-center py-4">Nenhuma conta cadastrada</p>';
            return;
        }

        container.innerHTML = this.accounts.map(account => `
            <div class="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center" style="background-color: ${account.color}">
                        <i class="fas fa-university text-white"></i>
                    </div>
                    <div>
                        <h4 class="font-medium text-gray-800">${account.name}</h4>
                        <p class="text-xs text-gray-500">${account.bank}</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="font-bold text-gray-800">${this.formatCurrency(account.balance)}</p>
                    <button onclick="app.editAccount('${account.id}')" class="text-xs text-indigo-600 hover:text-indigo-800">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                </div>
            </div>
        `).join('');
    }

    editAccount(accountId) {
        const account = this.accounts.find(a => a.id === accountId);
        if (account) {
            this.openAccountModal(account);
        }
    }

    // ========== CRUD CARTÕES ==========
    openCardModal(card = null) {
        document.getElementById('modalCard').classList.remove('hidden');
        document.getElementById('modalCard').classList.add('flex');

        if (card) {
            document.getElementById('cardId').value = card.id;
            document.getElementById('cardName').value = card.name;
            document.getElementById('cardBrand').value = card.brand;
            document.getElementById('cardLimit').value = card.limit;
            document.getElementById('cardClosingDay').value = card.closingDay;
            document.getElementById('cardDueDay').value = card.dueDay;
            document.getElementById('cardColor').value = card.color;
        } else {
            document.getElementById('formCard').reset();
            document.getElementById('cardId').value = '';
        }
    }

    async saveCard(e) {
        e.preventDefault();

        const cardData = {
            userId: this.userId,
            name: document.getElementById('cardName').value,
            brand: document.getElementById('cardBrand').value,
            limit: parseFloat(document.getElementById('cardLimit').value),
            closingDay: parseInt(document.getElementById('cardClosingDay').value),
            dueDay: parseInt(document.getElementById('cardDueDay').value),
            color: document.getElementById('cardColor').value,
            type: 'card',
            currentSpent: 0,
            createdAt: new Date().toISOString()
        };

        const cardId = document.getElementById('cardId').value;

        try {
            if (cardId) {
                await updateDoc(doc(db, 'accounts', cardId), cardData);
            } else {
                await addDoc(collection(db, 'accounts'), cardData);
            }

            this.closeModal('modalCard');
            this.loadCards();
        } catch (error) {
            console.error('Erro ao salvar cartão:', error);
            alert('Erro ao salvar cartão!');
        }
    }

    async loadCards() {
        try {
            const q = query(
                collection(db, 'accounts'),
                where('userId', '==', this.userId),
                where('type', '==', 'card')
            );

            const querySnapshot = await getDocs(q);
            this.cards = [];

            querySnapshot.forEach((doc) => {
                this.cards.push({ id: doc.id, ...doc.data() });
            });

            // Calcular gastos atuais
            await this.calculateCardSpending();
            
            this.renderCards();
            this.updateDashboard();
        } catch (error) {
            console.error('Erro ao carregar cartões:', error);
        }
    }

    async calculateCardSpending() {
        for (let card of this.cards) {
            const q = query(
                collection(db, 'transactions'),
                where('userId', '==', this.userId),
                where('accountId', '==', card.id),
                where('type', '==', 'expense')
            );

            const querySnapshot = await getDocs(q);
            let totalSpent = 0;

            querySnapshot.forEach((doc) => {
                const transaction = doc.data();
                // Considerar apenas transações do período atual da fatura
                totalSpent += transaction.amount;
            });

            card.currentSpent = totalSpent;
        }
    }

    renderCards() {
        const container = document.getElementById('cardsList');
        
        if (this.cards.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-sm text-center py-4">Nenhum cartão cadastrado</p>';
            return;
        }

        container.innerHTML = this.cards.map(card => {
            const available = card.limit - card.currentSpent;
            const percentage = (card.currentSpent / card.limit) * 100;

            return `
                <div class="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center space-x-3">
                            <div class="w-10 h-10 rounded-full flex items-center justify-center" style="background-color: ${card.color}">
                                <i class="fas fa-credit-card text-white"></i>
                            </div>
                            <div>
                                <h4 class="font-medium text-gray-800">${card.name}</h4>
                                <p class="text-xs text-gray-500">${card.brand}</p>
                            </div>
                        </div>
                        <button onclick="app.editCard('${card.id}')" class="text-xs text-indigo-600 hover:text-indigo-800">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                    </div>
                    <div class="mt-3">
                        <div class="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Disponível: ${this.formatCurrency(available)}</span>
                            <span>Limite: ${this.formatCurrency(card.limit)}</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2">
                            <div class="bg-gradient-to-r from-green-400 to-red-500 h-2 rounded-full" style="width: ${percentage}%"></div>
                        </div>
                        <p class="text-xs text-gray-500 mt-1">Vencimento: dia ${card.dueDay}</p>
                    </div>
                </div>
            `;
        }).join('');
    }

    editCard(cardId) {
        const card = this.cards.find(c => c.id === cardId);
        if (card) {
            this.openCardModal(card);
        }
    }

    // ========== CRUD TRANSAÇÕES ==========
    openTransactionModal(transaction = null) {
        document.getElementById('modalTransaction').classList.remove('hidden');
        document.getElementById('modalTransaction').classList.add('flex');

        // Carregar opções de contas e categorias
        this.updateTransactionCategories();
        this.updateTransactionAccounts();

        if (transaction) {
            document.getElementById('transactionId').value = transaction.id;
            document.getElementById('transactionType').value = transaction.type;
            document.getElementById('transactionDescription').value = transaction.description;
            document.getElementById('transactionAmount').value = transaction.amount;
            document.getElementById('transactionCategory').value = transaction.category;
            document.getElementById('transactionAccount').value = transaction.accountId;
            document.getElementById('transactionDate').value = transaction.date;
            document.getElementById('transactionNotes').value = transaction.notes || '';
            this.updateTransactionCategories();
        } else {
            document.getElementById('formTransaction').reset();
            document.getElementById('transactionId').value = '';
            document.getElementById('transactionDate').valueAsDate = new Date();
        }
    }

    updateTransactionCategories() {
        const type = document.getElementById('transactionType').value;
        const categorySelect = document.getElementById('transactionCategory');
        
        categorySelect.innerHTML = this.categories[type].map(cat => 
            `<option value="${cat}">${cat}</option>`
        ).join('');
    }

    updateTransactionAccounts() {
        const accountSelect = document.getElementById('transactionAccount');
        const allAccounts = [...this.accounts, ...this.cards];
        
        accountSelect.innerHTML = allAccounts.map(acc => 
            `<option value="${acc.id}">${acc.name} ${acc.type === 'card' ? '(Cartão)' : '(Conta)'}</option>`
        ).join('');
    }

    async saveTransaction(e) {
        e.preventDefault();

        const transactionData = {
            userId: this.userId,
            type: document.getElementById('transactionType').value,
            description: document.getElementById('transactionDescription').value,
            amount: parseFloat(document.getElementById('transactionAmount').value),
            category: document.getElementById('transactionCategory').value,
            accountId: document.getElementById('transactionAccount').value,
            date: document.getElementById('transactionDate').value,
            notes: document.getElementById('transactionNotes').value,
            createdAt: new Date().toISOString()
        };

        const transactionId = document.getElementById('transactionId').value;

        try {
            if (transactionId) {
                await updateDoc(doc(db, 'transactions', transactionId), transactionData);
            } else {
                await addDoc(collection(db, 'transactions'), transactionData);
            }

            // Atualizar saldo da conta
            await this.updateAccountBalance(transactionData.accountId);

            this.closeModal('modalTransaction');
            this.loadTransactions();
        } catch (error) {
            console.error('Erro ao salvar transação:', error);
            alert('Erro ao salvar transação!');
        }
    }

    async updateAccountBalance(accountId) {
        // Recalcular saldo baseado em todas as transações
        const q = query(
            collection(db, 'transactions'),
            where('userId', '==', this.userId),
            where('accountId', '==', accountId)
        );

        const querySnapshot = await getDocs(q);
        let balance = 0;

        querySnapshot.forEach((doc) => {
            const transaction = doc.data();
            if (transaction.type === 'income') {
                balance += transaction.amount;
            } else {
                balance -= transaction.amount;
            }
        });

        const account = [...this.accounts, ...this.cards].find(a => a.id === accountId);
        if (account && account.type === 'bank') {
            await updateDoc(doc(db, 'accounts', accountId), { balance });
        }
    }

    async loadTransactions() {
        try {
            const q = query(
                collection(db, 'transactions'),
                where('userId', '==', this.userId),
                orderBy('date', 'desc')
            );

            const querySnapshot = await getDocs(q);
            this.transactions = [];

            querySnapshot.forEach((doc) => {
                this.transactions.push({ id: doc.id, ...doc.data() });
            });

            this.renderTransactions();
            this.populateFilters();
        } catch (error) {
            console.error('Erro ao carregar transações:', error);
        }
    }

    populateFilters() {
        // Categorias
        const categories = [...new Set(this.transactions.map(t => t.category))];
        const categoryFilter = document.getElementById('filterCategory');
        categoryFilter.innerHTML = '<option value="">Todas categorias</option>' +
            categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');

        // Contas
        const accounts = [...this.accounts, ...this.cards];
        const accountFilter = document.getElementById('filterAccount');
        accountFilter.innerHTML = '<option value="">Todas contas</option>' +
            accounts.map(acc => `<option value="${acc.id}">${acc.name}</option>`).join('');

        // Meses
        const months = [...new Set(this.transactions.map(t => t.date.substring(0, 7)))];
        const monthFilter = document.getElementById('filterMonth');
        monthFilter.innerHTML = '<option value="">Todos os meses</option>' +
            months.map(month => `<option value="${month}">${this.formatMonth(month)}</option>`).join('');
    }

    filterTransactions() {
        const type = document.getElementById('filterType').value;
        const category = document.getElementById('filterCategory').value;
        const account = document.getElementById('filterAccount').value;
        const month = document.getElementById('filterMonth').value;

        let filtered = this.transactions;

        if (type) filtered = filtered.filter(t => t.type === type);
        if (category) filtered = filtered.filter(t => t.category === category);
        if (account) filtered = filtered.filter(t => t.accountId === account);
        if (month) filtered = filtered.filter(t => t.date.startsWith(month));

        this.renderTransactions(filtered);
    }

    renderTransactions(transactions = this.transactions) {
        const container = document.getElementById('transactionsList');
        
        if (transactions.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-sm text-center py-4">Nenhuma transação encontrada</p>';
            return;
        }

        container.innerHTML = transactions.map(transaction => {
            const account = [...this.accounts, ...this.cards].find(a => a.id === transaction.accountId);
            const accountName = account ? account.name : 'Conta não encontrada';

            return `
                <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div class="flex items-center space-x-4">
                        <div class="w-12 h-12 rounded-full flex items-center justify-center ${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'}">
                            <i class="fas fa-arrow-${transaction.type === 'income' ? 'up' : 'down'} ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}"></i>
                        </div>
                        <div>
                            <h4 class="font-medium text-gray-800">${transaction.description}</h4>
                            <p class="text-xs text-gray-500">${transaction.category} • ${accountName}</p>
                            <p class="text-xs text-gray-400">${this.formatDate(transaction.date)}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}">
                            ${transaction.type === 'income' ? '+' : '-'} ${this.formatCurrency(transaction.amount)}
                        </p>
                        <button onclick="app.editTransaction('${transaction.id}')" class="text-xs text-indigo-600 hover:text-indigo-800">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    editTransaction(transactionId) {
        const transaction = this.transactions.find(t => t.id === transactionId);
        if (transaction) {
            this.openTransactionModal(transaction);
        }
    }

    // ========== DASHBOARD ==========
    async updateDashboard() {
        await this.loadAccounts();
        await this.loadCards();
        await this.loadTransactions();

        // Calcular totais
        const totalBalance = this.accounts.reduce((sum, acc) => sum + acc.balance, 0);
        const totalCardBalance = this.cards.reduce((sum, card) => sum + (card.limit - card.currentSpent), 0);

        document.getElementById('totalBalance').textContent = this.formatCurrency(totalBalance + totalCardBalance);

        // Receitas e despesas do mês atual
        const today = new Date();
        const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
        
        const monthTransactions = this.transactions.filter(t => t.date.startsWith(currentMonth));
        const monthIncome = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const monthExpense = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

        document.getElementById('monthIncome').textContent = this.formatCurrency(monthIncome);
        document.getElementById('monthExpense').textContent = this.formatCurrency(monthExpense);

        // Gráficos
        this.renderCategoryChart();
        this.renderMonthlyChart();
        this.renderUpcomingBills();
    }

    renderCategoryChart() {
        const ctx = document.getElementById('chartCategories');
        
        const expenses = this.transactions.filter(t => t.type === 'expense');
        const categoryData = {};

        expenses.forEach(t => {
            categoryData[t.category] = (categoryData[t.category] || 0) + t.amount;
        });

        if (window.categoryChart) window.categoryChart.destroy();

        window.categoryChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(categoryData),
                datasets: [{
                    data: Object.values(categoryData),
                    backgroundColor: [
                        '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6',
                        '#EC4899', '#14B8A6', '#F97316', '#06B6D4', '#84CC16'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    renderMonthlyChart() {
        const ctx = document.getElementById('chartMonthly');
        
        // Últimos 6 meses
        const months = [];
        const incomeData = [];
        const expenseData = [];

        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            months.push(this.formatMonth(monthStr));

            const monthTransactions = this.transactions.filter(t => t.date.startsWith(monthStr));
            incomeData.push(monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0));
            expenseData.push(monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0));
        }

        if (window.monthlyChart) window.monthlyChart.destroy();

        window.monthlyChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [
                    {
                        label: 'Receitas',
                        data: incomeData,
                        borderColor: '#10B981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Despesas',
                        data: expenseData,
                        borderColor: '#EF4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    async renderUpcomingBills() {
        const container = document.getElementById('upcomingBills');
        
        // Buscar lembretes dos próximos 7 dias
        await this.loadReminders();
        
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);

        const upcoming = this.reminders.filter(r => {
            const dueDate = new Date(r.dueDate);
            return dueDate >= today && dueDate <= nextWeek;
        }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

        if (upcoming.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-sm text-center py-4">Nenhum vencimento próximo</p>';
            return;
        }

        container.innerHTML = upcoming.slice(0, 5).map(reminder => `
            <div class="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                        <i class="fas fa-calendar-alt text-yellow-600"></i>
                    </div>
                    <div>
                        <h4 class="font-medium text-gray-800">${reminder.description}</h4>
                        <p class="text-xs text-gray-500">${this.formatDate(reminder.dueDate)}</p>
                    </div>
                </div>
                <p class="font-bold text-gray-800">${this.formatCurrency(reminder.amount)}</p>
            </div>
        `).join('');
    }

    // ========== ORÇAMENTOS ==========
    async loadBudgets() {
        const month = document.getElementById('budgetMonth').value;
        
        try {
            const q = query(
                collection(db, 'budgets'),
                where('userId', '==', this.userId),
                where('month', '==', month)
            );

            const querySnapshot = await getDocs(q);
            this.budgets = [];

            querySnapshot.forEach((doc) => {
                this.budgets.push({ id: doc.id, ...doc.data() });
            });

            this.renderBudgets(month);
        } catch (error) {
            console.error('Erro ao carregar orçamentos:', error);
        }
    }

    renderBudgets(month) {
        const container = document.getElementById('budgetsList');
        
        // Calcular gastos reais por categoria
        const monthTransactions = this.transactions.filter(t => 
            t.date.startsWith(month) && t.type === 'expense'
        );

        const categorySpending = {};
        monthTransactions.forEach(t => {
            categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
        });

        if (this.budgets.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-sm text-center py-4">Nenhum orçamento definido para este mês</p>';
            return;
        }

        container.innerHTML = this.budgets.map(budget => {
            const spent = categorySpending[budget.category] || 0;
            const percentage = (spent / budget.amount) * 100;
            const remaining = budget.amount - spent;

            return `
                <div class="p-4 border border-gray-200 rounded-lg">
                    <div class="flex justify-between items-center mb-2">
                        <h4 class="font-medium text-gray-800">${budget.category}</h4>
                        <span class="text-sm text-gray-600">
                            ${this.formatCurrency(spent)} de ${this.formatCurrency(budget.amount)}
                        </span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-3 mb-2">
                        <div class="h-3 rounded-full ${percentage > 100 ? 'bg-red-500' : percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'}" 
                             style="width: ${Math.min(percentage, 100)}%"></div>
                    </div>
                    <div class="flex justify-between text-xs">
                        <span class="${remaining >= 0 ? 'text-green-600' : 'text-red-600'}">
                            ${remaining >= 0 ? 'Restante' : 'Excedido'}: ${this.formatCurrency(Math.abs(remaining))}
                        </span>
                        <span class="text-gray-500">${percentage.toFixed(1)}%</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    openBudgetModal() {
        const month = document.getElementById('budgetMonth').value;
        const category = prompt('Categoria:');
        const amount = prompt('Valor do orçamento:');

        if (category && amount) {
            this.saveBudget(month, category, parseFloat(amount));
        }
    }

    async saveBudget(month, category, amount) {
        try {
            await addDoc(collection(db, 'budgets'), {
                userId: this.userId,
                month,
                category,
                amount,
                createdAt: new Date().toISOString()
            });

            this.loadBudgets();
        } catch (error) {
            console.error('Erro ao salvar orçamento:', error);
            alert('Erro ao salvar orçamento!');
        }
    }

    // ========== LEMBRETES ==========
    async loadReminders() {
        try {
            const q = query(
                collection(db, 'reminders'),
                where('userId', '==', this.userId),
                orderBy('dueDate', 'asc')
            );

            const querySnapshot = await getDocs(q);
            this.reminders = [];

            querySnapshot.forEach((doc) => {
                this.reminders.push({ id: doc.id, ...doc.data() });
            });

            this.renderReminders();
        } catch (error) {
            console.error('Erro ao carregar lembretes:', error);
        }
    }

    renderReminders() {
        const container = document.getElementById('remindersList');
        
        if (this.reminders.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-sm text-center py-4">Nenhum lembrete cadastrado</p>';
            return;
        }

        const today = new Date();

        container.innerHTML = this.reminders.map(reminder => {
            const dueDate = new Date(reminder.dueDate);
            const isOverdue = dueDate < today;
            const daysUntil = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

            return `
                <div class="flex items-center justify-between p-4 border ${isOverdue ? 'border-red-300 bg-red-50' : 'border-gray-200'} rounded-lg">
                    <div class="flex items-center space-x-3">
                        <div class="w-12 h-12 rounded-full ${isOverdue ? 'bg-red-100' : 'bg-blue-100'} flex items-center justify-center">
                            <i class="fas fa-bell ${isOverdue ? 'text-red-600' : 'text-blue-600'}"></i>
                        </div>
                        <div>
                            <h4 class="font-medium text-gray-800">${reminder.description}</h4>
                            <p class="text-xs text-gray-500">${this.formatDate(reminder.dueDate)}</p>
                            ${isOverdue ? 
                                '<p class="text-xs text-red-600 font-medium">Vencido!</p>' : 
                                `<p class="text-xs text-gray-400">Em ${daysUntil} dia(s)</p>`
                            }
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="font-bold text-gray-800">${this.formatCurrency(reminder.amount)}</p>
                        <button onclick="app.deleteReminder('${reminder.id}')" class="text-xs text-red-600 hover:text-red-800">
                            <i class="fas fa-trash"></i> Excluir
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    openReminderModal() {
        const description = prompt('Descrição do lembrete:');
        const amount = prompt('Valor:');
        const dueDate = prompt('Data de vencimento (AAAA-MM-DD):');

        if (description && amount && dueDate) {
            this.saveReminder(description, parseFloat(amount), dueDate);
        }
    }

    async saveReminder(description, amount, dueDate) {
        try {
            await addDoc(collection(db, 'reminders'), {
                userId: this.userId,
                description,
                amount,
                dueDate,
                createdAt: new Date().toISOString()
            });

            this.loadReminders();
        } catch (error) {
            console.error('Erro ao salvar lembrete:', error);
            alert('Erro ao salvar lembrete!');
        }
    }

    async deleteReminder(reminderId) {
        if (confirm('Deseja realmente excluir este lembrete?')) {
            try {
                await deleteDoc(doc(db, 'reminders', reminderId));
                this.loadReminders();
            } catch (error) {
                console.error('Erro ao excluir lembrete:', error);
                alert('Erro ao excluir lembrete!');
            }
        }
    }

    // ========== RELATÓRIOS ==========
    async generateReports() {
        // Implementar geração de relatórios
        console.log('Gerando relatórios...');
    }

    // ========== CARREGAMENTO INICIAL ==========
    async loadData() {
        await this.loadAccounts();
        await this.loadCards();
        await this.loadTransactions();
        await this.updateDashboard();
    }

    // ========== UTILITÁRIOS ==========
    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    formatDate(dateString) {
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('pt-BR');
    }

    formatMonth(monthString) {
        const [year, month] = monthString.split('-');
        const date = new Date(year, parseInt(month) - 1);
        return date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
    }
}

// Inicializar app
window.app = new FinanControl();
