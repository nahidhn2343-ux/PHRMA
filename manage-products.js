import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase Config
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

const productForm = document.getElementById('product-form');
const productList = document.getElementById('product-list');
const emptyState = document.getElementById('empty-state');

// ১. ডাটা রেন্ডার করা (Edit বাটনসহ)
onSnapshot(collection(db, "products"), (snapshot) => {
    productList.innerHTML = "";
    if (snapshot.empty) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
        snapshot.forEach((docSnap) => {
            const product = docSnap.data();
            const id = docSnap.id;

            const row = `
                <tr class="bg-white border border-slate-50 rounded-2xl group hover:bg-slate-50 transition-all">
                    <td class="px-6 py-5">
                        <div class="flex items-center gap-4">
                            <img src="${product.image}" class="w-10 h-10 rounded-xl object-cover bg-slate-100" onerror="this.src='https://via.placeholder.com/40'">
                            <span class="font-bold text-slate-700">${product.name}</span>
                        </div>
                    </td>
                    <td class="px-6 py-5 font-bold text-slate-900">৳ ${product.price}</td>
                    <td class="px-6 py-5 text-slate-500 text-xs font-semibold uppercase">${product.category}</td>
                    <td class="px-6 py-5">
                        <span class="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase">Active</span>
                    </td>
                    <td class="px-6 py-5 text-right space-x-2">
                        <button onclick="editProduct('${id}')" class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all">
                            <i class="fa-solid fa-pen-to-square text-xs"></i>
                        </button>
                        <button onclick="deleteProduct('${id}')" class="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all">
                            <i class="fa-solid fa-trash text-xs"></i>
                        </button>
                    </td>
                </tr>
            `;
            productList.innerHTML += row;
        });
    }
});

// ২. প্রোডাক্ট সেভ অথবা আপডেট করা
productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const productId = document.getElementById('p-id').value;

    const productData = {
        name: document.getElementById('p-name').value,
        price: document.getElementById('p-price').value,
        category: document.getElementById('p-cat').value,
        about: document.getElementById('p-about').value,
        image: document.getElementById('p-image').value,
        updatedAt: new Date()
    };

    try {
        if (productId) {
            // আইডি থাকলে আপডেট হবে
            await updateDoc(doc(db, "products", productId), productData);
            alert("Product update successful!");
        } else {
            // আইডি না থাকলে নতুন অ্যাড হবে
            productData.createdAt = new Date();
            await addDoc(collection(db, "products"), productData);
            alert("New product saved!");
        }
        productForm.reset();
        toggleModal('product-modal'); // HTML এ থাকা ফাংশন
    } catch (error) {
        console.error("Error:", error);
        alert("The task could not be completed!");
    }
});

// ৩. এডিট ফাংশন (ডাটা ফিল্ডে বসানো)
window.editProduct = async (id) => {
    try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            document.getElementById('p-id').value = id;
            document.getElementById('p-name').value = data.name;
            document.getElementById('p-price').value = data.price;
            document.getElementById('p-cat').value = data.category;
            document.getElementById('p-about').value = data.about;
            document.getElementById('p-image').value = data.image;
            
            toggleModal('product-modal', true); // Modal open in edit mode
        }
    } catch (error) {
        console.error("Error fetching product:", error);
    }
};

// ৪. ডিলিট ফাংশন
window.deleteProduct = async (id) => {
    if(confirm("Are you sure you want to delete this?")) {
        await deleteDoc(doc(db, "products", id));
    }
};