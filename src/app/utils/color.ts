const cycleColors = [
  "#FDE047", // kuning terang
  "#92d14f", // hijau terang
  "#008001", //hijau gelap army
  "#22D3EE", // biru terang langit
  "#075985", // biru dongker laut
  "#6366F1", // ungu kebiruan cantik terang
  "#A78BFA", // lavender terang cantik
  "#F0ABFC", // ungu pink terang cantik
  "#F9A8D4", // pink kalem
  "#F43F5E", // merah lava
  "#1D4ED8", // biru gelap
  "#16A34A", // hijau lumut
];

export const getColor = (column: number) => {
  return cycleColors[column % cycleColors.length];
};
