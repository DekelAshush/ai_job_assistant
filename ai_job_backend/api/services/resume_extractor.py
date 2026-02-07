"""
Extract plain text from resume file bytes (PDF, DOCX). Used after upload to populate resume_text.
"""
import logging
from io import BytesIO
from typing import Optional

logger = logging.getLogger(__name__)


def extract_text_from_pdf(file_bytes: bytes) -> Optional[str]:
    """Extract text from PDF bytes. Returns None on failure."""
    try:
        from pypdf import PdfReader  # type: ignore[reportMissingImports]
        reader = PdfReader(BytesIO(file_bytes))
        parts = []
        for page in reader.pages:
            text = page.extract_text()
            if text and text.strip():
                parts.append(text.strip())
        return "\n\n".join(parts).strip() or None if parts else None
    except Exception as e:
        logger.warning("PDF text extraction failed: %s", e)
        return None


def extract_text_from_docx(file_bytes: bytes) -> Optional[str]:
    """Extract text from DOCX bytes. Returns None on failure."""
    try:
        from docx import Document  # type: ignore[reportMissingImports]
        doc = Document(BytesIO(file_bytes))
        parts = [p.text.strip() for p in doc.paragraphs if p.text and p.text.strip()]
        if not parts:
            return None
        return "\n\n".join(parts).strip()
    except Exception as e:
        logger.warning("DOCX text extraction failed: %s", e)
        return None


def extract_text_from_resume(file_bytes: bytes, filename: str) -> Optional[str]:
    """Extract text from resume file. Supports PDF and DOCX; other types return None."""
    ext = (filename.split(".")[-1] or "").lower()
    if ext == "pdf":
        return extract_text_from_pdf(file_bytes)
    if ext in ("docx", "doc"):
        return extract_text_from_docx(file_bytes)
    logger.info("Resume extract: unsupported type %s, skipping", ext)
    return None
