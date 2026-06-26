const USERS_KEY = 'libraUsers';
const CONTACT_MESSAGES_KEY = 'libraContactMessages';
const CUSTOM_BOOKS_KEY = 'libraCustomBooks';
const CURRENT_USER_KEY = 'libraCurrentUser';
let cachedBooks = [];

// Reads and parses an array from localStorage; returns an empty array on missing/invalid data.
function getStoredArray(key) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

// Persists an array value in localStorage under a given key.
function setStoredArray(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

// Displays one Bootstrap alert per form by replacing any previous message.
function showFormMessage(form, type, message) {
    const existing = form.querySelector('.js-form-message');
    if (existing) {
        existing.remove();
    }

    const alert = document.createElement('div');
    alert.className = `alert js-form-message mt-3 alert-${type}`;
    alert.textContent = message;
    form.appendChild(alert);
}

// Removes HTML tags so linked titles from JSON can be searched as plain text.
function stripHtml(value) {
    const temp = document.createElement('div');
    temp.innerHTML = value;
    return temp.textContent || temp.innerText || '';
}

// Renders the current book list into the #book container.
function renderBooks(books) {
    const bookContainer = document.getElementById('book');
    if (!bookContainer) return;

    if (!books.length) {
        bookContainer.innerHTML = '<p class="text-warning">No books found for your search.</p>';
        return;
    }

    bookContainer.innerHTML = books.map(book => `
        <div class="col-md-4 mb-4">
            <div class="card h-100">
                <img src="${book.image}" class="card-img-top" alt="${book.title}">
                <div class="card-body">
                    <h5 class="card-title">${book.title}</h5>
                    <p class="card-text">Author: ${book.author}</p>
                </div>
            </div>
        </div>
    `).join('');
}

// Loads books from index.json, merges with user-added books, and initializes search state.
async function fetchBooks() {
    const bookContainer = document.getElementById('book');
    if (!bookContainer) return;

    try {
        const response = await fetch('index.json');
        const data = await response.json();
        const customBooks = getStoredArray(CUSTOM_BOOKS_KEY);
        cachedBooks = [...(data.Books || []), ...customBooks];
        renderBooks(cachedBooks);
        setupBookSearch();
    } catch {
        bookContainer.innerHTML = '<p class="text-warning">Unable to load books right now.</p>';
    }
}
fetchBooks();

// Handles live and submit-based search filtering on the Books page.
function setupBookSearch() {
    const searchInput = document.getElementById('bookSearchInput');
    if (!searchInput) return;

    const searchForm = document.getElementById('bookSearchForm');
    const clearButton = document.getElementById('clearBookSearch');

    const applySearch = function() {
        const query = searchInput.value.trim().toLowerCase();
        if (!query) {
            renderBooks(cachedBooks);
            return;
        }

        const filtered = cachedBooks.filter(book => {
            const title = stripHtml(book.title || '').toLowerCase();
            const author = (book.author || '').toLowerCase();
            return title.includes(query) || author.includes(query);
        });

        renderBooks(filtered);
    };

    searchForm.addEventListener('submit', function(event) {
        event.preventDefault();
        applySearch();
    });

    searchInput.addEventListener('input', applySearch);

    if (clearButton) {
        clearButton.addEventListener('click', function() {
            searchInput.value = '';
            renderBooks(cachedBooks);
            searchInput.focus();
        });
    }
}

// Renders detailed book information when the book info container exists.
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


// Registers signup logic: validates, prevents duplicate emails, then stores a new user.
function setupSignupForm() {
    const fullNameInput = document.getElementById('fullName');
    if (!fullNameInput) return;

    const signupForm = fullNameInput.closest('form');
    if (!signupForm) return;

    signupForm.addEventListener('submit', function(event) {
        event.preventDefault();

        if (!signupForm.checkValidity()) {
            signupForm.reportValidity();
            return;
        }

        const emailInput = signupForm.querySelector('#email');
        const passwordInput = signupForm.querySelector('#password');
        const confirmPasswordInput = signupForm.querySelector('#confirmPassword');

        const fullName = fullNameInput.value.trim();
        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (password !== confirmPassword) {
            showFormMessage(signupForm, 'danger', 'Passwords do not match.');
            return;
        }

        const users = getStoredArray(USERS_KEY);
        const userExists = users.some(user => user.email === email);
        if (userExists) {
            showFormMessage(signupForm, 'warning', 'An account with this email already exists.');
            return;
        }

        users.push({ fullName, email, password });
        setStoredArray(USERS_KEY, users);
        showFormMessage(signupForm, 'success', 'Signup successful. You can now log in.');
        signupForm.reset();
    });
}

// Registers login logic and stores the currently signed-in user.
function setupLoginForm() {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    if (!emailInput || !passwordInput) return;

    const loginForm = emailInput.closest('form');
    if (!loginForm) return;

    const hasFullNameField = Boolean(document.getElementById('fullName'));
    if (hasFullNameField) return;

    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();

        if (!loginForm.checkValidity()) {
            loginForm.reportValidity();
            return;
        }

        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value;
        const users = getStoredArray(USERS_KEY);
        const matchedUser = users.find(user => user.email === email && user.password === password);

        if (!matchedUser) {
            showFormMessage(loginForm, 'danger', 'Invalid email or password.');
            return;
        }

        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(matchedUser));
        showFormMessage(loginForm, 'success', `Welcome back, ${matchedUser.fullName}.`);
        loginForm.reset();
    });
}

// Stores contact form submissions with a timestamp.
function setupContactForm() {
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const messageInput = document.getElementById('message');
    if (!nameInput || !emailInput || !messageInput) return;

    const contactForm = nameInput.closest('form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', function(event) {
        event.preventDefault();

        if (!contactForm.checkValidity()) {
            contactForm.reportValidity();
            return;
        }

        const messages = getStoredArray(CONTACT_MESSAGES_KEY);
        messages.push({
            name: nameInput.value.trim(),
            email: emailInput.value.trim().toLowerCase(),
            message: messageInput.value.trim(),
            sentAt: new Date().toISOString()
        });
        setStoredArray(CONTACT_MESSAGES_KEY, messages);

        showFormMessage(contactForm, 'success', 'Message sent successfully. Thank you for contacting us.');
        contactForm.reset();
    });
}

// Stores newly added books so they can be displayed with catalog books.
function setupAddBookForm() {
    const titleInput = document.getElementById('bookTitle');
    if (!titleInput) return;

    const addBookForm = titleInput.closest('form');
    if (!addBookForm) return;

    addBookForm.addEventListener('submit', function(event) {
        event.preventDefault();

        if (!addBookForm.checkValidity()) {
            addBookForm.reportValidity();
            return;
        }

        const authorInput = document.getElementById('bookAuthor');
        const imageInput = document.getElementById('bookImage');

        const customBooks = getStoredArray(CUSTOM_BOOKS_KEY);
        customBooks.push({
            title: titleInput.value.trim(),
            author: authorInput.value.trim(),
            image: imageInput.value.trim()
        });
        setStoredArray(CUSTOM_BOOKS_KEY, customBooks);

        showFormMessage(addBookForm, 'success', 'Book added. It will appear on the Books page.');
        addBookForm.reset();
    });
}

// Safe on all pages because each setup exits early when required fields are missing.
setupSignupForm();
setupLoginForm();
setupContactForm();
setupAddBookForm();


// Password rules and matching are only applied on the signup page.
const signupPasswordInput = document.getElementById('password');
if (signupPasswordInput && document.getElementById('fullName')) {
    signupPasswordInput.addEventListener('input', function() {
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
if (confirmPasswordInput && signupPasswordInput) {
    confirmPasswordInput.addEventListener('input', function() {
        const confirmPassword = this.value;
        const password = signupPasswordInput.value;
        if (confirmPassword !== password) {
            this.setCustomValidity("Passwords do not match.");
        } else {
            this.setCustomValidity("");
        }
    });
}