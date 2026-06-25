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
