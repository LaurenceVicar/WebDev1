//Gets the book titles and images from the index.json file and displays them on the page
async function fetchBooks() {
    const response = await fetch('index.json');
    const data = await response.json();
    const bookContainer = document.getElementById('book');
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


// Validates the password and confirm password fields in the signup form
document.getElementById('password').addEventListener('input', function() {
    const password = this.value;
    const pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    if (!pattern.test(password)) {
        this.setCustomValidity("Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, and one number.");
    } else {
        this.setCustomValidity("");
    }
});
document.getElementById('confirmPassword').addEventListener('input', function() {
    const confirmPassword = this.value;
    const password = document.getElementById('password').value;
    if (confirmPassword !== password) {
        this.setCustomValidity("Passwords do not match.");
    } else {
        this.setCustomValidity("");
    }
});