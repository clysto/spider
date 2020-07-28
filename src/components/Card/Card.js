import React, { useState, useRef, useEffect, useCallback } from "react";
import classnames from "classnames";
import styles from "./Card.module.css";

const Card = (props) => {
  const { point, suit, onClick, onMouseUp, onCardMouseUp, onMouseDown } = props;
  const display = props.display || false;
  const selected = props.selected || false;
  const flash = props.flash || false;
  const flashSrc = props.flashSrc || false;
  const [startPosition, _setStartPosition] = useState(null);
  const [cardPosition, setCardPosition] = useState({ x: 0, y: 0 });

  const isRed = suit === "♥" || suit === "♦";

  const startPositionRef = useRef(startPosition);

  const handleWindowMouseUp = useCallback(() => {
    onMouseUp();
    setStartPosition(null);
    setCardPosition({ x: 0, y: 0 });
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleWindowMouseUp);
  }, []);

  const handleMouseMove = useCallback(({ clientX, clientY }) => {
    if (startPositionRef.current) {
      setCardPosition({
        x: clientX - startPositionRef.current.x,
        y: clientY - startPositionRef.current.y,
      });
    }
  }, []);

  useEffect(() => {
    if (selected) {
      setStartPosition({ x: selected.x, y: selected.y });
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleWindowMouseUp);
    }
  }, [selected]);

  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleWindowMouseUp);
    };
  }, []);

  const setStartPosition = (data) => {
    startPositionRef.current = data;
    _setStartPosition(data);
  };

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
    cProps.onMouseDown = ({ clientX, clientY }) => {
      onMouseDown(clientX, clientY);
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
