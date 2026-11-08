# LLAB PinModel v3 · active model

Imported unchanged from the user-supplied LLAB PinModel-3.zip on 9 November 2026. The model in jungle-king-scan-lab-v3-model.zip is byte-identical.

Export timestamp: 2026-11-05T16:33:22.977Z (6 November in Hong Kong). Input: 224 × 224. Output: fourteen animal classes plus other. Files: model.json, metadata.json, weights.bin (2,159,232 bytes).

Classes: Grévy's Zebra; Philippine Eagle; Iberian Lynx; Tree Pangolin; Green Sea Turtle; Blue Whale; Leopard Cat; Asian Elephant; West African Lion; Malayan Tiger; Formosan Black Bear; Indochinese Leopard; African Wild Dog; Aquatic Rat; other.

Every animal label maps to an existing sourced bilingual profile. The Aquatic Rat species identity remains provisional. The website's completed information and illustrations are retained; no draft content from the supplied website is copied.

The main scanner and local training tool load this versioned folder through site-config.js. The presentation demo uses the same stories and renderer without loading a model. The previous seven-animal export remains in ../recognition/ for rollback.

Defaults remain 0.93 minimum model score, 0.20 winner margin and four consecutive matching frames. Runtime compatibility has been checked; generated empty inputs were rejected. No separate-session physical-piece accuracy report was supplied, so no accuracy claim or threshold calibration is inferred.

SHA-256:
- model.json: 5051e776eeafb2d65a963d1200b359f8be17277d16a6367b9d489b85b74e761a
- metadata.json: 760bae72246d24a7154ecad9a73adb7272996d4dbf1e8925e219589faf11b7d9
- weights.bin: 12ea7a7784c55c4040c8fcf22d0c9bb2a5e240619060d92003df58d817119447
