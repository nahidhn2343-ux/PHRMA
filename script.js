import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// ১. Firebase Configuration (আপনার আগেরটাই আছে)
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
const auth = getAuth(app);

// ২. Authentication Logic (অপরিবর্তিত)
window.handleSignUp = async () => {
    const fname = document.getElementById('signup-fname').value;
    const lname = document.getElementById('signup-lname').value;
    const email = document.getElementById('signup-email').value;
    const pass = document.getElementById('signup-password').value;
    if(!email || !pass) return alert("Please enter email and password.");
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        await updateProfile(userCredential.user, { displayName: `${fname} ${lname}` });
        alert("Account created successfully!");
        window.location.href = "index.html";
    } catch (error) { alert("Error: " + error.message); }
};

window.handleLogin = async () => {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-password').value;
    try {
        await signInWithEmailAndPassword(auth, email, pass);
        alert("Login successful!");
        window.location.href = "index.html";
    } catch (error) { alert("Incorrect email or password!"); }
};

window.loginWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, new GoogleAuthProvider());
        alert(`Welcome ${result.user.displayName}!`);
        window.location.href = "index.html";
    } catch (error) { console.error(error); }
};

// ৩. Product Data & UI Sync
let allProducts = [];
const famousGrid = document.getElementById('famous-grid');
const shopGrid = document.getElementById('shop-grid');

async function syncWithFirebase() {
    try {
        const querySnapshot = await getDocs(collection(db, "products"));
        let fbData = [];
        querySnapshot.forEach((doc) => {
            let data = doc.data();
            fbData.push({
                id: doc.id,
                name: data.name,
                price: parseFloat(data.price) || 0,
                img: data.image || data.imageUrl || "https://via.placeholder.com/200",
                isFamous: data.isFamous ?? true,
                category: data.category || "Medicine",
                about: data.about || "No description available."
            });
        });
        allProducts = fbData;
        updateUI(allProducts); // শুরুতে সব প্রোডাক্ট দেখাবে
    } catch (e) { console.error("Data Load Error:", e); }
}

// UI আপডেট ফাংশন (এখানে ২০টি প্রোডাক্টের লিমিট দেওয়া হয়েছে)
function updateUI(productsToShow) {
    // হোম পেজের জন্য ২০টি ফেমাস প্রোডাক্ট ফিল্টার
    if (famousGrid) {
        const famousProducts = productsToShow.filter(p => p.isFamous).slice(0, 20);
        renderUI(famousGrid, famousProducts);
    }
    if (shopGrid) renderUI(shopGrid, productsToShow);
}





// ৪. Render UI Function (অপরিবর্তিত লজিক)
function renderUI(container, productList) {
    if (!container) return;
    container.innerHTML = productList.map(product => `
        <div class="product-card bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-lg transition cursor-pointer" onclick="viewProduct('${product.id}')">
            <div class="h-40 flex items-center justify-center mb-4">
                <img src="${product.img}" class="h-full object-contain">
            </div>
            <h3 class="font-bold text-gray-900 truncate">${product.name}</h3>
            <p class="text-teal-600 font-extrabold">৳${product.price}</p>
            <button onclick="event.stopPropagation(); addToCart('${product.id}')" class="mt-4 bg-gray-900 text-white py-2 rounded-xl active:scale-95 transition">Add to Cart</button>
        </div>
    `).join('');
}

// ৫. Search Logic (নাম বা টাইপ অনুযায়ী ফিল্টারিং)
const searchInput = document.getElementById('mainSearch');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filtered = allProducts.filter(product => {
            return product.name.toLowerCase().includes(searchTerm) || 
                   product.category.toLowerCase().includes(searchTerm);
        });
        updateUI(filtered); // সার্চ রেজাল্ট অনুযায়ী UI আপডেট হবে
    });
}

// ৬. Product Detail Modal (Pop-up লজিক)
window.viewProduct = async (id) => {
    try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const product = docSnap.data();
            document.getElementById('modal-product-img').src = product.image || product.imageUrl || "https://via.placeholder.com/200";
            document.getElementById('modal-product-name').innerText = product.name;
            document.getElementById('modal-product-cat').innerText = product.category || "Medicine";
            document.getElementById('modal-product-price').innerText = product.price;
            
            // ডেসক্রিপশন অংশটি আপডেট
            document.getElementById('modal-product-about').innerText = product.about || "No description available.";
            
            document.getElementById('modal-add-to-cart').onclick = (e) => {
                e.stopPropagation();
                addToCart(id);
                closeProductModal();
            };

            const modal = document.getElementById('product-detail-modal');
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            document.body.style.overflow = 'hidden'; // পপআপ চলাকালীন পেজ স্ক্রল বন্ধ থাকবে
        }
    } catch (error) { console.error("Modal Error:", error); }
};

window.closeProductModal = () => {
    const modal = document.getElementById('product-detail-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = 'auto';
};

// ৭. Cart Logic (অপরিবর্তিত)
window.addToCart = (productId) => {
    const product = allProducts.find(p => p.id === productId);
    if(!product) return;
    let cart = JSON.parse(localStorage.getItem('PHRMA_CART')) || [];
    const item = cart.find(i => i.id === productId);
    item ? item.qty += 1 : cart.push({...product, qty: 1});
    localStorage.setItem('PHRMA_CART', JSON.stringify(cart));
    updateCartBadge();
    alert(`${product.name} Added to cart!`);
};

function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    if (badge) {
        const cart = JSON.parse(localStorage.getItem('PHRMA_CART')) || [];
        badge.innerText = cart.reduce((t, i) => t + i.qty, 0);
    }
}

// ৮. Responsive Side Menu Logic
document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('menu-btn');
    const closeBtn = document.getElementById('close-btn');
    const sideMenu = document.getElementById('side-menu');
    const sideContent = sideMenu ? sideMenu.querySelector('div') : null;

    if (menuBtn && sideMenu && sideContent) {
        menuBtn.addEventListener('click', () => {
            sideMenu.classList.remove('hidden');
            setTimeout(() => {
                sideMenu.classList.add('opacity-100');
                sideContent.classList.remove('translate-x-full');
                sideContent.classList.add('translate-x-0');
            }, 10);
        });

        const closeMenu = () => {
            sideMenu.classList.remove('opacity-100');
            sideContent.classList.add('translate-x-full');
            sideContent.classList.remove('translate-x-0');
            setTimeout(() => sideMenu.classList.add('hidden'), 300);
        };

        closeBtn.addEventListener('click', closeMenu);
        sideMenu.addEventListener('click', (e) => {
            if (e.target === sideMenu) closeMenu();
        });
    }
});

// ৯. Page Initial Load
window.onload = () => {
    syncWithFirebase();
    updateCartBadge();
};



// শপ পেজের জন্য সার্চ ও ফিল্টার লজিক
const shopSearchInput = document.getElementById('shopSearch');
if (shopSearchInput) {
    shopSearchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filtered = allProducts.filter(p => 
            p.name.toLowerCase().includes(searchTerm) || 
            p.category.toLowerCase().includes(searchTerm)
        );
        updateResultsUI(filtered);
    });
}

window.filterByCategory = (category) => {
    const filtered = (category === "All Products") ? 
        allProducts : allProducts.filter(p => p.category === category);
    updateResultsUI(filtered);
};

function updateResultsUI(products) {
    const noResult = document.getElementById('no-results');
    if (products.length === 0) {
        noResult.classList.remove('hidden');
    } else {
        noResult.classList.add('hidden');
    }
    renderUI(shopGrid, products);
}