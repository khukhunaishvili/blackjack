class Game {
    constructor() {
        this.status = 'set',
        this.money = 1000,
        this.bet = 0,
        this.lastBet = 0,
        this.cards = [
            {
                name: 'niko',
                address: 'asdsad@asd.de',
                status: 'sent'
            },
            {
                name: 'niko',
                address: 'asdsad@asd.de',
                status: 'received'
            }
        ],
        this.playerCards = [],
        this.playerCardsSum = 0,
        this.dealerCards = [],
        this.dealerCardsSum = 0,
        this.dealerCardsSumToShow = 0
    }
    getProfile() {
        return {
            money: this.money,
            bet: this.bet
        }
    }
    getShowSum() {
        if (this.status == "end") {
            return {
                player: this.playerSum(),
                dealer: this.dealerSum()
            }
        } else {
            return {
                player: this.playerSum(),
                dealer: this.dealerSumHidden()
            }
        }
    }
    addBet(value) {
        if (this.money >= value) {
            this.bet += value;
            this.money -= value;
        } else {
            throw new Error('You dont have enough money to bet')
        }
    }
    clearBet() {
        this.money += this.bet;
        this.bet = 0;
    }
    updateMoney(e) {
        this.money = parseInt(e.target.elements.newMoney.value);
        e.target.elements.newMoney.value = '';
    }
    genCards() {
        this.cards = [];
        this.playerCards = [];
        this.dealerCards = [];
        let card = ['H', 'D', 'S', 'C'];
        card.forEach((name) => {
            for (let index = 2; index < 12; index++) {
                this.cards.push(`${index}${name}`);
            }
            ['K', 'Q', 'J'].forEach(cardType => {
                this.cards.push(`${cardType}${name}`);
            })
        });
    }
    getCard() {
        let cardIndex = Math.floor(Math.random() * (this.cards.length - 1));
        let newCard = this.cards[cardIndex];
        this.cards.splice(cardIndex, 1);
        return newCard;
    }
    getPlayerCard() {
        let newCard = this.getCard();
        this.playerCards.push(newCard);
        this.playerSum();
    }
    getDealerCard() {
        let newCard = this.getCard();
        this.dealerCards.push(newCard);
        this.dealerSum();
    }
    sumOfCards(cards) {
        let numbers = [];
        //add card values to number array
        cards.forEach(card => {
            let match = card.match(/(\d+)/);
            if (match) {
                numbers.push(parseInt(match[0]));
            } else {
                numbers.push(10);
            }
        })
        //sum card values
        function sumCards(numbers) {
            return numbers.reduce(function (a, b) {
                return a + b;
            }, 0);
        }
        let sum = sumCards(numbers);
        // if sum exceeds 21 and there is ace
        if (sum > 21) {
            let index = numbers.findIndex(item => {
                return item == 11;
            });
            if (index > -1) {
                numbers[index] = 1;
                return sumCards(numbers);
            } else {
                return sum;
            }
        } else {
            return sum;
        }
    }
    playerSum() {
        this.playerCardsSum = this.sumOfCards(this.playerCards);
        return this.playerCardsSum;
    }
    dealerSum() {
        this.dealerCardsSum = this.sumOfCards(this.dealerCards);
        return this.dealerCardsSum;
    }
    dealerSumHidden() {
        let realSum = this.sumOfCards(this.dealerCards);
        let match = String(this.dealerCards[0]).match(/(\d+)/);
        if (match) {
            return realSum - parseInt(match[0]);
        } else {
            return realSum - 10;
        }
    }
    deal() {
        this.genCards();
        this.getPlayerCard();
        game.status = 'deal';
        this.getDealerCard();
        this.getPlayerCard();
        this.getDealerCard();
        const blackjack = this.checkIfItIsBlacjack();
        if (blackjack !== false) {
            this.status = 'end';
            if (blackjack.result == 'won') {
                this.money += (2 * this.bet);
                this.lastBet = this.bet;
                this.bet = 0;
            } else if (blackjack.result == 'lost') {
                this.lastBet = this.bet;
                this.bet = 0;
            } else if (blackjack.result == 'draw') {
                this.money += this.bet;
                this.lastBet = this.bet;
                this.bet = 0;
            }
            return blackjack;
        };
    }
    checkIfItIsBlacjack() {
        if (this.playerCardsSum == 21 && this.playerCardsSum > this.dealerCardsSum) {
            return {
                result: 'won',
                reason: 'You have Blackjack, but dealer not!',
                amount: this.bet
            };
        } else if (this.dealerCardsSum == 21 && this.playerCardsSum < this.dealerCardsSum) {
            return {
                result: 'lost',
                reason: 'Dealer has Blackjack, but you dont!',
                amount: this.bet
            };
        } else if (this.dealerCardsSum == 21 && this.playerCardsSum == 21) {
            return {
                result: 'draw',
                reason: 'You both have Blackjack!',
                amount: 0
            };
        } else return false;
    }
    hit() {
        this.getPlayerCard();
        return this.check21('player');
    }
    surrender() {
        this.status = "end";
        let loss = (this.bet / 2);
        this.money += loss;
        this.lastBet = this.bet;
        this.bet = 0;
        return {
            result: 'lost',
            reason: 'You have surrender',
            amount: loss
        };
    }
    double() {
        let methodResult = {
            result: false,
            reason: 'You dont have enough money to Double',
            amount: 0
        };
        if (this.money < this.bet) {
            return methodResult;
        } else {
            this.money -= this.bet;
            this.bet += this.bet;
            this.getPlayerCard();
            const checkPlayer = this.check21('player');
            if (checkPlayer.result == "lost") {
                this.status = 'end';
                this.lastBet = this.bet;
                this.bet = 0;
                return checkPlayer;
            } else return this.stand();
        }
    }
    stand() {
        let methodResult = {
            result: false,
            reason: '',
            amount: 0
        };
        if (this.dealerCardsSum > this.playerCardsSum) {
            this.status = 'end';
            this.lastBet = this.bet;
            this.bet = 0;
            methodResult.result = 'lost';
            methodResult.reason = 'Dealer card value exceeded yours';
            methodResult.amount = this.lastBet;
            return methodResult;
        }
        while (this.dealerCardsSum < 17) {
            this.getDealerCard();
            const checkDealer = this.check21('dealer');
            if (checkDealer.result == "won") {
                this.status = 'end';
                this.money += this.bet * 2;
                this.lastBet = this.bet;
                this.bet = 0;
                methodResult.result = 'won';
                methodResult.reason = 'Dealer card value exceeded 21';
                methodResult.amount = this.lastBet;
                return methodResult;
            }
        }
        return this.compare();
    }
    compare() {
        if (this.playerCardsSum == this.dealerCardsSum) {
            this.money += this.bet;
            this.status = 'end';
            this.lastBet = this.bet;
            this.bet = 0;
            return {
                result: 'draw',
                reason: 'You have equal cards',
                amount: 0
            };
        } else if (this.playerCardsSum > this.dealerCardsSum) {
            this.money += this.bet * 2;
            this.status = 'end';
            this.lastBet = this.bet;
            this.bet = 0;
            return {
                result: 'won',
                reason: 'You have better cards',
                amount: this.lastBet
            };
        } else if (this.playerCardsSum < this.dealerCardsSum) {
            this.status = 'end';
            this.lastBet = this.bet;
            this.bet = 0;
            return {
                result: 'lost',
                reason: 'Dealer has better cards',
                amount: this.lastBet
            };
        }
    }
    check21(who) {
        if (who == 'player') {
            if (this.playerCardsSum > 21) {
                return {
                    result: 'lost',
                    reason: 'You have exceeded 21',
                    amount: this.bet
                };
            } else return {
                result: 'Not exceed'
            }
        } else if (who == 'dealer') {
            if (this.dealerCardsSum > 21) {
                return {
                    result: 'won',
                    reason: 'Dealer has exceeded 21',
                    amount: this.bet
                };
            } else return {
                result: 'not exceed'
            }
        }
    }
    newGame() {
        this.status = 'set';
        this.bet = 0;
        this.cards = [];
        this.playerCards = [];
        this.dealerCards = [];
    }
    rebeat() {
        this.status = 'set';
        if (this.money >= this.lastBet) {
            this.bet = this.lastBet;
            this.money -= this.lastBet;
        } else throw new Error('There shouldnt be rebeat option but someone called')
        this.cards = [];
        this.playerCards = [];
        this.dealerCards = [];
    }
    rebeatAndDeal() {
        if (this.money >= this.lastBet) {
            this.bet = this.lastBet;
            this.money -= this.lastBet;
        } else throw new Error('There shouldnt be rebeat option but someone called')
        this.cards = [];
        this.playerCards = [];
        this.dealerCards = [];
        this.deal();
    }
}