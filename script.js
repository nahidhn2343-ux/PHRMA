import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

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



// নতুন একাউন্ট তৈরি
window.handleSignUp = async () => {
    const fname = document.getElementById('signup-fname').value;
    const lname = document.getElementById('signup-lname').value;
    const email = document.getElementById('signup-email').value;
    const pass = document.getElementById('signup-password').value;

    if(!email || !pass) return alert("Please enter your email and password.");

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        await updateProfile(userCredential.user, { displayName: `${fname} ${lname}` });
        alert("Account created successfully!");
        window.location.href = "index.html";
    } catch (error) {
        alert("mistake made: " + error.message);
    }
};

// লগইন লজিক
window.handleLogin = async () => {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-password').value;
    try {
        await signInWithEmailAndPassword(auth, email, pass);
        alert("Login successful!");
        window.location.href = "index.html";
    } catch (error) {
        alert("Incorrect email or password!");
    }
};

// গুগল ও ফেসবুক লগইন
window.loginWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, new GoogleAuthProvider());
        alert(`welcome ${result.user.displayName}!`);
        window.location.href = "index.html";
    } catch (error) { console.error(error); }
};

window.loginWithFacebook = async () => {
    try {
        const result = await signInWithPopup(auth, new FacebookAuthProvider());
        alert(`welcome ${result.user.displayName}!`);
        window.location.href = "index.html";
    } catch (error) { alert("Check Facebook login settings."); }
};




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
                img: data.imageUrl || data.image || "https://via.placeholder.com/200",
                isFamous: data.isFamous ?? true,
                category: data.category || data.disease || "Medicine"
            });
        });
        allProducts = fbData;
        updateUI();
    } catch (e) { console.log("Data Load Error"); }
}

function updateUI() {
    if (famousGrid) renderUI(famousGrid, allProducts.filter(p => p.isFamous).slice(0, 4));
    if (shopGrid) renderUI(shopGrid, allProducts);
}

function renderUI(container, productList) {
    if (!container) return;
    container.innerHTML = productList.map(product => `
        <div class="product-card bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-lg transition">
            <img src="${product.img}" class="h-40 object-contain mb-4">
            <h3 class="font-bold text-gray-900 truncate">${product.name}</h3>
            <p class="text-teal-600 font-extrabold">৳${product.price}</p>
            <button onclick="addToCart('${product.id}')" class="mt-4 bg-gray-900 text-white py-2 rounded-xl active:scale-95 transition">Add to Cart</button>
        </div>
    `).join('');
}





document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('menu-btn');
    const closeBtn = document.getElementById('close-btn');
    const sideMenu = document.getElementById('side-menu');
    const sideContent = sideMenu ? sideMenu.querySelector('div') : null;

    if (menuBtn && sideMenu && sideContent) {
        menuBtn.onclick = () => {
            sideMenu.classList.remove('hidden');
            setTimeout(() => {
                sideMenu.classList.add('opacity-100');
                sideContent.classList.remove('translate-x-full');
                sideContent.classList.add('translate-x-0');
            }, 10);
        };

        const closeMenu = () => {
            sideMenu.classList.remove('opacity-100');
            sideContent.classList.add('translate-x-full');
            sideContent.classList.remove('translate-x-0');
            setTimeout(() => sideMenu.classList.add('hidden'), 300);
        };

        closeBtn.onclick = closeMenu;
        sideMenu.onclick = (e) => {
            if (e.target === sideMenu) closeMenu();
        };
    }
});







// কার্ট ব্যাজ আপডেট
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





window.onload = () => {
    syncWithFirebase();
    updateCartBadge();
};