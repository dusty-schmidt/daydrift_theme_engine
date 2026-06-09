# Daydrift Theme Engine - Final Punch Out List

- [x] Tweak Golden Hour phase to use cool slate-grey tones and remove copper-orange
- [x] **Task 1: Preview Cycle Button & Stop UI**
  - Remove 30-second hard limit in settings preview
  - Add a floating "Stop Preview" button on the WebUI when preview is active so users can run it indefinitely
- [x] **Task 2: Dawn/Predawn Brightness Adjustments**
  - Tone down the dawn phase's blinding white chat background (currently '#d6d1c7') so it transitions smoothly
  - Set midday (solar_noon/afternoon) chat background anchor to a solid solarized light grey (e.g., `#e6e8ea` or `#ebeced` instead of `#d3d7d9`) that allows pale blue/green daily drift
- [x] **Task 3: Mute Dusk Phase Panels**
  - Dial back the excessive deep violet in dusk panel/background towards slate/grey with a subtle violet hint
- [x] **Task 4: Inject Color Accents (Solve Monochrome Issue)**
  - Analyze why accents are monochrome and restore rich, high-variability daily color wheel drifts
- [x] **Task 5: Final UI Polish Fixes**
  - Make bottom input text/caret/selection follow frame text so daytime phases use dark readable text
  - Switch golden-hour Agent Zero logo shadow to accent neon underglow
  - Keep expanded settings submenu highlight neutral while settings icons use the live accent color
  - Smooth composer text from light to dark across sunrise→morning and dark to light across afternoon→golden_hour
  - Speed up preview cycle from 60s to 45s and add regression coverage for default preview timing
