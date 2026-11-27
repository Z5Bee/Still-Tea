// =========================
// STARTING MESSAGES
// =========================

const startingQuotes = [
    "You are allowed to begin again.",
    "There is still time to become.",
    "The sun will find you again.",
    "Growing quietly is still growing.",
    "You haven't met every version of yourself yet.",
    "There are still good days you haven't lived.",
    "You can be afraid and still move forward.",
    "Not every day needs to be extraordinary.",
    "You are more than your hardest day.",
    "Even the sun takes time to rise.",
    "You are allowed to outgrow who you were.",
    "There is no deadline for becoming yourself.",
    "Something beautiful may be waiting for you.",
    "You don't need all the answers today.",
    "There is beauty in being unfinished.",
    "Tomorrow is another possibility.",
    "You are worthy of the kindness you give.",
    "Uncertainty leaves room for possibility.",
    "There is more to your story.",
    "Somewhere, someone is glad you exist."
];


// =========================
// CONNECT TO HTML
// =========================

const leafContainer = document.getElementById("leaves");
const quoteText = document.getElementById("quote-text");
const quoteAuthor = document.getElementById("quote-author");
const leafCount = document.getElementById("leaf-count");

const form = document.getElementById("quote-form");
const messageInput = document.getElementById("message");
const authorInput = document.getElementById("author");

const characterCount = document.getElementById("character-count");
const successMessage = document.getElementById("success-message");

const randomButton = document.getElementById("random-leaf");

const svgNS = "http://www.w3.org/2000/svg";


// =========================
// LEAF COLORS
// =========================

const leafColors = [
    "#526b43",
    "#71885b",
    "#91a575",
    "#a8b88a",
    "#405d38",
    "#647d4c"
];


// =========================
// LEAF POSITIONS
// =========================

// Each position contains:
// horizontal position, vertical position, rotation

const positions = [
    [500, 170, -70], [500, 200, 55], [555, 220, -70], [535, 225, 65],
    [700, 230, -30], [340, 300, -20], [520, 320, 45], [500, 370, 75],
    [320, 360, -80], [320, 390, -35], [420, 380, 20], [460, 430, 55],
    [280, 500, -55], [356, 460, -10], [435, 520, 80],
    [340, 600, -75], [400, 620, 15], [370, 640, 55],
    [365, 740, -35], [390, 760, 70],
    [390, 850, -20], [420, 900, 20]
];

const extraPositions = [
    [470, 170, -45], [520, 190, 40], [315, 250, -60], [580, 260, 65],
    [250, 330, -75], [350, 340, -30], [610, 350, 55], [230, 430, -60],
    [325, 430, -20], [500, 440, 35], [570, 480, 70], [220, 540, -45],
    [320, 550, -25], [455, 550, 30], [530, 590, 55], [280, 620, -55],
    [380, 630, 10], [475, 680, 45], [330, 700, -30], [430, 720, 25],
    [300, 780, -40], [400, 810, 15], [360, 880, -20], [420, 920, 20]
];


// =========================
// LOAD SAVED MESSAGES
// =========================

let userQuotes = [];

try {
    const saved = JSON.parse(
        localStorage.getItem("stillUserQuotes")
    );

    if (Array.isArray(saved)) {
        userQuotes = saved.filter(item =>
            item &&
            typeof item.message === "string" &&
            typeof item.author === "string"
        );
    }

} catch (error) {
    console.log("Saved messages could not be loaded.");
}

let quotes = startingQuotes.map(message => ({
    message: message,
    author: "still;"
}));

quotes = [...quotes, ...userQuotes];

let selectedIndex = -1;


// =========================
// CALCULATE LEAF POSITION
// =========================

function seededRandom(seed) {

    const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;

    return value - Math.floor(value);

}

function getPosition(index) {

    const userLeafOffset = Math.max(0, index - startingQuotes.length);

    if (index >= startingQuotes.length) {

        const [baseX, baseY, baseRotation] =
            extraPositions[userLeafOffset % extraPositions.length];

        return [
            baseX - 130 + (seededRandom(index + 11) - 0.5) * 12,
            baseY + (seededRandom(index + 47) - 0.5) * 12,
            baseRotation + (seededRandom(index + 83) - 0.5) * 18
        ];

    }

    const baseIndex = index % positions.length;

    const [baseX, baseY, baseRotation] = positions[baseIndex];

    const jitterX = (seededRandom(index + 11) - 0.5) * 18;

    const jitterY = (seededRandom(index + 47) - 0.5) * 18;

    const extraRotation =
        (seededRandom(index + 83) - 0.5) * 24;

    return [
        baseX - 130 + jitterX,
        baseY + jitterY,
        baseRotation + extraRotation
    ];

}


// =========================
// CREATE A LEAF
// =========================

function createLeaf(quote, index) {

    const [x, y, rotation] = getPosition(index);

    const leaf = document.createElementNS(svgNS, "g");

    leaf.setAttribute("class", "leaf");

    leaf.setAttribute(
        "transform",
        `translate(${x}, ${y}) rotate(${rotation})`
    );

    leaf.setAttribute("tabindex", "0");
    leaf.setAttribute("role", "button");

    leaf.setAttribute(
        "aria-label",
        `Read message from leaf ${index + 1}`
    );

    leaf.setAttribute("aria-pressed", "false");

    leaf.dataset.index = index;


    // Inner group for growing animation

    const inner = document.createElementNS(svgNS, "g");

    inner.setAttribute("class", "leaf-inner");


    // Use the supplied leaf artwork instead of a generated shape.

    const image = document.createElementNS(svgNS, "image");

    image.setAttribute("href", "Images/leaf.png");

    image.setAttribute("x", "-42");

    image.setAttribute("y", "-96");

    image.setAttribute("width", "72");

    image.setAttribute("height", "105");

    image.setAttribute("class", "leaf-image");

    image.setAttribute("preserveAspectRatio", "xMidYMid meet");


    // Assemble the leaf

    inner.appendChild(image);

    leaf.appendChild(inner);


    // Click to reveal the message

    leaf.addEventListener("click", () => {
        displayQuote(index);
    });


    // Keyboard accessibility

    leaf.addEventListener("keydown", event => {

        if (event.key === "Enter" || event.key === " ") {

            event.preventDefault();

            displayQuote(index);

        }

    });

    leafContainer.appendChild(leaf);

    return leaf;
}


// =========================
// DISPLAY A MESSAGE
// =========================

function displayQuote(index) {

    selectedIndex = index;

    const quote = quotes[index];

    quoteText.textContent = `“${quote.message}”`;

    quoteAuthor.textContent = `— ${quote.author}`;


    // Remove the highlight from other leaves

    document.querySelectorAll(".leaf").forEach(leaf => {

        leaf.classList.remove("selected");
        leaf.setAttribute("aria-pressed", "false");

    });


    // Highlight the selected leaf

    const selectedLeaf = document.querySelector(
        `.leaf[data-index="${index}"]`
    );

    if (selectedLeaf) {

        selectedLeaf.classList.add("selected");

        selectedLeaf.setAttribute(
            "aria-pressed",
            "true"
        );

    }

}


// =========================
// UPDATE LEAF COUNT
// =========================

function updateLeafCount() {

    leafCount.textContent =
        `${quotes.length} leaves of hope`;

}


// =========================
// BUILD THE TREE
// =========================

function buildTree() {

    leafContainer.replaceChildren();

    quotes.forEach((quote, index) => {

        createLeaf(quote, index);

    });

    updateLeafCount();

}


// =========================
// RANDOM MESSAGE BUTTON
// =========================

randomButton.addEventListener("click", () => {

    let randomIndex;

    do {

        randomIndex = Math.floor(
            Math.random() * quotes.length
        );

    } while (
        randomIndex === selectedIndex &&
        quotes.length > 1
    );

    displayQuote(randomIndex);

});


// =========================
// CHARACTER COUNTER
// =========================

messageInput.addEventListener("input", () => {

    characterCount.textContent =
        `${messageInput.value.length} / 200`;

});


// =========================
// SUBMIT A NEW MESSAGE
// =========================

form.addEventListener("submit", event => {

    event.preventDefault();

    const message = messageInput.value.trim();

    const author =
        authorInput.value.trim() || "Anonymous";

    if (!message || message.length > 200) {

        successMessage.textContent =
            "Please enter a thought of 1–200 characters.";

        return;

    }


    // Create the new quote

    const newQuote = {
        message: message,
        author: author
    };

    quotes.push(newQuote);

    userQuotes.push(newQuote);


    // Save the message in the browser

    let savedSuccessfully = true;

    try {

        localStorage.setItem(
            "stillUserQuotes",
            JSON.stringify(userQuotes)
        );

    } catch (error) {

        savedSuccessfully = false;

    }


    // Add a new leaf to the tree

    const newIndex = quotes.length - 1;

    const newLeaf = createLeaf(newQuote, newIndex);

    if (newLeaf) {

        newLeaf.classList.add("new-leaf");

    }

    updateLeafCount();

    displayQuote(newIndex);


    // Reset the form

    form.reset();

    characterCount.textContent = "0 / 200";

    successMessage.textContent = savedSuccessfully
        ? "Your words have become a little leaf of hope."
        : "Your leaf was added, but could not be saved.";


    // Return to the tree

    document.getElementById("tree-section")
        .scrollIntoView();

});


// =========================
// START THE WEBSITE
// =========================

buildTree();


// Keep visible brand text lowercase throughout the homepage.

function lowercaseStillText(node) {

    const walker = document.createTreeWalker(
        node,
        NodeFilter.SHOW_TEXT
    );

    while (walker.nextNode()) {

        walker.currentNode.textContent =
            walker.currentNode.textContent.replace(/STILL/g, "still");

    }

    document.querySelectorAll("[alt], [aria-label], [title]").forEach(element => {

        ["alt", "aria-label", "title"].forEach(attribute => {

            if (element.hasAttribute(attribute)) {

                element.setAttribute(
                    attribute,
                    element.getAttribute(attribute).replace(/STILL/g, "still")
                );

            }

        });

    });

}

lowercaseStillText(document.body);
