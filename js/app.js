// Mengambil data dari Local Storage atau membuat array kosong jika belum ada data
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let spendingChart = null;

// Mengambil elemen HTML berdasarkan ID
const form = document.getElementById('transaction-form');
const itemNameInput = document.getElementById('item-name');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const transactionList = document.getElementById('transaction-list');
const totalBalanceEl = document.getElementById('total-balance');

// Jalankan fungsi update UI saat halaman web selesai dimuat
document.addEventListener('DOMContentLoaded', () => {
    updateUI();
});

// Event listener saat form transaksi di-submit
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = itemNameInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const category = categoryInput.value;

    // Validasi input: memastikan semua field terisi dengan benar
    if (!name || isNaN(amount) || amount <= 0 || !category) {
        alert('Harap isi semua field dengan benar!');
        return;
    }

    // Membuat objek transaksi baru
    const transaction = { id: Date.now(), name, amount, category };
    transactions.push(transaction);
    
    // Menyimpan data ke Local Storage browser
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    updateUI();
    form.reset();
});

// Fungsi untuk menghapus transaksi berdasarkan ID
window.deleteTransaction = function(id) {
    transactions = transactions.filter(t => t.id !== id);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    updateUI();
}

// Fungsi utama untuk memperbarui tampilan aplikasi (Daftar, Total Saldo, dan Chart)
function updateUI() {
    // 1. Render Daftar Transaksi
    transactionList.innerHTML = '';
    if (transactions.length === 0) {
        transactionList.innerHTML = '<p style="color: #888; text-align: center;">Belum ada transaksi.</p>';
    } else {
        transactions.forEach(t => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="item-info">
                    <div class="item-title">${t.name}</div>
                    <div class="item-cost">$${t.amount.toFixed(2)}</div>
                    <div class="item-tag">${t.category}</div>
                </div>
                <button class="btn-delete" onclick="deleteTransaction(${t.id})">Delete</button>
            `;
            transactionList.appendChild(li);
        });
    }

    // 2. Hitung dan Tampilkan Total Saldo
    const total = transactions.reduce((sum, t) => sum + t.amount, 0);
    totalBalanceEl.textContent = `$${total.toFixed(2)}`;

    // 3. Hitung Data Kategori untuk Visual Chart
    const categoriesData = { Food: 0, Transport: 0, Fun: 0 };
    transactions.forEach(t => {
        if (categoriesData[t.category] !== undefined) {
            categoriesData[t.category] += t.amount;
        }
    });

    // 4. Gambar atau Perbarui Pie Chart menggunakan Chart.js
    const ctx = document.getElementById('spending-chart').getContext('2d');
    if (spendingChart) { spendingChart.destroy(); } // Hapus chart lama sebelum membuat yang baru

    spendingChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(categoriesData),
            datasets: [{
                data: Object.values(categoriesData),
                backgroundColor: ['#2ecc71', '#3498db', '#e67e22'], // Hijau, Biru, Jingga
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: 'bottom' } }
        }
    });
}
