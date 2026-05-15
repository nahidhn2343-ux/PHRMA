import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

const productList = document.getElementById('product-list');
const productForm = document.getElementById('productForm');
const modal = document.getElementById('productModal');

// --- Functions ---
window.openModal = () => {
    productForm.reset();
    document.getElementById('productId').value = "";
    modal.classList.remove('hidden');
};

window.closeModal = () => modal.classList.add('hidden');

// Real-time Data Fetching
onSnapshot(collection(db, "products"), (snapshot) => {
    productList.innerHTML = "";
    snapshot.forEach((docSnap) => {
        const p = docSnap.data();
        const id = docSnap.id;

        const row = `
            <tr class="hover:bg-slate-50 transition-all">
                <td class="px-4 py-5">
                    <div class="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden border border-slate-50 shadow-sm">
                        <img src="${p.imageUrl}" class="w-full h-full object-cover">
                    </div>
                </td>
                <td class="px-4 py-5">
                    <p class="font-bold text-slate-800">${p.name}</p>
                    <p class="text-[10px] text-slate-400 truncate w-48">${p.desc || 'No description'}</p>
                </td>
                <td class="px-4 py-5 font-bold text-[#064E3B]">$${p.price}</td>
                <td class="px-4 py-5">
                    <span class="px-2 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black">${p.offer}% OFF</span>
                </td>
                <td class="px-4 py-5 text-right space-x-2">
                    <button onclick="editProduct('${id}', '${p.name}', '${p.price}', '${p.offer}', '${p.imageUrl}', '${p.desc}')" class="text-blue-400 hover:text-blue-600"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button onclick="deleteProduct('${id}')" class="text-rose-300 hover:text-rose-500"><i class="fa-solid fa-trash-can"></i></button>
                </td>
            </tr>
        `;
        productList.innerHTML += row;
    });
});

// Add or Update Product
productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('productId').value;
    const data = {
        name: document.getElementById('name').value,
        price: document.getElementById('price').value,
        offer: document.getElementById('offer').value,
        imageUrl: document.getElementById('imageUrl').value,
        desc: document.getElementById('desc').value
    };

    try {
        if (id) {
            await updateDoc(doc(db, "products", id), data);
            alert("Product updated successfully!");
        } else {
            await addDoc(collection(db, "products"), data);
            alert("Product added successfully!");
        }
        closeModal();
    } catch (e) { 
        alert("Error saving product: " + e); 
    }
});

// Delete Product
window.deleteProduct = async (id) => {
    if(confirm("Are you sure you want to delete this product?")) {
        await deleteDoc(doc(db, "products", id));
    }
};

// Edit Product Helper
window.editProduct = (id, name, price, offer, img, desc) => {
    openModal();
    document.getElementById('productId').value = id;
    document.getElementById('name').value = name;
    document.getElementById('price').value = price;
    document.getElementById('offer').value = offer;
    document.getElementById('imageUrl').value = img;
    document.getElementById('desc').value = desc;
};