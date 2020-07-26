import React from "react";
import OutsideClickHandler from "react-outside-click-handler";
import classnames from "classnames";
import styles from "./Card.module.css";

const Card = (props) => {
  const { point, suit, onClick, onOutsideClick } = props;
  const display = props.display || false;
  const selected = props.selected || false;
  const flash = props.flash || false;

  const isRed = suit === "♥" || suit === "♦";

  const handleOusideClick = () => {
    if (onOutsideClick !== undefined) {
      onOutsideClick();
    }
  };

  return (
    <OutsideClickHandler
      disabled={!selected}
      onOutsideClick={handleOusideClick}
    >
      <div
        onClick={onClick}
        className={classnames(styles.card, {
          [styles.display]: display,
          [styles.selected]: selected,
          [styles.flash]: flash,
        })}
      >
        <div className={styles.cardInner}></div>
        {display && (
          <div className={styles.content}>
            <div
              className={classnames(styles.text, {
                [styles.red]: isRed,
              })}
            >
              <div>{point}</div>
              <div>{suit}</div>
            </div>
            <div className="spacer" />
            <div
              className={classnames("rotated", styles.text, {
                [styles.red]: isRed,
              })}
            >
              <div>{point}</div>
              <div>{suit}</div>
            </div>
          </div>
        )}
      </div>
    </OutsideClickHandler>
  );
};

export default Card;
