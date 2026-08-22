# -*- coding: utf-8 -*-
"""Image loading for the fallback analyser."""

from __future__ import annotations

from pathlib import Path

import numpy as np

from app.security.limits import MAX_IMAGE_PIXELS


class ImageLoadError(ValueError):
    """Raised when an image cannot be used as analysis input."""


def load_bgr_image(path: Path) -> np.ndarray:
    """Read an image as a BGR array.

    cv2.imread cannot open non-ASCII paths on Windows, so the bytes are read in
    Python and decoded from memory. This sidesteps D22 without staging a copy.
    """
    import cv2

    if not path.is_file():
        raise ImageLoadError(f"image not found: {path.name}")

    payload = np.frombuffer(path.read_bytes(), dtype=np.uint8)
    image = cv2.imdecode(payload, cv2.IMREAD_COLOR)
    if image is None:
        raise ImageLoadError(f"image could not be decoded: {path.name}")

    height, width = image.shape[:2]
    if height * width > MAX_IMAGE_PIXELS:
        raise ImageLoadError(f"image exceeds the pixel budget: {path.name}")
    return image


def to_grayscale(image: np.ndarray) -> np.ndarray:
    import cv2

    return cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
