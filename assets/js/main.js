const BOOKS_STORAGE_KEY = "BOOKSHELF_APPS";
let books = [];

function saveBooks() {
  localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(books));
}

function loadBooks() {
  const storedBooks = localStorage.getItem(BOOKS_STORAGE_KEY);
  books = storedBooks ? JSON.parse(storedBooks) : [];
}

document.addEventListener("DOMContentLoaded", function () {
  loadBooks();
  renderBooks();
});

const isValidAuthor = (author) => /^[a-zA-Z\s.,-]+$/.test(author.trim());
const isValidYear = (year) => {
  const parsedYear = parseInt(year);
  return parsedYear >= 1455 && parsedYear <= new Date().getFullYear();
};
const isValidTitle = (title) => /^[a-zA-Z0-9\s.,!?'"-]+$/.test(title.trim());

document.getElementById("bookForm").addEventListener("submit", function (event) {
  event.preventDefault();
  const title = document.getElementById("bookFormTitle").value.trim();
  const author = document.getElementById("bookFormAuthor").value.trim();
  const year = document.getElementById("bookFormYear").value.trim();
  const isComplete = document.getElementById("bookFormIsComplete").checked;

  if (!isValidTitle(title)) {
    alert("Judul buku hanya boleh mengandung huruf, angka, dan simbol umum (.,!?'-)");
    return;
  }
  if (!isValidAuthor(author)) {
    alert("Nama penulis hanya boleh mengandung huruf, spasi, titik, koma, dan tanda hubung.");
    return;
  }
  if (!isValidYear(year)) {
    alert(`Tahun terbit harus antara 1455 hingga ${new Date().getFullYear()}.`);
    return;
  }

  const parsedYear = parseInt(year);

  if (editingBookId !== null) {
    const bookIndex = books.findIndex((b) => b.id === editingBookId);
    if (bookIndex !== -1) {
      books[bookIndex].title = title;
      books[bookIndex].author = author;
      books[bookIndex].year = parsedYear;
      books[bookIndex].isComplete = isComplete;
    }
  } else {
    const newBook = {
      id: +new Date(),
      title,
      author,
      year: parsedYear,
      isComplete,
    };
    books.push(newBook);
  }

  saveBooks();
  renderBooks();
  bookForm.reset();
  editingBookId = null;
  closeForm();
});

function renderBooks(query = "") {
  const incompleteBookList = document.getElementById("incompleteBookList");
  const completeBookList = document.getElementById("completeBookList");

  incompleteBookList.innerHTML = "";
  completeBookList.innerHTML = "";

  books
    .filter((book) => book.title.toLowerCase().includes(query.toLowerCase()))
    .forEach((book) => {
      const bookElement = createBookElement(book);
      book.isComplete
        ? completeBookList.appendChild(bookElement)
        : incompleteBookList.appendChild(bookElement);
    });
}

function createBookElement(book) {
  const bookElement = document.createElement("div");
  bookElement.setAttribute("data-bookid", book.id);
  bookElement.setAttribute("data-testid", "bookItem");

  bookElement.innerHTML = `
    <div id="bookImage"></div>
    <h3 data-testid="bookItemTitle">${book.title}</h3>
    <p data-testid="bookItemAuthor">Penulis: ${book.author}</p>
    <p data-testid="bookItemYear">Tahun: ${book.year}</p>
    <div>
      <button data-testid="bookItemIsCompleteButton" onclick="toggleBook(${book.id})">
        ${book.isComplete ? "Belum selesai dibaca" : "Selesai dibaca"}
      </button>
      <button data-testid="bookItemDeleteButton" onclick="deleteBook(${book.id})">Hapus Buku</button>
      <button data-testid="bookItemEditButton" onclick="editBook(${book.id})">Edit Buku</button>
    </div>
  `;
  return bookElement;
}

function toggleBook(bookId) {
  const book = books.find((b) => b.id === bookId);
  if (book) {
    book.isComplete = !book.isComplete;
    saveBooks();
    renderBooks();
  }
}

function deleteBook(bookId) {
  books = books.filter((b) => b.id !== bookId);
  saveBooks();
  renderBooks();
}

document.getElementById("searchBook").addEventListener("submit", function (event) {
  event.preventDefault();
  const query = document.getElementById("searchBookTitle").value.trim();
  renderBooks(query);
});

const addBookButton = document.getElementById("addBookButton");
const bookFormSection = document.getElementById("bookFormSection");
const overlay = document.createElement("div");
overlay.id = "overlay";
document.body.appendChild(overlay);

const closeModalButton = document.getElementById("closeModal");
const bookForm = document.getElementById("bookForm");

let editingBookId = null;

function openForm() {
  bookFormSection.style.display = "block";
  overlay.style.display = "block";
  document.body.style.overflow = "hidden";
}

function closeForm() {
  bookFormSection.style.display = "none";
  overlay.style.display = "none";
  document.body.style.overflow = "auto";

  if (editingBookId === null) {
    bookForm.reset();
  }
}

addBookButton.addEventListener("click", () => {
  editingBookId = null;
  bookForm.reset();
  openForm();
});

closeModalButton.addEventListener("click", closeForm);

overlay.addEventListener("click", closeForm);

function editBook(bookId) {
  const book = books.find((b) => b.id === bookId);
  if (!book) return;

  editingBookId = bookId;
  document.getElementById("bookFormTitle").value = book.title;
  document.getElementById("bookFormAuthor").value = book.author;
  document.getElementById("bookFormYear").value = book.year;
  document.getElementById("bookFormIsComplete").checked = book.isComplete;

  openForm();
}
