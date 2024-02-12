
document.addEventListener('DOMContentLoaded', function () {
    const authContainer = document.getElementById('authContainer');
    const loginForm = document.getElementById('loginForm');
    const logoutButton = document.getElementById('logoutButton');
    const transactionFormContainer = document.getElementById('transactionFormContainer');
    const transactionForm = document.getElementById('transactionForm');
    const dashboard = document.getElementById('dashboard');
    const transactionList = document.getElementById('transactionList');
    const currentBalance = document.getElementById('currentBalance');
    const report = document.getElementById('report');
    const totalIncome = document.getElementById('totalIncome');
    const totalExpenses = document.getElementById('totalExpenses');

    let isAuthenticated = false;

    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        // Simulate authentication (replace with actual authentication logic)
        if (username === 'user' && password === 'password') {
            isAuthenticated = true;
            toggleAuthViews();
        } else {
            alert('Invalid username or password');
        }
    });

    logoutButton.addEventListener('click', function () {
        isAuthenticated = false;
        toggleAuthViews();
    });


transactionForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    
    const date = document.getElementById('transactionDate').value;
    const category = document.getElementById('transactionCategory').value;
    const amount = parseFloat(document.getElementById('transactionAmount').value);

    try {
        const response = await fetch('/transactions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ date, category, amount }),
        });

        if (!response.ok) {
            throw new Error('Failed to add transaction');
        }

        
        const successMessage = document.getElementById('success-message');
        successMessage.textContent = 'Transaction added successfully';
        successMessage.style.display = 'block';

        // Reset the form fields after successful submission
        transactionForm.reset();

        

    } catch (error) {
        console.error(error);
        // Handle errors here, such as displaying an error message to the user
    }
});


async function toggleAuthViews() {
    if (isAuthenticated) {
        authContainer.style.display = 'none';
        transactionFormContainer.style.display = 'block';
        dashboard.style.display = 'block';
        report.style.display = 'block';
        logoutButton.style.display = 'block';

        // Fetch recent transactions, current balance, and monthly summary
        try {
            await Promise.all([
                fetchRecentTransactions(),
                fetchCurrentBalance(),
                fetchMonthlySummary()
            ]);
            
            // Display success message 
            const successMessage = document.getElementById('success-message');
            successMessage.textContent = 'Data loaded successfully';
            successMessage.style.display = 'block';
        } catch (error) {
            console.error('Failed to fetch data:', error);
            // Display error message to the user if any of the requests fail
            const errorMessage = document.getElementById('error-message');
            errorMessage.textContent = 'Failed to fetch data';
            errorMessage.style.display = 'block';
        }
    } else {
        authContainer.style.display = 'block';
        transactionFormContainer.style.display = 'none';
        dashboard.style.display = 'none';
        report.style.display = 'none';
        logoutButton.style.display = 'none';
    }
}


    
const transactionList = document.getElementById('transaction-list');
const currentBalanceElement = document.getElementById('current-balance');
const totalIncomeElement = document.getElementById('total-income');
const totalExpensesElement = document.getElementById('total-expenses');

async function fetchRecentTransactions() {
    try {
        const response = await fetch('/recent-transactions');
        const transactions = await response.json();

        // Clear existing transactions
        transactionList.innerHTML = '';

        // Populate transactionList with fetched transactions
        transactions.forEach(transaction => {
            const transactionItem = document.createElement('li');
            transactionItem.textContent = `Date: ${transaction.date}, Category: ${transaction.category}, Amount: ${transaction.amount}`;
            transactionList.appendChild(transactionItem);
        });

        return transactions;
    } catch (error) {
        console.error('Failed to fetch recent transactions:', error);
        throw error;
    }
}

async function fetchCurrentBalance() {
    try {
        const response = await fetch('/current-balance');
        const { balance } = await response.json();

        // Update current balance element with fetched balance
        currentBalanceElement.textContent = balance;

        return balance;
    } catch (error) {
        console.error('Failed to fetch current balance:', error);
        throw error;
    }
}

async function fetchMonthlySummary() {
    try {
        const response = await fetch('/monthly-summary');
        const { totalIncome, totalExpenses } = await response.json();

        // Update total income and total expenses elements with fetched values
        totalIncomeElement.textContent = totalIncome;
        totalExpensesElement.textContent = totalExpenses;

        return { totalIncome, totalExpenses };
    } catch (error) {
        console.error('Failed to fetch monthly summary:', error);
        throw error;
    }
}
