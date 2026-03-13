import fitz # pyre-ignore[21]

def extract_pdf():
    try:
        doc = fitz.open(r"C:\Users\USER\Downloads\Hackathon_project_flow.pdf")
        with open(r"C:\Users\USER\Desktop\HackNortune\pdf_text.txt", "w", encoding="utf-8") as f:
            for page in doc:
                f.write(page.get_text())
        print("Success")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    extract_pdf()
