// Shared periodic-table helpers: grid positions and category colours.
window.PT = (() => {
  const CAT = {
    'Alkali metal': '#cbff2e', 'Alkaline earth metal': '#7dffb2', 'Transition metal': '#ad7dff', 'Post-transition metal': '#5ee7ff',
    'Metalloid': '#ffb547', 'Nonmetal': '#dcdfff', 'Halogen': '#ff7ad9', 'Noble gas': '#ff8f6b', 'Lanthanide': '#9aa3d9', 'Actinide': '#f6c453',
  };
  // row 1-7 main table, row 9 lanthanides, row 10 actinides (row 8 is a spacer)
  function pos(z) {
    if (z === 1) return [1, 1]; if (z === 2) return [1, 18];
    if (z <= 10) return [2, z <= 4 ? z - 2 : z + 8];
    if (z <= 18) return [3, z <= 12 ? z - 10 : z];
    if (z <= 36) return [4, z - 18];
    if (z <= 54) return [5, z - 36];
    if (z <= 56) return [6, z - 54];
    if (z <= 71) return [9, z - 54];
    if (z <= 86) return [6, z - 68];
    if (z <= 88) return [7, z - 86];
    if (z <= 103) return [10, z - 86];
    return [7, z - 100];
  }
  const color = e => CAT[e.g] || '#dcdfff';
  return { CAT, pos, color };
})();
