# Jungle King website preview

Source: Nicholas branch of Nicholassssssw/jungle-king-scan-lab, commit 2d1c98e.

- Scanner: https://nicholassssssw.github.io/jungle-king-preview/
- Demo: https://nicholassssssw.github.io/jungle-king-preview/demo.html

The active model is LLAB PinModel v3, exported 6 November 2026 in Hong Kong and installed on 9 November. It contains fourteen animal classes plus other, and loads from models/recognition-v3. The previous seven-animal export remains in models/recognition for rollback.

All fourteen labels connect to the existing complete English/Traditional Chinese stories, illustrations/artwork, conservation information and sources. The Aquatic Rat identity remains provisional. Six newer images are labelled animal illustrations rather than physical product replicas.

The scanner and demo share one shell, result renderer, styles and profile data. The customer page contains only the scanner; the demo is reached via its separate URL. The demo has fourteen animal buttons, previous/next and scan/result controls without requesting a camera or loading a model. Old result/prototype/QR links forward to demo. Model training and photo evaluation tools are preserved in the source repository's local-only lab.

Twenty automated regression checks pass; browser model loading and runtime compatibility were verified. Real-piece accuracy and threshold calibration remain unmeasured. Scores are not measured accuracy, and no training photos are published.
