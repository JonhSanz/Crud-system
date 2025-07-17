// Importar funciones de Firebase
import { 
  db, 
  storage, 
  uploadImage, 
  addProduct, 
  getProducts, 
  updateProduct, 
  deleteProduct 
} from './firebase-config.js';

// Function to show notifications
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.remove('hidden');
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}

// Function to handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const submitBtn = form.querySelector('input[type="submit"]');
    const originalText = submitBtn.value;
    submitBtn.value = 'Creating...';
    submitBtn.disabled = true;

    try {
        // Get form values
        const name = form['product-name'].value.trim();
        const price = parseFloat(form['regular-price'].value);
        const description = form['description'].value.trim();
        const status = form['status'].value;
        const imageFile = form['image'].files[0];

        // Validate data
        if (!name || name.length < 2) {
            throw new Error('Product name must be at least 2 characters long');
        }

        if (isNaN(price) || price <= 0) {
            throw new Error('Please enter a valid price greater than 0');
        }

        if (!description || description.length < 5) {
            throw new Error('Description must be at least 5 characters long');
        }

        if (!['active', 'inactive'].includes(status)) {
            throw new Error('Invalid status value');
        }

        // Upload image if provided
        let imageUrl = '';
        if (imageFile) {
            imageUrl = await uploadImage(imageFile);
        }

        // Create product in Firestore
        await addProduct({
            name,
            price,
            description,
            status,
            imageUrl
        });

        // Show success message
        showNotification('Product created successfully!');
        form.reset();
    } catch (error) {
        console.error('Error creating product:', error);
        showNotification(`Error: ${error.message}`, 'error');
    } finally {
        submitBtn.value = originalText;
        submitBtn.disabled = false;
    }
}

// Add event listener to form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('productForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
});

// Function to show notifications
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.remove('hidden');
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}

// Function to display products
async function displayProducts() {
    try {
        const container = document.getElementById('products-container');
        container.innerHTML = '<div class="loading-spinner">Loading products...</div>';

        // Verificar que estamos en la página correcta
        if (!container) {
            console.log('Not on products page');
            return;
        }

        // Obtener productos de Firestore
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            container.innerHTML = `
                <div class="no-products">
                    <p>No products found.</p>
                    <p><a href="create-products.html" class="create-link">Create your first product</a></p>
                </div>
            `;
            return;
        }

        // Crear HTML para cada producto
        const productsHtml = querySnapshot.docs.map(doc => {
            const product = doc.data();
            return `
                <div class="product-card">
                    <div class="product-header">
                        <h3>${product.name}</h3>
                        <span class="product-status ${product.status}">${product.status.charAt(0).toUpperCase() + product.status.slice(1)}</span>
                    </div>
                    <div class="product-details">
                        <p><strong>Price:</strong> $${product.price.toFixed(2)}</p>
                        <p>${product.description}</p>
                        ${product.imageUrl ? `<img src="${product.imageUrl}" alt="${product.name}" class="product-image">` : ''}
                    </div>
                    <div class="product-actions">
                        <button onclick="editProduct('${doc.id}')" class="edit-btn">Edit</button>
                        <button onclick="deleteProduct('${doc.id}')" class="delete-btn">Delete</button>
                    </div>
                </div>
            `;
        }).join('');

        // Actualizar el contenedor
        container.innerHTML = `
            <div class="products-grid">
                ${productsHtml}
            </div>
        `;
    } catch (error) {
        console.error('Error fetching products:', error);
        const container = document.getElementById('products-container');
        container.innerHTML = `
            <div class="error-message">
                <h3>Error loading products</h3>
                <p>${error.message}</p>
                <button onclick="displayProducts()" class="retry-btn">Retry</button>
            </div>
        `;
    }
}

// Function to edit product
function editProduct(productId) {
    // Implement edit functionality
    alert('Edit functionality will be implemented soon!');
}

// Function to delete product
async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
        const db = getFirestore();
        await deleteDoc(doc(db, 'products', productId));
        showNotification('Product deleted successfully!');
        displayProducts(); // Refresh the list
    } catch (error) {
        console.error('Error deleting product:', error);
        showNotification('Error deleting product: ' + error.message, 'error');
    }
}

// Main DOMContentLoaded event handler
document.addEventListener('DOMContentLoaded', () => {
    // If we're on the products page, display products
    if (document.getElementById('products-container')) {
        displayProducts();
    }

    // If we're on the create form page, set up form handling
    const form = document.querySelector('form');
    if (form) {
        const productDisplay = document.createElement('section');
        productDisplay.className = 'products-list';
        form.insertAdjacentElement('afterend', productDisplay);

        // Form validation
        form.addEventListener('submit', (e) => {
            const name = form['product-name'].value.trim();
            const price = form['regular-price'].value;
            const description = form['description'].value.trim();
            const status = form['status'].value;
            const imageFile = form['image'].files[0];

            if (!name || name.length < 2) {
                showNotification('Product name must be at least 2 characters long.', 'error');
                e.preventDefault();
                return false;
            }

            if (isNaN(price) || price <= 0) {
                showNotification('Please enter a valid price greater than 0.', 'error');
                e.preventDefault();
                return false;
            }

            if (!description || description.length < 5) {
                showNotification('Description must be at least 5 characters long.', 'error');
                e.preventDefault();
                return false;
            }

            if (!['active', 'inactive'].includes(status)) {
                showNotification('Invalid status value.', 'error');
                e.preventDefault();
                return false;
            }
        });

        // Form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector('input[type="submit"]');
            const originalText = submitBtn.value;
            submitBtn.value = 'Creating...';
            submitBtn.disabled = true;

            // Get form values
            const name = form['product-name'].value.trim();
            const price = form['regular-price'].value;
            const description = form['description'].value.trim();
            const status = form['status'].value;
            const imageFile = form['image'].files[0];

            try {
                // Upload image and get URL
                let imageUrl = '';
                if (imageFile) {
                    imageUrl = await uploadProductImage(imageFile);
                    console.log('Image URL:', imageUrl);
                }

                // Save product data
                const productData = { name, price, description, status, imageUrl };
                console.log('Trying to add product:', productData);
                await addProduct(productData);

                // Show the just-added product
                productDisplay.innerHTML = `
                <div class="product-card">
                    <h3>${name}</h3>
                    <p><strong>Price:</strong> $${parseFloat(price).toFixed(2)}</p>
                    <p><strong>Status:</strong> ${status.charAt(0).toUpperCase() + status.slice(1)}</p>
                    <p>${description}</p>
                    ${imageUrl ? `<img src="${imageUrl}" alt="${name}" style="max-width:150px;">` : ''}
                </div>`;

                form.reset();
                submitBtn.value = originalText;
                submitBtn.disabled = false;
                showNotification('Product created successfully!');
                // Refresh the products list if we're on the products page
                if (document.getElementById('products-container')) {
                    displayProducts();
                }
            } catch (err) {
                console.error('Detailed error:', err);
                submitBtn.value = originalText;
                submitBtn.disabled = false;
                showNotification(`Error adding product: ${err.message}`, 'error');
                // Refresh the products list if we're on the products page
                if (document.getElementById('products-container')) {
                    displayProducts();
                }
            } finally {
                form.querySelector('input[type="submit"]').disabled = false;
            }
        });
    }
});
