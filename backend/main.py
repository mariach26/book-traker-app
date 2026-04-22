from fastapi import FastAPI, Depends
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from fastapi.middleware.cors import CORSMiddleware

# --- 1. Ρύθμιση Βάσης Δεδομένων (SQLite) ---
# Θα δημιουργήσει αυτόματα ένα αρχείο 'books.db' στον φάκελό σου
SQLALCHEMY_DATABASE_URL = "sqlite:///./books.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- 2. Το Μοντέλο της Βάσης (Πώς αποθηκεύεται το βιβλίο) ---
class BookDB(Base):
    __tablename__ = "books"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    finish_date = Column(String) 
    rating = Column(String) # Το κρατάμε String για αρχή (π.χ. '5/5')

# Δημιουργία του πίνακα στη βάση δεδομένων
Base.metadata.create_all(bind=engine)

# --- 3. Το Μοντέλο του API (Πώς περιμένουμε τα δεδομένα από τη React) ---
class BookCreate(BaseModel):
    title: str
    finish_date: str
    rating: str

app = FastAPI()

# --- 4. Ρύθμιση CORS (Απαραίτητο για να επικοινωνεί η React με την Python) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Επιτρέπει κλήσεις από παντού
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Βοηθητική συνάρτηση για να "ανοίγει" και να "κλείνει" τη βάση
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- 5. Τα API Endpoints ---

# A. Εμφάνιση όλων των βιβλίων
@app.get("/books")
def get_books(db: Session = Depends(get_db)):
    books = db.query(BookDB).all()
    return books

# B. Προσθήκη νέου βιβλίου
@app.post("/books")
def add_book(book: BookCreate, db: Session = Depends(get_db)):
    # Φτιάχνουμε μια νέα εγγραφή
    new_book = BookDB(title=book.title, finish_date=book.finish_date, rating=book.rating)
    # Την προσθέτουμε και τη σώζουμε
    db.add(new_book)
    db.commit()
    db.refresh(new_book)
    return {"message": "Το βιβλίο αποθηκεύτηκε με επιτυχία!", "book": new_book}