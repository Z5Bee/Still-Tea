const CART_KEY = "stillShoppingBag";

const products = {
    green: { name: "Green Tea", message: "still here.", image: "Images/Front/green.png" },
    white: { name: "White Tea", message: "still healing.", image: "Images/Front/white" },
    yellow: { name: "Yellow Tea", message: "still learning.", image: "Images/Front/yellow" },
    oolong: { name: "Oolong Tea", message: "still becoming.", image: "Images/Front/oolong" },
    puerh: { name: "Pu-Erh Tea", message: "still evolving.", image: "Images/Front/puerh" },
    black: { name: "Black Tea", message: "still enduring.", image: "Images/Front/black" }
};

function getCart() {
    try {
        const saved = JSON.parse(localStorage.getItem(CART_KEY));
        return Array.isArray(saved) ? saved : [];
    } catch (error) {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateBagCount();
}

function cartCount() {
    return getCart().reduce((total, item) => total + item.quantity, 0);
}

function updateBagCount() {
    document.querySelectorAll(".bag-button").forEach(button => {
        button.textContent = `Bag (${cartCount()})`;
        button.setAttribute("aria-label", `Shopping bag with ${cartCount()} items`);
    });
}

function addToCart(productId) {
    const cart = getCart();
    const existing = cart.find(item => item.id === productId);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            id: productId,
            name: products[productId].name,
            message: products[productId].message,
            image: products[productId].image,
            quantity: 1
        });
    }

    saveCart(cart);
}

function removeFromCart(productId) {
    const cart = getCart().filter(item => item.id !== productId);
    saveCart(cart);
    renderCart();
}

function ensureCartPanel() {
    if (document.querySelector(".cart-panel")) return;

    const panel = document.createElement("div");
    panel.className = "cart-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "Shopping bag");
    panel.setAttribute("aria-hidden", "true");

    panel.innerHTML = `
        <div class="cart-backdrop"></div>
        <aside class="cart-drawer">
            <div class="cart-header">
                <h2>Your Bag</h2>
                <button class="cart-close" type="button" aria-label="Close shopping bag">×</button>
            </div>
            <div class="cart-items"></div>
        </aside>
    `;

    document.body.appendChild(panel);

    panel.querySelector(".cart-close").addEventListener("click", closeCart);
    panel.querySelector(".cart-backdrop").addEventListener("click", closeCart);
}

function renderCart() {
    ensureCartPanel();

    const cart = getCart();
    const items = document.querySelector(".cart-items");

    if (!cart.length) {
        items.innerHTML = '<p class="cart-empty">Your bag is empty.</p>';
        return;
    }

    items.innerHTML = cart.map(item => `
        <article class="cart-item">
            <img src="${item.image}" alt="${item.name}">
            <div>
                <h3>${item.name}</h3>
                <p><em>${item.message}</em></p>
                <p>Quantity: ${item.quantity}</p>
                <button class="cart-remove" type="button" data-product="${item.id}">Remove</button>
            </div>
        </article>
    `).join("");

    items.querySelectorAll(".cart-remove").forEach(button => {
        button.addEventListener("click", () => removeFromCart(button.dataset.product));
    });
}

function openCart() {
    ensureCartPanel();
    renderCart();

    const panel = document.querySelector(".cart-panel");
    panel.classList.add("open");
    panel.setAttribute("aria-hidden", "false");
}

function closeCart() {
    const panel = document.querySelector(".cart-panel");
    if (!panel) return;

    panel.classList.remove("open");
    panel.setAttribute("aria-hidden", "true");
}

function setupBagButtons() {
    document.querySelectorAll(".shop-account").forEach(account => {
        let bagText = account.querySelector(".bag-button");

        if (!bagText) {
            bagText = Array.from(account.children).find(child =>
                child.textContent && child.textContent.includes("Bag")
            );

            if (bagText) bagText.classList.add("bag-button");
        }

        if (!bagText) return;

        bagText.setAttribute("role", "button");
        bagText.setAttribute("tabindex", "0");
        bagText.textContent = `Bag (${cartCount()})`;

        if (!bagText.dataset.cartReady) {
            bagText.dataset.cartReady = "true";

            bagText.addEventListener("click", openCart);
            bagText.addEventListener("keydown", event => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openCart();
                }
            });
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    setupBagButtons();
    updateBagCount();

    document.querySelectorAll("[data-add-to-bag]").forEach(button => {
        button.addEventListener("click", () => {
            addToCart(button.dataset.addToBag);
            button.textContent = "Added to Bag";

            window.setTimeout(() => {
                button.textContent = "Add to Bag";
            }, 900);
        });
    });
});
