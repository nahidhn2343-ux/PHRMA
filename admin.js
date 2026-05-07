import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
                <td class="px-4 py-5 text-slate-400">${data.location || 'N/A'}</td>
                <td class="px-4 py-5">
                    <span class="px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider ${data.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}">
                        ${data.status || 'Pending'}
                    </span>
                </td>
                <td class="px-4 py-5 text-right space-x-1">
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

window.confirmOrder = async (id) => {
    try { await updateDoc(doc(db, "orders", id), { status: "Confirmed" }); }
    catch (e) { console.error(e); }
};

window.deleteOrder = async (id) => {
    if(confirm("অর্ডারটি ডিলিট করতে চান?")) {
        try { await deleteDoc(doc(db, "orders", id)); }
        catch (e) { console.error(e); }
    }
};