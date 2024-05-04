

const userCardTemplate = document.querySelector("[data-user-template]");
const userCardContainer = document.querySelector("[data-user-cards-container]");
const searchInput = document.getElementById("search");

const sortBtn = document.getElementById("sortBtn");
const clearBtn = document.getElementById("clearBtn");

const main_deck_count_label = document.getElementById("main-deck-count");
const extra_deck_count_label = document.getElementById("extra-deck-count");

const main_deck_price_label = document.getElementById("main-deck-cost");
const extra_deck_price_label = document.getElementById("extra-deck-cost");

const cardName = document.getElementById("card-highlight-name");
const cardImg = document.getElementById("card-highlight-img");
const cardEffect = document.getElementById("card-highlight-effect");

let main_deck_count = 0;
let extra_deck_count = 0;

let main_deck_price = 0;
let extra_deck_price = 0;

let cards = [
    [], // normal monsters
    [], // effect monsters
    [], // tuner effect monsters
    [], // pendulum normal monsters
    [], // pendulum effect monsters
    [], // spell cards
    [],  // trap cards
    [], // fusion monsters
    [], // synchro monsters
    [], //synchro tuner
    [], // xyz monsters
    [] // link monsters
];

let savedCards = []; //here will be saved the filtered data
let addedCards = []; //here will be saved all the cards added by the user



/*
    on page load immediately start this functionality
    fetch the entire yugioh card database then check every element
    and depending on its type add it in the appropriate place in the matrix
    then collapse that matrix until a normal array is returned where the cards are sorted in the desired way


    then map every element and create its template copy which would contain the card's name, image and simple data
    then return it as an object with name and a reference to its template copy
*/

fetch("https://db.ygoprodeck.com/api/v7/cardinfo.php")
.then(res => res.json())
.then(data => {
    data.data.forEach(card => {
        switch(card.type.toLowerCase()){
            case "normal monster": 
            cards[0].push(card);
            break;

            case "effect monster": 
            cards[1].push(card);
            break;

            case "tuner monster": 
            cards[2].push(card);
            break;

            case "pendulum normal monster": 
            cards[3].push(card);
            break;

            case "pendulum effect monster": 
            cards[4].push(card);
            break;

            case "spell card": 
            cards[5].push(card);
            break;

            case "trap card": 
            cards[6].push(card);
            break;

            case "fusion monster": 
            cards[7].push(card);
            break;

            case "synchro monster": 
            cards[8].push(card);
            break;

            case "synchro tuner monster": 
            cards[9].push(card);
            break;

            case "xyz monster": 
            cards[10].push(card);
            break;

            case "link monster": 
            cards[11].push(card);
            break;
        }
    })

    cards = cards.reduce((prev, next) => {
        return prev.concat(next);
    }, []);

    savedCards = cards.map(user => {
        const card = userCardTemplate.content.cloneNode(true).children[0];
    
            const cardImg = card.querySelector("[card-img]");
            const cardName = card.querySelector("[card-name]");
            const cardType = card.querySelector("[card-type]");
            const cardAttributes = card.querySelector("[card-attributes]");
    
            cardImg.src = user.card_images[0].image_url_small;
            cardName.textContent = user.name;

            if(user.type.toLowerCase().includes("monster")){
                cardType.textContent = `${user.race} / ${user.attribute}`;
                cardAttributes.textContent = `${user.atk}ATK`;

                if(user.def !== undefined){
                    cardAttributes.textContent += ` / ${user.def}DEF`;
                }
                else if(user.linkval !== undefined){
                    cardAttributes.textContent += ` / LINK-${user.linkval}`;
                }
            }
            else if(user.type.toLowerCase().includes("spell")){
                cardType.textContent = "Spell Card";
            }
            else{
                cardType.textContent = "Trap Card";
            }

            userCardContainer.append(card);

            return { name: user.name, element: card};
    })
})
.catch(err => {
    console.error(`Error fetching the data ${err}`);
});



/*
    on input modification, check the length of the input bar
    if > 3, toggle the visibility of all elements 
    that contain the inputted characters
*/

searchInput.addEventListener("input", e => {
    if(searchInput.value.length >= 3){
        const value = e.target.value.toLowerCase();
    
    savedCards.forEach(card => {
            const isVisible = card.name.toLowerCase().includes(value);
            card.element.classList.toggle("hide", !isVisible);
    });
    }
});



/*
    on search bar card mouseover
    get the card's name, fetch its data
    then apply its name, image and effect to respective elements from col-3
*/

userCardContainer.addEventListener("mouseover", e => {
    let element = e.target;

    while (element.parentElement && element.parentElement.tagName && element.parentElement.tagName.toLowerCase() !== 'div') {
        element = element.parentElement;
    }

    element = element.parentElement.children[1].children[0].textContent; //getting the card name

    fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?name=${encodeURIComponent(element)}`)
    .then(res => res.json())
    .then(data => {
        cardName.textContent = data.data[0].name;
        cardEffect.textContent = data.data[0].desc;
        cardImg.src = data.data[0].card_images[0].image_url_small;
        cardImg.style.display = "block";
    })
});




/*
    on mouseover on a table data cell
    if it has data (image), check if there is a saved card with that same img
    and if there is, change the data from col-3 to its data
*/

const tdElements = document.querySelectorAll('td');
tdElements.forEach(td => {
    td.addEventListener('mouseover', e => {
        if (e.target.tagName === 'IMG') {
            const src = e.target.src;
            const matchingCard = addedCards.find(card => card.src === src);
            if (matchingCard) {
                cardName.textContent = matchingCard.name;
                cardImg.src = matchingCard.src;
                cardEffect.textContent = matchingCard.effect;
            }
        }
    });

    td.addEventListener('contextmenu', e => {
        e.preventDefault(); 
    
        let tdElement = e.target;
        while (tdElement && tdElement.tagName !== 'TD') {
            tdElement = tdElement.parentNode;
        }
    
        if (tdElement) {
            const indexToRemove = addedCards.findIndex(card => card.src === e.target.src);
            if (indexToRemove !== -1) {
                let [removed_element] = addedCards.splice(indexToRemove, 1);              

                if(removed_element.type.toLowerCase().includes("fusion monster")
                    || removed_element.type.toLowerCase().includes("synchro monster")
                    || removed_element.type.toLowerCase().includes("synchro tuner monster")
                    || removed_element.type.toLowerCase().includes("xyz monster")
                    || removed_element.type.toLowerCase().includes("link monster")){

                    extra_deck_count--;
                    extra_deck_price -= parseFloat(removed_element.price);

                    extra_deck_count_label.textContent = extra_deck_count;
                    extra_deck_price_label.textContent = parseFloat(extra_deck_price).toFixed(2) + "$";
                    }
                    else{
                        main_deck_count--;
                        main_deck_price -= parseFloat(removed_element.price);

                        main_deck_count_label.textContent = main_deck_count;
                        main_deck_price_label.textContent = parseFloat(main_deck_price).toFixed(2) + "$";
                    }

                tdElement.innerHTML = ''; 
            }
        }
    });
});



/*
    on search menu card click, get the card name, 
    then fetch its data, then check if its an extra or main deck monster
    then add its image to the first empty cell
    and modify count and price
*/
userCardContainer.addEventListener("contextmenu", e => {
    e.preventDefault();
    let element = e.target;

    // Find the parent div containing the card name
    while (element.parentElement && element.parentElement.tagName && element.parentElement.tagName.toLowerCase() !== 'div') {
        element = element.parentElement;
    }
    
    const cardName = element.parentElement.children[1].children[0].textContent;

    fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?name=${encodeURIComponent(cardName)}`)
    .then(res => res.json())
    .then(data => {
        const tableId = (["fusion monster", "synchro monster", "synchro tuner monster" , "xyz monster", "link monster"].includes(data.data[0].type.toLowerCase())) ? "extra-deck" : "main-deck";
        const table = document.getElementById(tableId);
        
        for (const row of table.rows) {
            for (const cell of row.cells) {
                if (cell.querySelector('img') === null) { //applying the found image to the first empty cell, then modifying price and count
                    const img = document.createElement("img");
                    img.src = data.data[0].card_images[0].image_url_small;
                    img.style.height = '100%';
                    img.style.width = "100%";
    
                    // Append the image to the cell
                    cell.appendChild(img);

                    addedCards.push({
                        name: data.data[0].name,         // Name of the card
                        effect: data.data[0].desc,       // Effect of the card
                        src: data.data[0].card_images[0].image_url_small,  // Source of the card's image
                        price: data.data[0].card_prices[0].tcgplayer_price,
                        type: data.data[0].type,
                        level: data.data[0].level,
                        linkval: data.data[0].linkval
                    });

                    if(tableId === "extra-deck"){
                        extra_deck_count++;
                        extra_deck_price += parseFloat(data.data[0].card_prices[0].tcgplayer_price);

                        extra_deck_count_label.textContent = extra_deck_count;
                        extra_deck_price_label.textContent = parseFloat(extra_deck_price).toFixed(2) + "$";
                    }
                    else{
                        main_deck_count++;
                        main_deck_price += parseFloat(data.data[0].card_prices[0].tcgplayer_price);

                        main_deck_count_label.textContent = main_deck_count;
                        main_deck_price_label.textContent = parseFloat(main_deck_price).toFixed(2) + "$";
                    }
                    
                    return;
                }
            }
        }
    }             
    )
});


/*
    On click will sort all cards found in the td elements
    in the appropriate order
*/
sortBtn.onclick = function(){
    tdElements.forEach(element => {
        element.innerHTML = '';
    })

    let sortedCards = [
        [], // normal monsters
        [], // effect monsters
        [], // tuner effect monsters
        [], // pendulum normal monsters
        [], // pendulum effect monsters
        [], // spell cards
        [],  // trap cards
        [], // fusion monsters
        [], // synchro monsters
        [], // synchro tuner monster
        [], // xyz monsters
        [] // link monsters
    ];

    addedCards.forEach(card => {
        switch(card.type.toLowerCase()){
            case "normal monster": 
                sortedCards[0].push(card);
                break;
            case "effect monster": 
                sortedCards[1].push(card);
                break;
            case "tuner monster": 
                sortedCards[2].push(card);
                break;
            case "pendulum normal monster": 
                sortedCards[3].push(card);
                break;
            case "pendulum effect monster": 
                sortedCards[4].push(card);
                break;
            case "fusion monster": 
                sortedCards[5].push(card);
                break;
            case "synchro monster": 
                sortedCards[6].push(card);
                break;

            case "synchro tuner monster":
                sortedCards[7].push(card);
                break;

            case "xyz monster": 
                sortedCards[8].push(card);
                break;
            case "link monster": 
                sortedCards[9].push(card);
                break;
            case "spell card": 
                sortedCards[10].push(card);
                break;
            case "trap card": 
                sortedCards[11].push(card);
                break;
        }
    });

    sortedCards.forEach((array) => {
        array.sort((a, b) => {
            return a.name.localeCompare(b.name);
        });
    });

    sortedCards.forEach((array) => {
        array.sort((a, b) => {
            if(a.level !== undefined)
                return a.level - b.level;
            else if(a.linkval !== undefined)
                return a.linkval - b.linkval;
            else
                return;
        });
    });

    // Flatten the sortedCards array
    sortedCards = sortedCards.reduce((prev, next) => {
        return prev.concat(next);
    }, []);

    
    sortedCards.forEach(card => {
        const tableId = (["fusion monster", "synchro monster", "synchro tuner monster", "xyz monster", "link monster"].includes(card.type.toLowerCase())) ? "extra-deck" : "main-deck";
        const table = document.getElementById(tableId);
        
        for (const row of table.rows) {
            for (const cell of row.cells) {
                if (cell.querySelector('img') === null) { //applying the found image to the first empty cell, then modifying price and count
                    const img = document.createElement("img");
                    img.src = card.src;
                    img.style.height = '100%';
                    img.style.width = "100%";
    
                    // Append the image to the cell
                    cell.appendChild(img);
                    return;
                }
            }
        }
    });
};



/*
    on click, clear all td elements of their data (images)
    empty the arrays that store their data
    and reset labels and their variables
*/
clearBtn.onclick = function(){
    tdElements.forEach( element => {
        element.innerHTML = '';
    })

    addedCards = [];

    main_deck_count = 0;
    extra_deck_count = 0;
    
    main_deck_price = 0;
    extra_deck_price = 0;

    main_deck_count_label.textContent = main_deck_count;
    extra_deck_count_label.textContent = extra_deck_count;

    main_deck_price_label.textContent = parseFloat(main_deck_price).toFixed(2) + "$";
    extra_deck_price_label.textContent = parseFloat(extra_deck_price).toFixed(2) + "$";
}