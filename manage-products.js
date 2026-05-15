import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDYzJkinF_J4ff9T5Bi9hESxlo_ue8Szs8",
    authDomain: "phrma-eb265.firebaseapp.com",
    projectId: "phrma-eb265",
    storageBucket: "phrma-eb265.firebasestorage.app",
    messagingSenderId: "79240146779",
    appId: "1:79240146779:web:d01a63247566aeb8ea347e"
};

// Initialize Firebase (Avoid duplicate initialization)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

const productForm = document.getElementById('product-form');
const productList = document.getElementById('product-list');
const emptyState = document.getElementById('empty-state');

/**
 * 1. Data Rendering Logic
 * Listens to Firestore changes and updates the table UI
 */
onSnapshot(collection(db, "products"), (snapshot) => {
    productList.innerHTML = "";
    if (snapshot.empty) {
        emptyState?.classList.remove('hidden');
    } else {
        emptyState?.classList.add('hidden');
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
                    <td class="px-6 py-5 font-bold text-slate-900">$ ${product.price}</td>
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

/**
 * 2. Save or Update Product
 * Handles form submission for both new entries and updates
 */
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
            // Update existing document
            await updateDoc(doc(db, "products", productId), productData);
            alert("Product updated successfully!");
        } else {
            // Add new document
            productData.createdAt = new Date();
            await addDoc(collection(db, "products"), productData);
            alert("New product added successfully!");
        }
        productForm.reset();
        // Close modal if toggleModal function exists globally
        if(typeof toggleModal === 'function') toggleModal('product-modal'); 
    } catch (error) {
        console.error("Error saving data:", error);
        alert("Operation failed. Please check console for details.");
    }
});

/**
 * 3. Edit Function
 * Fetches data and populates form for editing
 */
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
            document.getElementById('p-about').value = data.about || "";
            document.getElementById('p-image').value = data.image;
            
            // Open modal in edit mode
            if(typeof toggleModal === 'function') toggleModal('product-modal', true);
        }
    } catch (error) {
        console.error("Error fetching product:", error);
    }
};

/**
 * 4. Delete Function
 * Removes product after user confirmation
 */
window.deleteProduct = async (id) => {
    if(confirm("Are you sure you want to delete this product?")) {
        try {
            await deleteDoc(doc(db, "products", id));
        } catch (error) {
            console.error("Error deleting product:", error);
            alert("Failed to delete product.");
        }
    }
};