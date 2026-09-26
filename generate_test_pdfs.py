import os
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

def create_pdf(filename, title, content_lines):
    c = canvas.Canvas(filename, pagesize=letter)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(72, 750, title)
    
    c.setFont("Helvetica", 12)
    y = 710
    for line in content_lines:
        c.drawString(72, y, line)
        y -= 20
        if y < 72:
            c.showPage()
            c.setFont("Helvetica", 12)
            y = 750
            
    c.save()

def main():
    os.makedirs('test_pdfs', exist_ok=True)
    
    # 1. Syllabus
    create_pdf('test_pdfs/CS101_Syllabus.pdf', 'CS101: Introduction to Computer Science - Syllabus', [
        "Course Overview:",
        "This course introduces the fundamental concepts of computer science.",
        "Students will learn programming, algorithms, and data structures.",
        "",
        "Grading:",
        "- Assignments: 40%",
        "- Midterm: 30%",
        "- Final Exam: 30%",
        "",
        "Prerequisites: None."
    ])
    
    # 2. Academic Calendar
    create_pdf('test_pdfs/Academic_Calendar_Fall2026.pdf', 'Academic Calendar - Fall 2026', [
        "Important Dates:",
        "Sept 1: First day of classes",
        "Sept 15: Last day to drop/add courses",
        "Oct 20-22: Fall Break",
        "Nov 26-28: Thanksgiving Break",
        "Dec 10: Last day of classes",
        "Dec 12-18: Final Exams",
        "Dec 22: Grades due"
    ])
    
    # 3. Class Notes
    create_pdf('test_pdfs/CS101_Lecture_Notes.pdf', 'CS101 Lecture Notes - Week 1', [
        "Topic: Introduction to Algorithms",
        "",
        "What is an algorithm?",
        "An algorithm is a step-by-step procedure for solving a problem.",
        "",
        "Properties of a good algorithm:",
        "1. Finiteness (must terminate)",
        "2. Definiteness (clear and unambiguous)",
        "3. Input (0 or more inputs)",
        "4. Output (1 or more outputs)",
        "5. Effectiveness (can be carried out in practice)"
    ])
    
    print("Test PDFs generated successfully in 'test_pdfs' folder.")

if __name__ == "__main__":
    main()
