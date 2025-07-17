
// Importaciones de Firebase (versión modular)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-analytics.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  serverTimestamp,
  query,
  getDocs,
  doc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL,
  deleteObject
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-storage.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAFkAg_gtpnvwwrxNVTY7hrimNoztOLFQ0",
  authDomain: "eng-forestal.firebaseapp.com",
  projectId: "eng-forestal",
  storageBucket: "eng-forestal.appspot.com",
  messagingSenderId: "263295204528",
  appId: "1:263295204528:web:5612c6cdb118c080e3cf75",
  measurementId: "G-YQ2JLYRPDE"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Función para subir una imagen
async function uploadImage(file) {
  if (!file) return '';
  
  // Validar que sea una imagen
  if (!file.type.startsWith('image/')) {
    throw new Error('El archivo debe ser una imagen');
  }
  
  // Validar tamaño máximo (5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('La imagen no debe superar los 5MB');
  }
  
  try {
    const fileRef = ref(storage, `products/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(fileRef);
    return downloadURL;
  } catch (error) {
    console.error('Error al subir la imagen:', error);
    throw new Error('Error al subir la imagen');
  }
}

// Función para obtener todos los productos
export async function getProducts() {
  try {
    const q = query(collection(db, 'products'));
    const querySnapshot = await getDocs(q);
    const products = [];
    querySnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });
    return products;
  } catch (error) {
    console.error('Error al obtener productos:', error);
    throw error;
  }
}

// Función para agregar un producto
export async function addProduct(productData) {
  try {
    const docRef = await addDoc(collection(db, 'products'), {
      ...productData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error al agregar el producto:', error);
    throw error;
  }
}

// Función para actualizar un producto
export async function updateProduct(productId, productData) {
  try {
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, {
      ...productData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error al actualizar el producto:', error);
    throw error;
  }
}

// Función para eliminar un producto
export async function deleteProduct(productId, imageUrl = '') {
  try {
    // Eliminar la imagen del storage si existe
    if (imageUrl) {
      try {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
      } catch (storageError) {
        console.warn('No se pudo eliminar la imagen:', storageError);
      }
    }
    
    // Eliminar el documento de Firestore
    await deleteDoc(doc(db, 'products', productId));
  } catch (error) {
    console.error('Error al eliminar el producto:', error);
    throw error;
  }
}

export { db, storage, uploadImage };