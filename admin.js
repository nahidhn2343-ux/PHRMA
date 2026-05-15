import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, updateDoc, deleteDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDYzJkinF_J4ff9T5Bi9hESxlo_ue8Szs8",
    authDomain: "phrma-eb265.firebaseapp.com",
    projectId: "phrma-eb265",
    storageBucket: "phrma-eb265.firebasestorage.app",
    messagingSenderId: "79240146779",
    appId: "1:79240146779:web:d01a63247566aeb8ea347e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const orderRows = document.getElementById('order-rows');
const statTotal = document.getElementById('stat-total');
const statCompleted = document.getElementById('stat-completed');
const statPending = document.getElementById('stat-pending');

// Real-time listener for orders
onSnapshot(collection(db, "orders"), (snapshot) => {
    let total = 0, completed = 0, pending = 0;
    orderRows.innerHTML = ""; 

    snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const id = docSnap.id;
        total++;

        if (data.status === "Confirmed") completed++;
        else pending++;

        const row = `
            <tr class="hover:bg-slate-50 transition-all group">
                <td class="px-4 py-5 font-medium text-slate-400">#${id.slice(0, 5).toUpperCase()}</td>
                <td class="px-4 py-5 font-bold text-slate-700">${data.customerName || 'Customer'}</td>
                <td class="px-4 py-5 text-slate-400">${data.city || 'N/A'}</td>
                <td class="px-4 py-5">
                    <span class="px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider ${data.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}">
                        ${data.status || 'Pending'}
                    </span>
                </td>
                <td class="px-4 py-5 text-right flex items-center justify-end gap-2">
                    <button onclick="viewOrderDetails('${id}')" class="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-all" title="View All Data">
                        <i class="fa-solid fa-eye text-lg"></i>
                    </button>
                    ${data.status !== 'Confirmed' ? `<button onclick="confirmOrder('${id}')" class="bg-[#D9F99D] text-[#064E3B] px-4 py-2 rounded-xl text-xs font-bold hover:shadow-md transition">Confirm</button>` : ''}
                    <button onclick="deleteOrder('${id}')" class="text-rose-300 hover:text-rose-500 p-2 transition">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </td>
            </tr>
        `;
        orderRows.innerHTML += row;
    });

    statTotal.innerText = total;
    statCompleted.innerText = completed;
    statPending.innerText = pending;
});

// View Details Function - Mapping all user fields
window.viewOrderDetails = async (id) => {
    try {
        const orderSnap = await getDoc(doc(db, "orders", id));
        if (orderSnap.exists()) {
            const data = orderSnap.data();

            // Mapping HTML elements with data
            document.getElementById('view-name').innerText = data.customerName || 'N/A';
            document.getElementById('view-phone').innerText = data.phone || 'N/A';
            document.getElementById('view-email').innerText = data.email || 'Not Provided';
            document.getElementById('view-alt-phone').innerText = data.altPhone || 'None';
            document.getElementById('view-address').innerText = data.address || 'N/A';
            document.getElementById('view-city').innerText = data.city || 'N/A';
            document.getElementById('view-landmark').innerText = data.landmark || 'None';
            
            // Updated currency to $
            document.getElementById('view-total').innerText = `$${data.totalBill || data.total || '0'}`;

            const itemsList = document.getElementById('view-items-list');
            itemsList.innerHTML = "";
            
            if (data.items && data.items.length > 0) {
                data.items.forEach(item => {
                    itemsList.innerHTML += `
                        <div class="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                            <img src="${item.img}" class="w-14 h-14 object-contain bg-slate-50 rounded-xl p-1">
                            <div class="flex-grow">
                                <p class="font-bold text-slate-800 text-sm">${item.name}</p>
                                <p class="text-[10px] text-slate-400 font-bold uppercase">Qty: ${item.qty} | Price: $${item.price}</p>
                            </div>
                            <p class="font-black text-slate-900 text-sm">$${item.price * item.qty}</p>
                        </div>
                    `;
                });
            }

            // Show Modal and prevent scrolling
            document.getElementById('orderViewModal').classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    } catch (e) {
        console.error("Error fetching data:", e);
        alert("There was a problem loading the order details!");
    }
};

// Function to update order status
window.confirmOrder = async (id) => {
    try { 
        await updateDoc(doc(db, "orders", id), { status: "Confirmed" }); 
    }
    catch (e) { 
        console.error("Update failed:", e); 
    }
};

// Function to delete order with English confirmation
window.deleteOrder = async (id) => {
    if(confirm("Are you sure you want to delete this order?")) {
        try { 
            await deleteDoc(doc(db, "orders", id)); 
        }
        catch (e) { 
            console.error("Deletion failed:", e); 
        }
    }
};