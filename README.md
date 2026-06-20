# Order and Chaos
This project is made as an submission for task 3 of the sophomore selection for the tech team of the The KGPian Game Theory Society.
---
**Hosted at** https://github.com/b1rdhead/Order-and-Chaos
---
## The Game

**two rounds**, with players swapping roles between rounds.

- **Order** wins a round by forming a straight line of 5 identical symbols 
  (X or X, or O or O) horizontally, vertically, or diagonally
- **Chaos** wins a round by filling the board without allowing any 5-in-a-row
- Both players may place either X or O on their turn
- Order always goes first within a round

---

### Round Structure

**Round 1:** Player 1(human) plays as Order, Player 2(AI) plays as Chaos  
**Round 2:** Roles swap — Player 2(AI) plays as Order, Player 1(human) plays as Chaos

---

### Winning the Game

**If Round 1 Order achieved a 5-in-a-row:**
- Round 2 Order must complete a 5-in-a-row in *fewer moves* to win
- Same move count → compare number of straight 4s formed
- Same straight 4s → Draw

**If Round 1 Order did not achieve a 5-in-a-row:**
- Round 2 Order wins simply by completing any 5-in-a-row
- If neither achieves a 5-in-a-row → compare straight 4s
- Same straight 4s → Draw

**Pattern Definitions**
- *Straight 5:* Five consecutive identical symbols in a line — wins the round
- *Straight 4:* Four consecutive identical symbols in a line — used as tiebreaker
