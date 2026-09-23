# Direct Partnership Database: data update

This update preserves the original site's structure, design, and filters, with one small usability change: show up to 60 matching cards at first and a **Load more** button if needed.

- **Kaplan / University of Alberta / Canada:** replaces the existing placeholder with eight undergraduate Year One Foundation faculty/campus groups and 119 named bachelor progression options, with published requirements, dates, progression GPAs and annual fees taken from the supplied Kaplan Fall 2027 PDF. A pathway is **not** a direct bachelor offer. Keep programme-level progression GPA distinct from the foundation entry-grade requirement.
- **LCI:** 312 institution entries imported from `LCI.xlsx`, with country from the spreadsheet header or the explicit country column. Course/level/fees are intentionally unspecified in the source.
- **StudyIn:** 319 institution entries imported from `StudyIn Universities 2026.xlsx`, preserving territory and programme restrictions in the notes. 241 institution countries cannot be reliably determined from the StudyIn file or exact matches in the existing/LCI portfolios, so their country is left empty and marked for confirmation (rather than fabricated). Countries from cross-matches are *not* an indication of route eligibility.

Source caution: The supplied Alberta document states publication date June 11, 2027, later than the current date of September 2026. Its future-dated information needs verification with Kaplan before making student commitments. Fees are reproduced using the source `$` symbol without assuming currency. StudyIn coverage is a list of institutions and restrictions, not evidence of every programme's availability for every nationality; check contractual restrictions before applying.

To publish, upload/replace `partnerships.json`, `app.js`, `style.css`, and this optional note in your GitHub Pages repository, or upload the entire included folder. The live website is not changed by downloading this ZIP.
