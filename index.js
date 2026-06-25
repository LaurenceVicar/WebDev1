//Gets the book titles and images from the index.json file and displays them on the page
async function fetchBooks() {
    const response = await fetch('index.json');
    const data = await response.json();
    const bookContainer = document.getElementById('book');
    if (!bookContainer) return;
    bookContainer.innerHTML = data.Books.map(book => `
        <div class="col-md-4 mb-4">
            <div class="card h-100">
                <img src="${book.image}" class="card-img-top" alt="${book.title}">
                <div class="card-body">
                    <h5 class="card-title">${book.title}</h5>
                    <p class="card-text">Author: ${book.author}</p>
                </div>
            </div>
        </div>
        `).join("");
}
fetchBooks();

//Gets the book information from the index.json file and displays it on the page
async function fetchBookInfo() {
    const response = await fetch('index.json');
    const data = await response.json();
    const bookInfoContainer = document.getElementById('book-info');
    if (!bookInfoContainer) return;
    bookInfoContainer.innerHTML = (data.Book_info || []).map(book => `
        <div class="row">
            <div class="col-sm-4">${book.title}</div>
            <div class="col-sm-8">${book.description}</div>
        </div>
    `).join("");
}
fetchBookInfo();


// Validates the password and confirm password fields in the signup form
const passwordInput = document.getElementById('password');
if (passwordInput) {
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        const pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
        if (!pattern.test(password)) {
            this.setCustomValidity("Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, and one number.");
        } else {
            this.setCustomValidity("");
        }
    });
}

const confirmPasswordInput = document.getElementById('confirmPassword');
if (confirmPasswordInput && passwordInput) {
    confirmPasswordInput.addEventListener('input', function() {
        const confirmPassword = this.value;
        const password = passwordInput.value;
        if (confirmPassword !== password) {
            this.setCustomValidity("Passwords do not match.");
        } else {
            this.setCustomValidity("");
        }
    });
}