export const ALL_POINTS = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
];

export const POINTS_MAP = {
  A: 0,
  "2": 1,
  "3": 2,
  "4": 3,
  "5": 4,
  "6": 5,
  "7": 6,
  "8": 7,
  "9": 8,
  "10": 9,
  J: 10,
  Q: 11,
  K: 12,
};

export const pointLess = (p1, p2) => {
  return POINTS_MAP[p1] < POINTS_MAP[p2];
};

export const pointGreat = (p1, p2) => {
  return POINTS_MAP[p1] > POINTS_MAP[p2];
};
