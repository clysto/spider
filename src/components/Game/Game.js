import React, { useState, useEffect } from "react";
import OutsideClickHandler from "react-outside-click-handler";
import classnames from "classnames";
import Card from "components/Card";
import styles from "./Game.module.css";
import { ALL_POINTS, POINTS_MAP } from "./contants";

const SUITS_NUM = 2;

const getGameData = () => {
  const cards = window.localStorage.getItem("cards");
  const allCards = window.localStorage.getItem("allCards");
  const history = window.localStorage.getItem("history");
  const finishedCards = window.localStorage.getItem("finishedCards");
  const score = window.localStorage.getItem("score");

  if (cards && allCards && history && finishedCards) {
    return [
      JSON.parse(cards),
      JSON.parse(allCards),
      JSON.parse(history),
      JSON.parse(finishedCards),
      JSON.parse(score),
    ];
  } else {
    return null;
  }
};

const shuffle = (arr) => {
  arr.sort(() => Math.random() - 0.5);
};

const getNextPoint = (point) => {
  if (POINTS_MAP[point] - 1 < 0) return "-1";
  return ALL_POINTS[POINTS_MAP[point] - 1];
};

const getPrevPoint = (point) => {
  if (POINTS_MAP[point] + 1 > 12) return "-1";
  return ALL_POINTS[POINTS_MAP[point] + 1];
};

const getInitGameState = (mode) => {
  let ALL_SUITS;
  if (mode === 3) {
    ALL_SUITS = ["♠", "♥", "♣", "♦"];
  } else if (mode === 2) {
    ALL_SUITS = ["♠", "♥", "♠", "♥"];
  } else if (mode === 1) {
    ALL_SUITS = ["♠", "♠", "♠", "♠"];
  }

  let lastIndex = 0;
  let allCardsT = [];
  let cardsT = [[], [], [], [], [], [], [], [], [], []];
  for (let i = 0; i < SUITS_NUM; i++) {
    for (let suit of ALL_SUITS) {
      for (let point of ALL_POINTS) {
        allCardsT.push({
          index: lastIndex++,
          point,
          suit,
          display: false,
        });
      }
    }
  }
  // 洗牌
  shuffle(allCardsT);
  // 初始化牌堆
  for (let i = 0; i < 10; i++) {
    let t = i < 4 ? 6 : 5;
    for (let j = 0; j < t; j++) {
      let card = allCardsT.pop();
      if (j === t - 1) {
        card.display = true;
      }
      cardsT[i].push(card);
    }
  }

  /* DEBUG START */
  // cardsT[0] = [
  //   {
  //     index: 999,
  //     point: "A",
  //     suit: "♠",
  //     display: true,
  //   },
  // ];
  // for (let i = 12; i > 3; i--) {
  //   cardsT[0].push({
  //     index: lastIndex++,
  //     point: ALL_POINTS[i],
  //     suit: "♠",
  //     display: true,
  //   });
  // }
  // for (let i = 3; i >= 0; i--) {
  //   cardsT[1].push({
  //     index: lastIndex++,
  //     point: ALL_POINTS[i],
  //     suit: "♠",
  //     display: true,
  //   });
  // }
  // for (let i = 12; i >= 1; i--) {
  //   cardsT[2].push({
  //     index: lastIndex++,
  //     point: ALL_POINTS[i],
  //     suit: "♥",
  //     display: true,
  //   });
  // }
  // cardsT[3].push({
  //   index: lastIndex++,
  //   point: ALL_POINTS[0],
  //   suit: "♥",
  //   display: true,
  // });
  /* DEBUG END */
  return [cardsT, allCardsT];
};

const Game = () => {
  const [allCards, setAllCards] = useState([]);
  const [score, setScore] = useState(500);
  const [menuOpen, setMenuOpen] = useState(false);
  const [finishedCards, setFinishedCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [history, setHistory] = useState([]);
  const [cards, setCards] = useState([[], [], [], [], [], [], [], [], [], []]);

  useEffect(() => {
    const data = getGameData();
    if (data) {
      setCards(data[0]);
      setAllCards(data[1]);
      setHistory(data[2]);
      setFinishedCards(data[3]);
      setScore(data[4]);
    } else {
      const [cardsT, allCardsT] = getInitGameState(3);
      setAllCards(allCardsT);
      setCards(cardsT);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("cards", JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    window.localStorage.setItem("score", JSON.stringify(score));
  }, [score]);

  useEffect(() => {
    window.localStorage.setItem("allCards", JSON.stringify(allCards));
  }, [allCards]);

  useEffect(() => {
    window.localStorage.setItem("history", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    window.localStorage.setItem("finishedCards", JSON.stringify(finishedCards));
  }, [finishedCards]);

  const restart = (mode) => {
    const [cardsT, allCardsT] = getInitGameState(mode);
    setAllCards(allCardsT);
    setCards(cardsT);
    setHistory([]);
    setSelectedCard(null);
    setFinishedCards([]);
    setMenuOpen(false);
    setScore(500);
  };

  /**
   * 选择牌堆
   * @param {number} col 列数
   * @param {number} row 行数
   * @param {string} eventCardDisplay 触发事件牌的display属性
   * @param {object} event 触发事件
   */
  const select = (col, row, eventCardDisplay) => {
    // 选中的牌是背面朝上的牌直接返回
    if (!eventCardDisplay) return;
    if (selectedCard === null && canMoveFrom(col, row)) {
      setSelectedCard({ col, row });
    } else if (
      selectedCard !== null &&
      selectedCard.col !== col &&
      canMoveTo(col, cards[selectedCard.col][selectedCard.row].point)
    ) {
      move(selectedCard.col, col, selectedCard.row);
      setSelectedCard(null);
    } else if (canMoveFrom(col, row)) {
      setSelectedCard({ col, row });
    } else {
      setSelectedCard(null);
    }
  };

  /**
   * [core]移动
   * @param {number} src 开始的列
   * @param {number} dest 结束的列
   * @param {number} srcRow 开始列的行数
   */
  const move = (src, dest, srcRow) => {
    let len = cards[src].length;
    let movedCards = cards[src].slice(srcRow, len);
    let remainCards = cards[src].slice(0, srcRow);

    let historyItem = { src, dest, num: movedCards.length };

    // 判断是否翻牌
    if (
      remainCards.length > 0 &&
      !remainCards[remainCards.length - 1].display
    ) {
      // 翻牌
      historyItem.flip = true;
      remainCards[remainCards.length - 1].display = true;
    } else {
      historyItem.flip = false;
    }

    // 判断是否消除
    let r = canMerge(dest, movedCards);
    if (r !== false) {
      // 可以消除
      historyItem.type = "merge";
      let destRemovedCards = cards[dest].slice(r);
      cards[dest] = cards[dest].slice(0, r);
      if (
        cards[dest].length > 0 &&
        !cards[dest][cards[dest].length - 1].display
      ) {
        cards[dest][cards[dest].length - 1].display = true;
        historyItem.mergeWithFlip = true;
      } else {
        historyItem.mergeWithFlip = false;
      }
      setFinishedCards([...finishedCards, ...destRemovedCards, ...movedCards]);
      setScore(score + 100);
    } else {
      historyItem.type = "move";
      cards[dest] = [...cards[dest], ...movedCards];
      setScore(score - 1);
    }

    cards[src] = remainCards;
    setCards([...cards]);
    setHistory([...history, historyItem]);
    return true;
  };

  /**
   * 是否可以从(col,row)移动
   * @param {numbe} col 列数
   * @param {number} row 行数
   */
  const canMoveFrom = (col, row) => {
    let len = cards[col].length;
    let movedCards = cards[col].slice(row, len);
    let suit = movedCards[0].suit;
    let point = movedCards[0].point;
    for (let c of movedCards) {
      // 不能移动
      if (c.point !== point || c.suit !== suit) return false;
      point = getNextPoint(point);
    }
    return true;
  };

  /**
   * 是否可以放置在col牌堆上
   * @param {number} col 列数
   * @param {string} point 要移动的牌堆的第一张牌的点数
   */
  const canMoveTo = (col, point) => {
    if (
      cards[col].length > 0 &&
      point !== getNextPoint(cards[col][cards[col].length - 1].point)
    ) {
      return false;
    }
    // 空牌堆依然可以移动
    return true;
  };

  /**
   * 检查移动的牌堆是否能和movedCards消除
   * 注意本函数有可能返回0,在判断此函数结果的时候要使用`!== false`
   * @param {number} dest
   * @param {Array} movedCards
   */
  const canMerge = (dest, movedCards) => {
    // 移动的牌堆没有到A直接返回false
    if (movedCards[movedCards.length - 1].point !== "A") return false;

    // 逐个比对dest牌堆检查是否到K
    let suit = movedCards[0].suit;
    let point = getPrevPoint(movedCards[0].point);
    let i = cards[dest].length - 1;
    while (
      i >= 0 &&
      cards[dest][i].point === point &&
      cards[dest][i].suit === suit
    ) {
      point = getPrevPoint(point);
      i--;
    }
    if (i + 1 < cards[dest].length && cards[dest][i + 1].point === "K") {
      return i + 1;
    } else {
      return false;
    }
  };

  /**
   * 发牌
   */
  const moreCards = () => {
    for (let i = 0; i < 10; i++) {
      let card = allCards.pop();
      card.display = true;
      cards[i].push(card);
    }
    setSelectedCard(null);
    setAllCards([...allCards]);
    setCards([...cards]);
    setHistory([...history, { type: "deal" }]);
  };

  /**
   * 撤销
   */
  const undo = () => {
    if (history.length > 0) {
      let latest = history.pop();
      const { src, dest } = latest;
      if (latest.type === "move") {
        if (latest.flip) {
          cards[src][cards[src].length - 1].display = false;
        }
        forceMove(latest.dest, latest.src, latest.num);
      } else if (latest.type === "merge") {
        if (latest.mergeWithFlip) {
          cards[dest][cards[dest].length - 1].display = false;
        }
        let finishedLen = finishedCards.length;
        cards[latest.dest] = [
          ...cards[latest.dest],
          ...finishedCards.slice(finishedLen - 13, finishedLen),
        ];
        forceMove(latest.dest, latest.src, latest.num);
        setFinishedCards(finishedCards.slice(0, finishedLen - 13));
      } else if (latest.type === "deal") {
        for (let i = 9; i >= 0; i--) {
          let card = cards[i].pop();
          card.display = false;
          allCards.push(card);
          setAllCards([...allCards]);
          setCards([...cards]);
        }
      }
      setScore(score - 1);
    }
  };

  /**
   *
   * @param {number} src 开始列数
   * @param {number} dest 结束列数
   * @param {number} num 数量
   */
  const forceMove = (src, dest, num) => {
    let len = cards[src].length;
    let movedCards = cards[src].slice(len - num, len);
    let remainCards = cards[src].slice(0, len - num);
    cards[src] = [...remainCards];
    cards[dest] = [...cards[dest], ...movedCards];
    setCards([...cards]);
  };

  const handleMenuClick = (e) => {
    e.preventDefault();
    setMenuOpen(!menuOpen);
  };

  return (
    <div className={styles.ui}>
      <div className={styles.topbar}>
        <span className={styles.btn} onClick={undo}>
          撤销
        </span>
        <details className={styles.details} open={menuOpen}>
          <summary onClick={handleMenuClick}>
            <OutsideClickHandler onOutsideClick={() => setMenuOpen(false)}>
              <div className={styles.btn}>重玩</div>
            </OutsideClickHandler>
          </summary>
          <div className={styles.chooseList}>
            <div onClick={() => restart(3)}>困难(四个花色)</div>
            <div onClick={() => restart(2)}>中等(两个花色)</div>
            <div onClick={() => restart(1)}>容易(一个花色)</div>
          </div>
        </details>
        <span className={styles.btn}>提示</span>
        <div className="spacer"></div>
        <div className={styles.score}>分数:{score}</div>
      </div>
      <div className={styles.game}>
        {cards.map((col, colIndex) => {
          return (
            <div className={styles.column} key={colIndex}>
              <div className={styles.holderWrapper}>
                <div
                  className={styles.holder}
                  onClick={(e) => select(colIndex, 0, true, e)}
                >
                  <div className={styles.holderInner}></div>
                </div>
              </div>
              {col.map(({ point, suit, display, index }, rowIndex) => {
                return (
                  <div
                    key={index}
                    className={classnames(styles.cardWrapper, {
                      [styles.display]: display,
                    })}
                  >
                    <Card
                      point={point}
                      suit={suit}
                      display={display}
                      selected={
                        selectedCard &&
                        rowIndex >= selectedCard.row &&
                        colIndex === selectedCard.col
                      }
                      onClick={(e) => select(colIndex, rowIndex, display, e)}
                      // onOutsideClick={() => setSelectedCard(null)}
                    />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      <div className={styles.control}>
        <div className={styles.cardStack}>
          {[...Array(Math.floor(finishedCards.length / 13)).keys()].map((i) => {
            return (
              <div className={styles.horizenWrapper} key={i}>
                <Card point={"K"} suit={finishedCards[i * 13].suit} display />
              </div>
            );
          })}
        </div>
        <div className="spacer"></div>
        <div className={classnames(styles.cardStack, "rotated")}>
          {[...Array(Math.floor(allCards.length / 10)).keys()].map((i) => {
            return (
              <div className={styles.horizenWrapper} key={i}>
                <Card point={"A"} suit={"♠"} onClick={moreCards} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Game;
