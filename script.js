const form = document.getElementById('exp-form');
const list = document.getElementById('list');
const monthTotalEl = document.getElementById('month-total');
const weekTotalEl = document.getElementById('week-total');
const dayTotalEl = document.getElementById('day-total');

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let myChart;

function refreshApp() {
    const now = new Date();
    const startOfToday = new Date().setHours(0,0,0,0);
    const lastWeek = new Date().setDate(now.getDate() - 7);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let dSum = 0, wSum = 0, mSum = 0;
    list.innerHTML = '';

    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    transactions.forEach((t, index) => {
        const tDate = new Date(t.date);
        const amt = parseFloat(t.amount);

        if (tDate >= startOfToday) dSum += amt;
        if (tDate >= lastWeek) wSum += amt;
        if (tDate >= startOfMonth) mSum += amt;

        const li = document.createElement('li');
        li.className = 'item';
        li.innerHTML = `
            <div class="item-meta">
                <strong>${t.desc}<span class="cat-badge">${t.category}</span></strong>
                <small>${tDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</small>
            </div>
            <div>
                <span class="amt-text">₹${amt.toLocaleString('en-IN')}</span>
                <span class="delete-icon" onclick="deleteTx(${index})">✕</span>
            </div>
        `;
        list.appendChild(li);
    });

    dayTotalEl.innerText = `₹${dSum.toLocaleString('en-IN')}`;
    weekTotalEl.innerText = `₹${wSum.toLocaleString('en-IN')}`;
    monthTotalEl.innerText = `₹${mSum.toLocaleString('en-IN')}`;

    localStorage.setItem('transactions', JSON.stringify(transactions));
    updateChart(startOfMonth);
}

function updateChart(startOfMonth) {
    const categories = ["Food", "Bills", "Education", "Transport", "Shopping", "Other"];
    const categoryData = categories.map(cat => {
        return transactions
            .filter(t => t.category === cat && new Date(t.date) >= startOfMonth)
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    });

    const ctx = document.getElementById('categoryChart').getContext('2d');
    if (myChart) myChart.destroy();

    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categories,
            datasets: [{
                data: categoryData,
                backgroundColor: ['#00d2d3', '#5f27cd', '#ff9f43', '#ee5253', '#fd9bd6', '#10ac84'],
                borderWidth: 0
            }]
        },
        options: {
            cutout: '70%',
            plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 20 } } }
        }
    });
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const entry = {
        desc: document.getElementById('desc').value,
        amount: document.getElementById('amt').value,
        category: document.getElementById('category').value,
        date: new Date().toISOString()
    };
    transactions.push(entry);
    form.reset();
    refreshApp();
});

function deleteTx(i) {
    transactions.splice(i, 1);
    refreshApp();
}

refreshApp();