"""
Generate clean, printed-style demo medical document images.

Produces:
  - demo_doc1_prescription.png  — Dr. Anjali Mehta, July 8, 2026, Fever, Crocin 650mg
  - demo_doc2_lab_report.png    — PathCare Diagnostics, July 12, 2026, CBC panel
  - demo_doc3_prescription.png  — Dr. Suresh Rao, July 15, 2026, Headache, Dolo 650mg

Usage:
  python generate_demo_docs.py
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont
import os

OUTPUT_DIR = Path(__file__).parent / "demo_documents"
FONT_DIR = "/System/Library/Fonts"

FONT_REGULAR = os.path.join(FONT_DIR, "Helvetica.ttc")
FONT_BOLD = os.path.join(FONT_DIR, "Helvetica.ttc")

OUTPUT_DIR.mkdir(exist_ok=True)

def _get_font(size, bold=False):
    try:
        if bold:
            return ImageFont.truetype(FONT_REGULAR, size, index=1)
        return ImageFont.truetype(FONT_REGULAR, size, index=0)
    except (IOError, OSError):
        try:
            return ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", size, index=0)
        except (IOError, OSError):
            return ImageFont.load_default()


def _draw_text(draw, xy, text, font, fill=(30, 30, 30)):
    draw.text(xy, text, font=font, fill=fill)


def generate_prescription_1():
    img = Image.new("RGB", (800, 550), (255, 255, 255))
    draw = ImageDraw.Draw(img)

    font_s = _get_font(13)
    font_m = _get_font(15)
    font_l = _get_font(22, bold=True)
    font_xl = _get_font(26, bold=True)
    font_bold_s = _get_font(13, bold=True)
    font_bold_m = _get_font(15, bold=True)

    # Header
    _draw_text(draw, (40, 30), "MEDIFLOW MEDICAL CENTER", font_xl, (20, 80, 160))
    _draw_text(draw, (40, 68), "123 Health Avenue, Cityville — Tel: +91-98765-43210", font_s, (100, 100, 100))

    draw.line([(40, 100), (760, 100)], fill=(200, 200, 200), width=1)

    # Title
    _draw_text(draw, (320, 115), "PRESCRIPTION", font_l, (20, 80, 160))

    # Left info
    _draw_text(draw, (40, 155), "Patient Name: ___________________      Age/Sex: _____________", font_m)
    _draw_text(draw, (40, 185), "Date: 08/07/2026", font_m)
    _draw_text(draw, (40, 215), "Doctor: Dr. Anjali Mehta (MBBS, MD)", font_bold_m)
    _draw_text(draw, (40, 245), "Registration No.: MCI-12-34567", font_s, (100, 100, 100))

    draw.line([(40, 270), (760, 270)], fill=(220, 220, 220), width=1)

    # Diagnosis
    _draw_text(draw, (40, 285), "Diagnosis:", font_bold_m)
    _draw_text(draw, (140, 285), "Fever (Febrile Illness, Acute onset)", font_m)

    # Medications
    _draw_text(draw, (40, 325), "Rx:", font_bold_m)

    # Table header
    draw.rectangle([(40, 345), (760, 370)], fill=(240, 244, 255), outline=None)
    _draw_text(draw, (55, 350), "#", font_bold_s)
    _draw_text(draw, (85, 350), "Medication", font_bold_s)
    _draw_text(draw, (280, 350), "Dosage", font_bold_s)
    _draw_text(draw, (420, 350), "Frequency", font_bold_s)
    _draw_text(draw, (580, 350), "Duration", font_bold_s)

    # Row 1
    _draw_text(draw, (55, 380), "1.", font_m)
    _draw_text(draw, (85, 380), "Tab. Crocin 650mg", font_bold_m)
    _draw_text(draw, (280, 380), "650mg", font_m)
    _draw_text(draw, (420, 380), "Twice Daily (Morning & Evening)", font_m)
    _draw_text(draw, (580, 380), "5 days", font_m)

    # Additional notes
    draw.line([(40, 430), (760, 430)], fill=(220, 220, 220), width=1)
    _draw_text(draw, (40, 440), "Notes:", font_bold_s)
    _draw_text(draw, (95, 440), "Take after meals. Avoid alcohol. Stay hydrated.", font_s)
    _draw_text(draw, (40, 465), "Follow-up:", font_bold_s)
    _draw_text(draw, (120, 465), "If fever persists beyond 3 days, return for review.", font_s)

    # Signature
    _draw_text(draw, (560, 500), "Dr. Anjali Mehta", font_m)
    draw.line([(560, 518), (740, 518)], fill=(30, 30, 30), width=1)

    path = OUTPUT_DIR / "demo_doc1_prescription.png"
    img.save(path)
    print(f"  ✓ Saved {path}")
    return path


def generate_lab_report():
    img = Image.new("RGB", (800, 600), (255, 255, 255))
    draw = ImageDraw.Draw(img)

    font_s = _get_font(13)
    font_m = _get_font(15)
    font_l = _get_font(22, bold=True)
    font_xl = _get_font(26, bold=True)
    font_bold_s = _get_font(13, bold=True)
    font_bold_m = _get_font(15, bold=True)

    # Header
    _draw_text(draw, (40, 30), "PATHCARE DIAGNOSTICS", font_xl, (20, 80, 160))
    _draw_text(draw, (40, 68), "456 Lab Road, Cityville — Tel: +91-98765-43211", font_s, (100, 100, 100))

    draw.line([(40, 100), (760, 100)], fill=(200, 200, 200), width=1)

    # Title
    _draw_text(draw, (300, 115), "LABORATORY REPORT", font_l, (20, 80, 160))

    # Info
    _draw_text(draw, (40, 155), "Patient Name: ___________________      Age/Sex: _____________", font_m)
    _draw_text(draw, (40, 185), "Collection Date: 12/07/2026      Report Date: 12/07/2026", font_m)
    _draw_text(draw, (40, 215), "Referred By: Dr. Anjali Mehta", font_bold_m)
    _draw_text(draw, (40, 245), "Test: Complete Blood Count (CBC)", font_bold_m)

    draw.line([(40, 270), (760, 270)], fill=(220, 220, 220), width=1)

    # Results table
    draw.rectangle([(40, 280), (760, 305)], fill=(240, 244, 255), outline=None)
    _draw_text(draw, (55, 285), "Test Parameter", font_bold_s)
    _draw_text(draw, (280, 285), "Result", font_bold_s)
    _draw_text(draw, (410, 285), "Reference Range", font_bold_s)
    _draw_text(draw, (580, 285), "Status", font_bold_s)

    results = [
        ("Hemoglobin", "14.2 g/dL", "13.0 - 17.0 g/dL", "Normal"),
        ("WBC Count", "7,500 /µL", "4,000 - 11,000 /µL", "Normal"),
        ("Platelet Count", "2,50,000 /µL", "1,50,000 - 4,50,000 /µL", "Normal"),
        ("RBC Count", "5.1 M/µL", "4.5 - 5.5 M/µL", "Normal"),
        ("WBC Differential", "Normal distribution", "—", "Normal"),
    ]

    for i, (param, result, ref, status) in enumerate(results):
        y = 315 + i * 32
        _draw_text(draw, (55, y), param, font_m)
        _draw_text(draw, (280, y), result, font_bold_m if i == 0 else font_m)
        _draw_text(draw, (410, y), ref, font_s, (100, 100, 100))
        status_color = (30, 160, 60) if status == "Normal" else (200, 100, 30)
        _draw_text(draw, (580, y), status, font_bold_s, status_color)

    draw.line([(40, 480), (760, 480)], fill=(220, 220, 220), width=1)

    _draw_text(draw, (40, 495), "Impression:", font_bold_m)
    _draw_text(draw, (135, 495), "All parameters within normal range.", font_m)
    _draw_text(draw, (40, 525), "Technician:", font_s, (100, 100, 100))
    _draw_text(draw, (135, 525), "Mr. R. Sharma (Lab Technician)", font_s, (100, 100, 100))
    _draw_text(draw, (40, 550), "Report verified by:", font_s, (100, 100, 100))
    _draw_text(draw, (180, 550), "Dr. P. Patel (Pathologist)", font_s, (100, 100, 100))

    path = OUTPUT_DIR / "demo_doc2_lab_report.png"
    img.save(path)
    print(f"  ✓ Saved {path}")
    return path


def generate_prescription_2():
    img = Image.new("RGB", (800, 550), (255, 255, 255))
    draw = ImageDraw.Draw(img)

    font_s = _get_font(13)
    font_m = _get_font(15)
    font_l = _get_font(22, bold=True)
    font_xl = _get_font(26, bold=True)
    font_bold_s = _get_font(13, bold=True)
    font_bold_m = _get_font(15, bold=True)

    # Header
    _draw_text(draw, (40, 30), "CITY HEALTH CLINIC", font_xl, (30, 100, 70))
    _draw_text(draw, (40, 68), "789 Wellness Street, Cityville — Tel: +91-98765-43212", font_s, (100, 100, 100))

    draw.line([(40, 100), (760, 100)], fill=(200, 200, 200), width=1)

    # Title
    _draw_text(draw, (320, 115), "PRESCRIPTION", font_l, (30, 100, 70))

    # Left info
    _draw_text(draw, (40, 155), "Patient Name: ___________________      Age/Sex: _____________", font_m)
    _draw_text(draw, (40, 185), "Date: 15/07/2026", font_m)
    _draw_text(draw, (40, 215), "Doctor: Dr. Suresh Rao (MBBS, MD - Neurology)", font_bold_m)
    _draw_text(draw, (40, 245), "Registration No.: MCI-98-76543", font_s, (100, 100, 100))

    draw.line([(40, 270), (760, 270)], fill=(220, 220, 220), width=1)

    # Diagnosis
    _draw_text(draw, (40, 285), "Diagnosis:", font_bold_m)
    _draw_text(draw, (140, 285), "Headache (Tension-type)", font_m)

    # Medications
    _draw_text(draw, (40, 325), "Rx:", font_bold_m)

    # Table header
    draw.rectangle([(40, 345), (760, 370)], fill=(230, 245, 235), outline=None)
    _draw_text(draw, (55, 350), "#", font_bold_s)
    _draw_text(draw, (85, 350), "Medication", font_bold_s)
    _draw_text(draw, (280, 350), "Dosage", font_bold_s)
    _draw_text(draw, (420, 350), "Frequency", font_bold_s)
    _draw_text(draw, (580, 350), "Duration", font_bold_s)

    # Row 1
    _draw_text(draw, (55, 380), "1.", font_m)
    _draw_text(draw, (85, 380), "Dolo 650mg", font_bold_m)
    _draw_text(draw, (280, 380), "650mg", font_m)
    _draw_text(draw, (420, 380), "Once daily, only as needed (PRN)", font_m)
    _draw_text(draw, (580, 380), "7 days", font_m)

    # Additional notes
    draw.line([(40, 430), (760, 430)], fill=(220, 220, 220), width=1)
    _draw_text(draw, (40, 440), "Notes:", font_bold_s)
    _draw_text(draw, (95, 440), "Take only if headache persists. Do not exceed 2 tablets in 24 hours.", font_s)
    _draw_text(draw, (40, 465), "Follow-up:", font_bold_s)
    _draw_text(draw, (120, 465), "29/07/2026 — Please schedule a follow-up appointment.", font_bold_m, (180, 60, 60))

    # Signature
    _draw_text(draw, (560, 500), "Dr. Suresh Rao", font_m)
    draw.line([(560, 518), (740, 518)], fill=(30, 30, 30), width=1)

    path = OUTPUT_DIR / "demo_doc3_prescription_2.png"
    img.save(path)
    print(f"  ✓ Saved {path}")
    return path


def generate_lab_report_2():
    img = Image.new("RGB", (800, 600), (255, 255, 255))
    draw = ImageDraw.Draw(img)

    font_s = _get_font(13)
    font_m = _get_font(15)
    font_l = _get_font(22, bold=True)
    font_xl = _get_font(26, bold=True)
    font_bold_s = _get_font(13, bold=True)
    font_bold_m = _get_font(15, bold=True)

    # Header
    _draw_text(draw, (40, 30), "METROPOLIS CLINICAL LABS", font_xl, (20, 80, 160))
    _draw_text(draw, (40, 68), "789 Health Boulevard, Cityville — Tel: +91-98765-43212", font_s, (100, 100, 100))

    draw.line([(40, 100), (760, 100)], fill=(200, 200, 200), width=1)

    # Title
    _draw_text(draw, (300, 115), "LABORATORY REPORT", font_l, (20, 80, 160))

    # Info
    _draw_text(draw, (40, 155), "Patient Name: ___________________      Age/Sex: _____________", font_m)
    _draw_text(draw, (40, 185), "Collection Date: 20/07/2026      Report Date: 20/07/2026", font_m)
    _draw_text(draw, (40, 215), "Referred By: Dr. Suresh Rao", font_bold_m)
    _draw_text(draw, (40, 245), "Test: Complete Blood Count (CBC)", font_bold_m)

    draw.line([(40, 270), (760, 270)], fill=(220, 220, 220), width=1)

    # Results table
    draw.rectangle([(40, 280), (760, 305)], fill=(240, 244, 255), outline=None)
    _draw_text(draw, (55, 285), "Test Parameter", font_bold_s)
    _draw_text(draw, (280, 285), "Result", font_bold_s)
    _draw_text(draw, (410, 285), "Reference Range", font_bold_s)
    _draw_text(draw, (580, 285), "Status", font_bold_s)

    results = [
        ("Hemoglobin", "13.9 g/dL", "13.0 - 17.0 g/dL", "Normal"),
        ("WBC Count", "8,100 /µL", "4,000 - 11,000 /µL", "Normal"),
        ("Platelet Count", "2,65,000 /µL", "1,50,000 - 4,50,000 /µL", "Normal"),
        ("RBC Count", "5.0 M/µL", "4.5 - 5.5 M/µL", "Normal"),
        ("WBC Differential", "Normal distribution", "—", "Normal"),
    ]

    for i, (param, result, ref, status) in enumerate(results):
        y = 315 + i * 32
        _draw_text(draw, (55, y), param, font_m)
        _draw_text(draw, (280, y), result, font_bold_m if i == 0 else font_m)
        _draw_text(draw, (410, y), ref, font_s, (100, 100, 100))
        status_color = (30, 160, 60) if status == "Normal" else (200, 100, 30)
        _draw_text(draw, (580, y), status, font_bold_s, status_color)

    draw.line([(40, 480), (760, 480)], fill=(220, 220, 220), width=1)

    _draw_text(draw, (40, 495), "Impression:", font_bold_m)
    _draw_text(draw, (135, 495), "Hemogram parameters normal. No significant anomalies.", font_m)
    _draw_text(draw, (40, 525), "Technician:", font_s, (100, 100, 100))
    _draw_text(draw, (135, 525), "Mr. A. Kumar (Lab Technician)", font_s, (100, 100, 100))
    _draw_text(draw, (40, 550), "Report verified by:", font_s, (100, 100, 100))
    _draw_text(draw, (180, 550), "Dr. S. Roy (Pathologist)", font_s, (100, 100, 100))

    path = OUTPUT_DIR / "demo_doc4_lab_report_2.png"
    img.save(path)
    print(f"  ✓ Saved {path}")
    return path


def main():
    print("Generating demo medical documents...")
    doc1 = generate_prescription_1()
    doc2 = generate_lab_report()
    doc3 = generate_prescription_2()
    doc4 = generate_lab_report_2()
    print(f"\nAll 4 documents saved to: {OUTPUT_DIR}")
    print(f"  1. {doc1.name}")
    print(f"  2. {doc2.name}")
    print(f"  3. {doc3.name}")
    print(f"  4. {doc4.name}")
    print("\nNext step: Run real extraction to verify fixtures:")
    print("  MOCK_MODE=false python3 main.py")


if __name__ == "__main__":
    main()
