import React, { useState, useEffect } from "react";
import classnames from "classnames";
import styles from "./Card.module.css";

const Card = (props) => {
  const { point, suit, onClick, onMouseUp, onCardMouseUp, onMouseDown } = props;
  const display = props.display || false;
  const flash = props.flash || false;
  const flashSrc = props.flashSrc || false;
  const [cardPosition, setCardPosition] = useState({ x: 0, y: 0 });
  const selected = props.selected || false;

  const isRed = suit === "♥" || suit === "♦";

  useEffect(() => {
    if (selected) {
      // 开始拖动
      const handleWindowMouseMove = ({ clientX, clientY }) => {
        setCardPosition({
          x: clientX - selected.x,
          y: clientY - selected.y,
        });
      };
      const handleWindowMouseUp = () => {
        onMouseUp();
      };
      window.addEventListener("mousemove", handleWindowMouseMove);
      window.addEventListener("mouseup", handleWindowMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleWindowMouseMove);
        window.removeEventListener("mouseup", handleWindowMouseUp);
      };
    } else {
      setCardPosition({ x: 0, y: 0 });
    }
  }, [selected, onMouseUp]);

  const cProps = {
    className: classnames(styles.card, {
      [styles.back]: !display,
      [styles.display]: display,
      [styles.selected]: selected,
      [styles.flash]: flash,
      [styles.flashSrc]: flashSrc,
    }),
    style: {
      transform: `translate(${cardPosition.x}px, ${cardPosition.y}px)`,
      zIndex: selected ? 100 : 1,
      position: "relative",
    },
  };

  if (onClick) cProps.onClick = onClick;

  if (onMouseDown) {
    cProps.onMouseDown = (e) => {
      if (e.button === 0) {
        const { clientX, clientY } = e;
        onMouseDown(clientX, clientY);
      }
    };
  }

  if (onCardMouseUp) cProps.onMouseUp = onCardMouseUp;

  return (
    <div {...cProps}>
      <div className={styles.cardInner}></div>
      {display && (
        <div className={styles.content}>
          <div
            className={classnames(styles.text, {
              [styles.red]: isRed,
            })}
          >
            <div>{point}</div>
            <div className="spacer"></div>
            <div>{suit}</div>
          </div>
          <div className="spacer" />
          <div
            className={classnames("rotated", styles.text, {
              [styles.red]: isRed,
            })}
          >
            <div>{point}</div>
            <div className="spacer"></div>
            <div>{suit}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Card;
