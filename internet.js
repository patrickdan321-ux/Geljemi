document.addEventListener("DOMContentLoaded", () => {
    const networkCards = document.querySelectorAll(".network-card");
    networkCards.forEach(card => {
        card.addEventListener("click", () => {
            const network = card.dataset.network;
            if (network) {
                showPromos(network);
            }
        });
    });
});

function showNetworks(event){
    if(event) event.preventDefault();
    document.getElementById("networkSelectionView").classList.remove("hidden");
    document.getElementById("promoListView").classList.add("hidden");
}

function showPromos(network){
    const promoGrid = document.getElementById("dynamicPromoGrid");
    if (!promoGrid) return;
    
    promoGrid.innerHTML = "";
    document.getElementById("networkTitleText").textContent = network;
    
    const promos = document.querySelectorAll(".promo-data");
    promos.forEach(promo => {
        if(promo.dataset.network && promo.dataset.network.trim() === network.trim()){
            const title = promo.querySelector("h3") ? promo.querySelector("h3").textContent : "Promo Package";
            const desc = promo.querySelector("p") ? promo.querySelector("p").textContent : "";
            
            // Extract the prices from the attributes
            const oldPrice = promo.dataset.oldprice || "";
            const newPrice = promo.dataset.newprice || "";
            
            // Escape quotes for safe JavaScript execution
            const cleanDesc = desc.replace(/'/g, "\\'");
            const cleanProduct = `${network} - ${title}`.replace(/'/g, "\\'");
            
            promoGrid.innerHTML += `
                <div class="promo-card">
                    <h2>${title}</h2>
                    <p>${desc}</p>
                    
                    <div class="price-container">
                        <div class="price-box">
                            <span class="old-price">${oldPrice}</span>
                            <span class="new-price">${newPrice}</span>
                        </div>
                    </div>

                    <button class="buy-btn" onclick="buyPromo('${cleanProduct}', '${cleanDesc}', '${newPrice}')">
                        Buy Now
                    </button>
                </div>
            `;
        }
    });

    document.getElementById("networkSelectionView").classList.add("hidden");
    document.getElementById("promoListView").classList.remove("hidden");
}

function buyPromo(product, description, price) {
    // Inserts Title, Description, and Final Price automatically to the Messenger order template
    let text = `ORDER DETAILS\nPromo: ${product}\nDescription: ${description}\nPrice: ${price}\n`;

    const currentPath = window.location.pathname.toLowerCase();

    if (currentPath.includes("gaming")) {
        text += `Game ID:\nServer ID:\nIn-Game Name:\n`;
    } 
    else if (currentPath.includes("streaming")) {
        text += `Account Email:\nPassword / Profile PIN:\nDuration:\n`;
    } 
 
    else if (currentPath.includes("tools")) {
        text += `Registered Account Email:\nSubscription Duration:\n`;
    } 
     else if (currentPath.includes("boosting")) {
        text += `Social Media link:\nQuantity:\n`; }
    else {
        text += `Simcard Network:\nSimcard Number:\nCustomer Name:\n`;
    }

    document.getElementById("promoText").textContent = text;

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(err => console.error("Clipboard failure:", err));
    } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try { document.execCommand('copy'); } catch (err) { console.error(err); }
        document.body.removeChild(textArea);
    }

    document.getElementById("popup").classList.add("active");
}

function handleMessengerRedirect() {
    alert("Order details template copied to clipboard!\n\nJust long-press and click 'Paste' when your Messenger chat opens.");
}

function closePopup() {
    document.getElementById("popup").classList.remove("active");
}
