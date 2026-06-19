// ======================================
// GELJEMI PROMO SYSTEM
// ======================================

let currentMessengerLink = "";

document.addEventListener("DOMContentLoaded", () => {

    const promoContainer =
        document.getElementById("promosGrid");

    const promoDatabase =
        document.querySelectorAll(".promo-data");

    promoContainer.innerHTML = "";

    promoDatabase.forEach(promo => {

        const badge =
            promo.dataset.badge || "";

        const tag =
            promo.dataset.tag || "";

        const title =
            promo.dataset.title || "";

        const description =
            promo.dataset.description || "";

        const oldPrice =
            promo.dataset.oldprice || "";

        const newPrice =
            promo.dataset.newprice || "";

        const messenger =
            promo.dataset.messenger || "";

        promoContainer.innerHTML += `

        <div class="promo-card">

            <div class="promo-badge">
                ${badge}
            </div>

            <div class="promo-header">

                <span class="promo-tag">
                    ${tag}
                </span>

                <h3 class="promo-title">
                    ${title}
                </h3>

            </div>

            <p class="promo-desc">
                ${description}
            </p>

            <div class="promo-footer">

                <div class="price-container">

                    <span class="old-price">
                        ${oldPrice}
                    </span>

                    <span class="new-price">
                        ${newPrice}
                    </span>

                </div>

                <button
                    class="promo-btn"
                    data-title="${title}"
                    data-description="${description}"
                    data-price="${newPrice}"
                    data-link="${messenger}"
                    onclick="buyPromo(this)">

                    Buy Now

                </button>

            </div>

        </div>

        `;
    });

    document
    .getElementById("closeModalBtn")
    .addEventListener("click", closeModal);

    document
    .getElementById("messengerBtn")
    .addEventListener("click", openMessenger);

});


// ======================================
// BUY PROMO
// ======================================

function buyPromo(button) {

    const title =
        button.dataset.title;

    const description =
        button.dataset.description;

    const price =
        button.dataset.price;

    currentMessengerLink =
        button.dataset.link;

    const orderMessage =

`ORDER DETAILS

Promo: ${title}

Description:
${description}

Price:
${price}

`;

    navigator.clipboard.writeText(
        orderMessage
    );

    document.getElementById(
        "orderText"
    ).textContent = orderMessage;

    document.getElementById(
        "orderModal"
    ).classList.add("show");
}


// ======================================
// CLOSE MODAL
// ======================================

function closeModal() {

    document
    .getElementById("orderModal")
    .classList.remove("show");

}


// ======================================
// OPEN MESSENGER
// ======================================

function openMessenger() {

    window.open(
        currentMessengerLink,
        "_blank"
    );

}