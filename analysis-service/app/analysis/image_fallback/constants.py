# -*- coding: utf-8 -*-
"""Thresholds for the image-only fallback analyser (P10).

Every value here was chosen against the six real figures embedded in
生物类似药药学评价比较.docx, not picked as a round number. The measurements that
drive them are recorded in log/2026-08-20-p10-图片降级分析器.md.
"""

from __future__ import annotations

TESSERACT_WINDOWS_PATH = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# Colour separation for mirrored spectra. image1.jpeg is JPEG-compressed, so the
# red and blue traces bleed into neighbouring pixels; the channel differences are
# deliberately loose enough to survive that while still rejecting grey axes.
RED_MIN_LEVEL = 110
RED_CHANNEL_MARGIN = 40
BLUE_MIN_LEVEL = 100
BLUE_VS_RED_MARGIN = 30
BLUE_VS_GREEN_MARGIN = 15

# A trace needs enough pixels to be a curve rather than a legend swatch. The
# weaker of the two traces in image1 carries 336 pixels.
MIN_TRACE_PIXELS = 200

# Peak picking on an extracted curve.
PEAK_PROMINENCE_FRACTION = 0.05
MIN_PEAK_SEPARATION_PX = 4

# Peak heights are measured above the trace's own baseline, not above zero.
# A column profile counts pixels, and every column carries the baseline stroke, so
# the thicker of two curves reports systematically taller small peaks. Measured on
# 完整抗体分子量.png: the red trace holds 3033 pixels and the blue one 4402, and the
# same physical minor peak scored 0.073 on red against 0.133 on blue — one side of
# the 5% cut each, which invented four peaks present in only one product.
# The low percentile estimates the baseline without being pulled by the peaks.
PEAK_BASELINE_PERCENTILE = 10.0

# Image-level comparison bands (P17). Calibrated, not chosen: profile correlation
# was measured for pairs that should look alike (the two products of one figure,
# six cases) and for pairs that cannot look alike (traces of different analytes
# crossed between figures, ten cases).
#
#   like-for-like  0.971 – 0.995   (and 0.694 for the figure whose weaker trace is
#                                   only partly detected)
#   different      -0.031 – 0.056
#
# The gap between 0.06 and 0.69 is wide enough that the bands below sit far from
# both populations. SSIM and DTW were measured over the same pairs and did not
# separate them at all — SSIM scored 0.66–0.92 for like-for-like against 0.76–0.91
# for different — so neither may drive this decision.
#
# 2026-08-22: the operator kept IMAGE_CONSISTENT_CORRELATION = 0.95. Negative
# samples remain cross-analyte pairs from the figure library, not true
# dissimilar-product pairs. The band is still only an algorithmQualityGate.
#
# These bands gate an image-level observation only. They are not a biosimilarity
# limit, and the regulatory verdict stays REVIEW regardless of which band applies.
IMAGE_CONSISTENT_CORRELATION = 0.95
IMAGE_DIFFERENT_CORRELATION = 0.30

# Layout detection (P17). Two-product figures come in two versions that cannot be
# compared the same way: a true mirror plot inverts one trace across a shared
# axis, while a stacked plot draws both traces upright in separate bands.
#
# The baseline of a spectrum is the row spanning the most columns, so its position
# inside a trace's own vertical band says which way that trace's peaks point. This
# criterion does not depend on how completely the curve was detected, which
# matters because the weaker trace of 完整分子量图谱.png carries only 336 pixels.
# Measured on the eight real figures: baseline position is 0.90–0.995 for upright
# traces and 0.0–0.03 for inverted ones, so the midpoint separates them with wide
# margin on both sides.
BASELINE_UPRIGHT_POSITION = 0.5

# A baseline row spanning almost no columns is not a baseline. The sparsest real
# case is the 336-pixel trace above, whose baseline row spans 8 columns.
MIN_BASELINE_ROW_COLUMNS = 4

# Corroboration: mirrored traces share one axis so their baselines sit next to
# each other, while stacked traces keep theirs a band apart. Measured 0.008 for
# the mirror figure against 0.32–0.42 for the stacked ones.
MIRROR_BASELINE_ADJACENCY_FRACTION = 0.1

# Trace shapes are compared on their own normalised canvas rather than on the
# rendered page, so that legends, axis labels and the vertical offset between
# bands cannot influence the score.
TRACE_SHAPE_CANVAS_PX = 256

# Peak pairing between the two traces, in normalised column position. Both traces
# of a two-product figure share the horizontal axis, so a genuine counterpart sits
# within a few pixels; 1% of the figure width is 9 px on these images.
PEAK_PAIR_MAX_NORMALISED_SHIFT = 0.01

# Calibration. Two reference points are the minimum for an affine axis map, and
# they must be far enough apart that pixel quantisation does not dominate the
# scale factor.
MIN_CALIBRATION_POINTS = 2
MIN_CALIBRATION_PIXEL_SPAN = 20.0

# Table OCR repair. Tesseract drops decimal points on this figure: 1544.7 was
# read as "15447" and 19.8 as "198". A candidate repair is only accepted when it
# lands within this relative distance of the theoretical mass on the same row,
# which makes the printed theoretical column act as a checksum.
MAX_TABLE_MASS_RELATIVE_ERROR = 0.01
OCR_DIGIT_CONFUSIONS = {"O": "0", "o": "0", "l": "1", "I": "1", "S": "5", "B": "8"}

# The theoretical column is only usable as a checksum if it is itself intact. On
# image4.png OCR read the theoretical mass 1544.7 as "15447", and validating the
# observed masses against that corrupted value "confirmed" two equally wrong
# numbers. Tryptic peptides of an antibody fall in this range, so a theoretical
# mass outside it is treated as unreadable rather than as a reference.
MIN_PLAUSIBLE_PEPTIDE_MASS_DA = 150.0
MAX_PLAUSIBLE_PEPTIDE_MASS_DA = 10000.0

# Retention time has no printed redundancy on this figure, so a dropped decimal
# point in it cannot be detected the way a mass error can: OCR returned 198 for
# 19.8 and 14.1 as 141 with nothing to contradict it. Retention times are
# therefore reported only when they fall inside the run window, and flagged
# unvalidated regardless, since no checksum backs them.
MAX_PLAUSIBLE_RETENTION_TIME_MIN = 120.0

# Coverage percentages are printed as plain text and OCR reads them cleanly on
# image6, so no repair heuristics are applied to them.
COVERAGE_DEFINITION_LABELS = {
    "control coverage": "control",
    "control unique coverage": "control",
    "combined coverage": "combined",
    "common coverage": "common",
    "analyte coverage": "analyte",
    "analyte unique coverage": "analyte-unique",
}

# Similarity metrics are reported for orientation only and never drive a verdict.
DTW_MAX_SERIES_POINTS = 512
