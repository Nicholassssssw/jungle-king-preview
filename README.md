# Jungle King website preview

Source: Nicholas branch of Nicholassssssw/jungle-king-scan-lab, commit bcd9739.

Two public pages:
- Scanner: https://nicholassssssw.github.io/jungle-king-preview/
- Demo: https://nicholassssssw.github.io/jungle-king-preview/demo.html

The scanner and demo share the same shell, result components, rendering code, styles and bilingual stories. The scanner uses the camera and bundled seven-animal model. The demo offers all fourteen example stories through animal buttons, previous/next, scan/result controls and shareable animal/view URLs, without requesting a camera or loading a model. Example results do not claim camera recognition.

The previous recognition coverage sentence is removed from the scanner. Old result-preview/prototype/QR page links forward to the demo and preserve animal query parameters. Model training, photo evaluation and QR/3D tools remain in the source repository’s local-only lab area.

The installed model remains the 19 October 2026 export (seven animals plus other). A newly supplied fourteen-animal model was reviewed but is not deployed in this UI update. No physical-piece accuracy measurement is claimed. Twenty automated checks and browser navigation, result, simulated scan-flow and narrow-layout checks passed.
