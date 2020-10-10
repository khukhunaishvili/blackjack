// 1. Load default page
let game = new Game();
const createBetButtons = () => {
    // Create dev element
    const betButtonDiv = document.createElement('div');
    betButtonDiv.innerHTML = '';
    betButtonDiv.id = 'bet-box';
    // Create title
    const buttonTitleSpan = document.createElement('span');
    buttonTitleSpan.textContent = 'Add bet $ ';
    betButtonDiv.appendChild(buttonTitleSpan);
    // Create bet buttons
    const createBetButton = (value) => {
        value = parseInt(value);
        let button = document.createElement("input");
        button.type = "button";
        button.value = value;
        button.addEventListener('click', function () {
            try {
                game.addBet(value);
                getPlayerMoneyAndBet();
                if (game.status.toLowerCase() == 'set') {
                    game.status = 'ready'
                    displayOn('deal-button');
                }
            } catch (error) {
                alert(error);
            }
        });
        betButtonDiv.appendChild(button);
    }
    createBetButton(1);
    createBetButton(5);
    createBetButton(10);
    createBetButton(25);
    createBetButton(100);
    createBetButton(500);
    // Create Clear bet button
    let clearButton = document.createElement("input");
    clearButton.type = "button";
    clearButton.value = 'Clear the bet';
    clearButton.addEventListener('click', (e) => {
        game.clearBet();
        displayOff('deal-button');
        game.status = 'set';
        getPlayerMoneyAndBet();
    })
    betButtonDiv.appendChild(clearButton);
    document.querySelector('#add-bet').appendChild(betButtonDiv)
}
const getPlayerMoneyAndBet = () => {
    const { money, bet } = game.getProfile();
    document.querySelector('#money').textContent = `Money: ${money}`;
    document.querySelector('#bet').textContent = `Bet: ${bet}`;
}
const setMoney = (e) => {
    e.preventDefault();
    game.clearBet();
    game.updateMoney(e);
    game.status = 'set';
    displayOff('deal-button');
    getPlayerMoneyAndBet();
}
const onLoad = () => {
    getPlayerMoneyAndBet();
    createBetButtons();
    document.querySelector('#set-money').addEventListener('submit', (e) => setMoney(e));
}
onLoad();
// Hide&Show Elements functions
function displayOn(id) {
    if (typeof id == 'string') {
        id = id.split();
    }
    id.forEach(id => {
        let element = document.getElementById(`${id}`);
        element.style.display = "block";
    })
}
function displayOff(id) {
    if (typeof id == 'string') {
        id = id.split();
    }
    id.forEach(id => {
        let element = document.getElementById(`${id}`);
        element.style.display = "none";
    })
}
// 2. Deal
const deal = () => {
    const dealAndCheckBlackjack = game.deal();
    showSum();
    showCards();
    displayOff(['deal-button', 'set-game']);
    displayOn(['hit-button', 'stand-button', 'double-button', 'surrender-button',
        'cards-on-table']);
    if (dealAndCheckBlackjack) {
        getEndPage(dealAndCheckBlackjack);
    }
}
// Show sum of the cards
function showSum() {
    const sum = game.getShowSum();
    document.querySelector('#player-cards-sum').textContent = `Sum: ${sum.player}`;
    document.querySelector('#dealer-cards-sum').textContent = `Sum: ${sum.dealer}`;
}
// Show actual cards
function showCards() {
    let playerCards = document.querySelector('#player-cards');
    playerCards.innerHTML = '';
    playerCards.classList.add('card');
    playerCards.textContent = 'Player: ';
    game.playerCards.forEach(card => {
        // let image = document.createElement('img')
        // image.src = `https://inst.eecs.berkeley.edu/~cs61b/fa15/hw/code/proj0/canfield/resources/playing-cards/${card}.png`
        // playerCards.append(image);
        playerCards.append(card);
    });
    let dealerCards = document.querySelector('#dealer-cards');
    dealerCards.innerHTML = '';
    dealerCards.classList.add('card');
    dealerCards.textContent = 'Dealer: ';
    game.dealerCards.forEach(card => {
        if (game.status.toLowerCase() == 'end') {
            dealerCards.append(card);
        } else {
            if (card == game.dealerCards[0]) {
                dealerCards.append('?');
            } else {
                dealerCards.append(card);
            }
        }
    });
}
// Show cards and it's sum on table
function showTable() {
    showCards();
    showSum();
}
// 3.1 Hit
const hit = () => {
    game.getPlayerCard();
    showTable();
    const { result, reason, amount } = game.check21('player');
    if (result.toLowerCase() == 'lost') {
        displayOff(['hit-button', 'stand-button', 'double-button', 'surrender-button']);
        showEndResultMessage(result, reason, amount);
        getPlayerMoneyAndBet();
    }
}
// 3.2 Surrender
const surrender = () => {
    const { result, reason, amount } = game.surrender();
    displayOff(['hit-button', 'stand-button', 'double-button', 'surrender-button']);
    getPlayerMoneyAndBet();
    showEndResultMessage(result, reason, amount);
}
// 3.3 Double
function double() {
    let doubleAndGetResult = game.double();
    if (doubleAndGetResult.result == false) {
        alert(doubleAndGetResult.reason);
    } else getEndPage(doubleAndGetResult);
}
// 3.4 Stand
function stand() {
    const standAndGetResult = game.stand();
    getEndPage(standAndGetResult);
}
// 4.1 last window at the end of game
function getEndPage(final) {
    if (final.result == 'lost') {
        displayOff(['hit-button', 'stand-button', 'double-button', 'surrender-button']);
        getPlayerMoneyAndBet();
        showTable();
        showEndResultMessage(final.result, final.reason, final.amount);
    } else if (final.result == 'won') {
        displayOff(['hit-button', 'stand-button', 'double-button', 'surrender-button']);
        getPlayerMoneyAndBet();
        showTable();
        showEndResultMessage(final.result, final.reason, final.amount);
    } else if (final.result == 'draw') {
        displayOff(['hit-button', 'stand-button', 'double-button', 'surrender-button']);
        getPlayerMoneyAndBet();
        showTable();
        showEndResultMessage(final.result, final.reason, final.amount);
    }
}
// 4.2 result message
function showEndResultMessage(result, reason, amount) {
    let messageBox = document.querySelector('#message');
    messageBox.innerHTML = '';
    let message = document.createElement('p');
    if (result == 'won') {
        message.textContent = `${reason}: money won $${amount}!`;
    } else if (result == 'lost') {
        message.textContent = `${reason}: money lost $${amount}!`;
    } else if (result == 'draw') {
        message.textContent = `${reason}`;
    }
    messageBox.appendChild(message);
    displayOn('message');
    displayContinueButtons(amount);
}
// 4.3 show buttons at the end of game to continue
function displayContinueButtons(lastBet) {
    if (game.money >= lastBet) {
        displayOn(['new-game-button', 'rebeat-button', 'rebeat-and-deal-button']);
    } else {
        displayOn(['new-game-button']);
    }
};
// 5.1 New Game
function newGame() {
    game.newGame();
    getPlayerMoneyAndBet();
    displayOn('set-game');
    displayOff(['hit-button', 'stand-button', 'double-button', 'surrender-button', "cards-on-table",
        "message", "new-game-button", "rebeat-button", "rebeat-and-deal-button"]);
}
// 5.2 Rebeat
function rebeat() {
    game.rebeat();
    getPlayerMoneyAndBet();
    displayOn(['set-game', 'deal-button']);
    displayOff(["cards-on-table", "message", "new-game-button", "rebeat-button", "rebeat-and-deal-button"]);
}
// 5.3 Rebeat and Deal
function rebeatAndDeal() {
    game.rebeatAndDeal();
    getPlayerMoneyAndBet();
    displayOn(['hit-button', 'stand-button', 'double-button', 'surrender-button', "cards-on-table",]);
    displayOff(['set-game', 'deal-button', "message", "new-game-button", "rebeat-button", "rebeat-and-deal-button"]);
    deal();
}