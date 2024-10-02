// Firebase Configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY", // Replace with your Firebase API key
    authDomain: "YOUR_AUTH_DOMAIN", // Replace with your Firebase Auth domain
    projectId: "YOUR_PROJECT_ID", // Replace with your Firebase project ID
    storageBucket: "YOUR_STORAGE_BUCKET", // Replace with your Firebase storage bucket
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // Replace with your Firebase messaging sender ID
    appId: "YOUR_APP_ID" // Replace with your Firebase app ID
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Modal Elements
const loginModal = document.getElementById("login-modal");
const signupModal = document.getElementById("signup-modal");
const loginBtn = document.getElementById("login-btn");
const signupBtn = document.getElementById("signup-btn");
const logoutBtn = document.getElementById("logout-btn");
const closeModals = document.querySelectorAll(".close-modal");

// Open Login Modal
loginBtn.addEventListener("click", () => {
    loginModal.style.display = "block";
});

// Open Sign Up Modal
signupBtn.addEventListener("click", () => {
    signupModal.style.display = "block";
});

// Close Modals
closeModals.forEach(btn => {
    btn.addEventListener("click", () => {
        loginModal.style.display = "none";
        signupModal.style.display = "none";
    });
});

// Close Modals When Clicking Outside
window.addEventListener("click", (event) => {
    if (event.target == loginModal) {
        loginModal.style.display = "none";
    }
    if (event.target == signupModal) {
        signupModal.style.display = "none";
    }
});

// Handle Sign Up
const signupForm = document.getElementById("signup-form");
signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            signupForm.reset();
            signupModal.style.display = "none";
            alert("Sign Up Successful!");
        })
        .catch((error) => {
            console.error(error);
            alert(error.message);
        });
});

// Handle Login
const loginForm = document.getElementById("login-form");
loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            loginForm.reset();
            loginModal.style.display = "none";
            alert("Login Successful!");
        })
        .catch((error) => {
            console.error(error);
            alert(error.message);
        });
});

// Handle Logout
logoutBtn.addEventListener("click", () => {
    auth.signOut()
        .then(() => {
            alert("Logged Out Successfully!");
        })
        .catch((error) => {
            console.error(error);
            alert(error.message);
        });
});

// Auth State Listener
auth.onAuthStateChanged(user => {
    if (user) {
        logoutBtn.style.display = "block";
        loginBtn.style.display = "none";
        signupBtn.style.display = "none";
    } else {
        logoutBtn.style.display = "none";
        loginBtn.style.display = "block";
        signupBtn.style.display = "block";
    }
});

// Load Products on Products Page
if (document.getElementById("products-grid")) {
    const productsGrid = document.getElementById("products-grid");

    db.collection("products").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const product = doc.data();
            const productCard = document.createElement("div");
            productCard.classList.add("product-card");
            productCard.setAttribute("data-id", doc.id);
            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>$${product.price.toFixed(2)}</p>
                <a href="product.html?id=${doc.id}" class="buy-button">View Product</a>
            `;
            productsGrid.appendChild(productCard);
        });
    }).catch((error) => {
        console.error("Error fetching products: ", error);
    });
}

// Load Individual Product Details on Product Page
if (document.getElementById("product-details")) {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    const productDetails = document.getElementById("product-details");

    if (productId) {
        db.collection("products").doc(productId).get().then((doc) => {
            if (doc.exists) {
                const product = doc.data();
                productDetails.innerHTML = `
                    <img src="${product.image}" alt="${product.name}">
                    <div class="product-info">
                        <h2>${product.name}</h2>
                        <p>${product.description}</p>
                        <p><strong>Price:</strong> $${product.price.toFixed(2)}</p>
                        <button class="add-to-cart-button" data-id="${doc.id}">Add to Cart</button>
                    </div>
                `;
            } else {
                productDetails.innerHTML = "<p>Product not found.</p>";
            }
        }).catch((error) => {
            console.error("Error fetching product: ", error);
            productDetails.innerHTML = "<p>Error loading product.</p>";
        });
    }

    // Handle Add to Cart
    productDetails.addEventListener("click", function(event) {
        if (event.target.classList.contains("add-to-cart-button")) {
            const productId = event.target.getAttribute("data-id");
            addToCart(productId);
        }
    });
}

// Shopping Cart Functionality
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function addToCart(productId) {
    cart.push(productId);
    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Product added to cart!");
}

// Reviews Section (Simplified)
if (document.getElementById("reviews-container")) {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    const reviewsContainer = document.getElementById("reviews-container");

    if (productId) {
        db.collection("reviews").where("productId", "==", productId).orderBy("timestamp", "desc").get()
            .then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    const review = doc.data();
                    const reviewDiv = document.createElement("div");
                    reviewDiv.classList.add("review");

                    reviewDiv.innerHTML = `
                        <h4>${review.name} - <span class="review-rating">${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}</span></h4>
                        <p>${review.comment}</p>
                        <p><small>${new Date(review.timestamp.seconds * 1000).toLocaleDateString()}</small></p>
                    `;
                    reviewsContainer.appendChild(reviewDiv);
                });
            })
            .catch((error) => {
                console.error("Error fetching reviews: ", error);
            });
    }
}

// Handle Review Submission
const reviewForm = document.getElementById("review-form");
if (reviewForm) {
    reviewForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const rating = document.getElementById("review-rating").value;
        const comment = document.getElementById("review-comment").value;
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');

        if (!auth.currentUser) {
            alert("You must be logged in to leave a review.");
            return;
        }

        db.collection("reviews").add({
            productId: productId,
            name: auth.currentUser.email,
            rating: parseInt(rating),
            comment: comment,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            alert("Review submitted successfully!");
            reviewForm.reset();
            // Reload reviews
            window.location.reload();
        })
        .catch((error) => {
            console.error("Error adding review: ", error);
            alert("Error submitting review.");
        });
    });
}
