# LLAB PinModel

Unmodified Teachable Machine image model from Hinson commit d6f4adf3066161a6f950062e9e0f9e7823e7b51b. Exported 2026-10-19; integrated with the Nicholas UI on 2026-11-08.

Files: model.json, metadata.json, weights.bin (2,156,432 bytes).

Classes: Grévy's Zebra; Philippine Eagle; Iberian Lynx; Tree Pangolin; Green Sea Turtle; Blue Whale; Leopard Cat; other.

Seven animal classes, not fourteen. Training photos, session splits and measured real-piece accuracy were not supplied with the export. Model scores are not accuracy measurements. Defaults are 0.93 score / 0.20 margin / four consecutive camera frames, pending validation with real pieces. See ../../../training/README.md.

Both the main scanner and demo load this folder automatically through the relative path in site-config.js. Deploy the entire dist directory, including the label mappings and animal stories, to the GitHub Pages repository root.
