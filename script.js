let salary = parseFloat(localStorage.getItem('web_salary_v2')) || 0.00;
let balance = parseFloat(localStorage.getItem('web_balance_v2')) || 0.00;
let transactions = JSON.parse(localStorage.getItem('web_transactions_v2')) || [];
let isDarkMode = localStorage.getItem('web_dark_mode') === 'true';
let currentCurrency = localStorage.getItem('web_currency') || '₹';
let currentLang = localStorage.getItem('web_lang') || 'hi';

function formatDate() {
    return new Date().toLocaleString(); // तारीख और समय के लिए
}

function updateUI() {
    // ... (तुम्हारा बाकी logic यहाँ रहेगा)
    transactionList.innerHTML = '';
    transactions.forEach(t => {
        const li = document.createElement('li');
        li.className = `transaction-item ${t.type}-type`;
        li.innerHTML = `
            <div><strong>${t.type === 'income' ? '➕' : '➖'} ${t.category}</strong><br>
            <small style="font-size:10px; opacity:0.6;">${t.date}</small></div>
            <div style="font-weight:bold;">${t.type === 'income' ? '+' : '-'}${currentCurrency}${t.amount.toFixed(2)}</div>
        `;
        transactionList.appendChild(li);
    });
}

function addTransaction(type) {
    const amount = parseFloat(document.getElementById('amount').value);
    let category = document.getElementById('category').value.trim();
    if (isNaN(amount) || amount <= 0) return;
    
    if (type === 'income') balance += amount;
    else balance -= amount;

    transactions.unshift({ type, amount, category: category || 'General', date: formatDate() });
    updateUI();
  
    // ... (बाकी logic)
}

