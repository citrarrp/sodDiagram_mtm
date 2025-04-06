const cycleColors = [
  "#FDE047",
  "#A3E635",
  "#3F6212",
  "#22D3EE",
  "#075985",
  "#6366F1",
  "#A78BFA",
  "#F0ABFC",
  "#F9A8D4",
  "#F43F5E",
  "#1D4ED8",
  "#16A34A",
];

export const getColor = (column: number) => {
  return cycleColors[column % cycleColors.length];
};
