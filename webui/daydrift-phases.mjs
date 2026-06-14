// Hand-tuned source palettes for Daydrift's local-time color phases.
// Keep this file data-focused: the engine imports these values and handles
// interpolation, daily drift, and contrast/readability enforcement.

function palette(background, text, textMuted, primary, secondary, accent, messageBg, highlight, messageText, panel, border, input, inputFocus, chatBackground, tableRow, errorText, warningText) {
  return { background, text, textMuted, primary, secondary, accent, messageBg, highlight, messageText, panel, border, input, inputFocus, chatBackground, tableRow, errorText, warningText };
}

function phase(name, minute, palette) { return { name, minute, palette }; }

export const DEFAULT_PHASES = [
  phase('midnight', 0, palette('#09090b', '#e4e4e7', '#a1a2aa', '#8c47d1', '#7339ac', '#8c30e8', '#0c0d12', '#994ce6', '#e4e4e7', '#0c0d12', '#181a25', '#0c0d12', '#1b1d32', '#14141a', '#0c0d12', '#ff6b7a', '#d7a85f')),
  phase('deep_night', 120, palette('#09090b', '#e4e4e7', '#a1a2aa', '#8c47d1', '#7339ac', '#8c30e8', '#0c0d12', '#994ce6', '#e4e4e7', '#0c0d12', '#181a25', '#0c0d12', '#1b1d32', '#14141a', '#0c0d12', '#ff6b7a', '#d7a85f')),
  phase('predawn', 240, palette('#09090b', '#e4e4e7', '#a1a2aa', '#8c47d1', '#7339ac', '#8c30e8', '#0c0d12', '#994ce6', '#e4e4e7', '#0c0d12', '#181a25', '#0c0d12', '#1b1d32', '#14141a', '#0c0d12', '#ff6b7a', '#d7a85f')),
  phase('dawn', 360, palette('#17181c', '#e4e5e7', '#999ba3', '#8040bf', '#663d8f', '#7a3db8', '#2e3038', '#8541c8', '#e4e5e7', '#2e3038', '#303241', '#2e3038', '#33374d', '#22242c', '#2e3038', '#ff6b7a', '#d7a85f')),
  phase('sunrise', 480, palette('#22242a', '#dfdfe2', '#94969e', '#733fa6', '#613f83', '#6e3c9f', '#3d3e43', '#7a3db8', '#dfdfe2', '#3d3e43', '#3e404c', '#3d3e43', '#414558', '#3e414c', '#3d3e43', '#ff6b7a', '#d7a85f')),
  phase('morning', 600, palette('#686464', '#27292b', '#44494b', '#2e1547', '#331c4a', '#2e1547', '#726e6e', '#361556', '#27292b', '#686464', '#a1a7aa', '#979a9b', '#a4aaa1', '#e0e2e6', '#979a9b', '#686464', '#d7a85f')),
  phase('late_morning', 720, palette('#686464', '#282b27', '#464b44', '#2e1547', '#331c4a', '#2e1547', '#726e6e', '#361556', '#282b27', '#686464', '#a4aaa1', '#989b97', '#a7aaa4', '#e5e7eb', '#989b97', '#686464', '#d7a85f')),
  phase('solar_noon', 840, palette('#686464', '#2b2927', '#4b4944', '#2e1547', '#331c4a', '#2e1547', '#726e6e', '#361556', '#2b2927', '#686464', '#aaa7a1', '#9b9a97', '#ada9a4', '#e7e9ec', '#9b9a97', '#686464', '#d7a85f')),
  phase('afternoon', 960, palette('#686464', '#2b2927', '#4b4844', '#2e1547', '#331c4a', '#2e1547', '#726e6e', '#361556', '#2b2927', '#686464', '#aaa6a1', '#9b9997', '#ada8a4', '#e2e4e8', '#9b9997', '#686464', '#d7a85f')),
  phase('golden_hour', 1080, palette('#32343a', '#dcdce0', '#92949c', '#5a298c', '#4c2d70', '#572291', '#3e4046', '#602ca3', '#dcdce0', '#32343a', '#52545c', '#32343a', '#444650', '#6b6e7a', '#32343a', '#ff6b7a', '#d7a85f')),
  phase('dusk', 1200, palette('#131218', '#e6e4e7', '#99949e', '#8039c6', '#663894', '#7a31c4', '#26252e', '#853bce', '#e6e4e7', '#201f26', '#2b2a33', '#201f26', '#2c2a38', '#332640', '#201f26', '#ff6b7a', '#d7a85f')),
  phase('late_evening', 1320, palette('#0b0b0e', '#e7e7e9', '#a1a2aa', '#853bce', '#6b36a1', '#8529e0', '#0e0f15', '#8c3cdd', '#e7e7e9', '#0e0f15', '#14151f', '#0e0f15', '#171826', '#14151f', '#0e0f15', '#ff6b7a', '#d7a85f'))
];

