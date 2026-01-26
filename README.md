# 📄 README.md — miniStore

```md
# 🛍️ miniStore

**miniStore** is a lightweight, low-cost website builder for WhatsApp sellers that lets them create a product catalog website in minutes — without complex e-commerce systems.

Sellers can upload products manually, upload multiple photos in bulk, or even upload a full PDF catalog to auto-generate dozens of products instantly. Customers browse the store and place orders directly through WhatsApp.

---

## 🚀 Why miniStore?

Most small sellers operate entirely on WhatsApp or Instagram:

- ❌ No website
- ❌ Manual catalog sharing
- ❌ Customers confused while ordering
- ❌ Time wasted uploading products one-by-one
- ❌ Shopify-like platforms are too expensive or complex

miniStore solves this by:

- ✅ Creating instant product websites
- ✅ Turning PDFs into sellable catalogs
- ✅ Allowing bulk price setting
- ✅ Sending structured orders to WhatsApp
- ✅ Keeping hosting costs near zero

---

## ✨ Features

### 🏪 Store Creation
- Create a store using name & WhatsApp number
- Get a public store link: `/store/{storeName}`

---

### 📸 Product Upload Options

#### 1) Manual Upload
- Product name
- Price
- Description
- Image

#### 2) Multiple Image Upload with Bulk Pricing
- Upload many product photos together
- Side-scroll preview editor
- Set same price for:
  - All uploads
  - Last N uploads (example: last 10 = ₹500)
- Edit individual prices anytime

#### 3) PDF Catalog Upload
- Upload one PDF
- Auto-convert each page into a product
- Same price & description applied
- Preview and edit before publishing

---

### 🎨 Customization
- Pick any theme color
- Grid or list layout
- Upload logo
- Choose logo placement (left / center header)

---

### 📲 WhatsApp Ordering
Clicking **Order on WhatsApp** auto-opens WhatsApp with:

```

Hi, I want to order:

Product: Jersey #12
Price: ₹699
Store: Kaab Jerseys

````

---

## 🛠️ Tech Stack

- **Frontend:** React + Vite
- **Backend:** Firebase (Firestore, Storage, Auth)
- **Hosting:** GitHub Pages
- **PDF Handling:** Client-side PDF processing

---

## ⚙️ Local Setup

### 1️⃣ Install dependencies
```bash
npm install
````

### 2️⃣ Add Firebase config

Paste your Firebase config inside:

```
src/firebase/config.js
```

---

### 3️⃣ Run locally

```bash
npm run dev
```

Open:

```
http://localhost:5173
```

---

## 🌍 Deploy to GitHub Pages

### Set base path in `vite.config.js`

```js
base: '/miniStore/',
```

---

### Build & deploy

```bash
npm run build
npm run deploy
```

---

## 🧪 MVP Limitations

* No payment gateway
* No cart system
* WhatsApp-based ordering only
* Simple theming (not drag-drop)

---

## 🛣️ Future Roadmap

* Inventory tracking
* Payments
* Order analytics
* AI catalog understanding
* Multi-store support
* Custom domains

---

## 👨‍💻 Author

Built by Mohammad Kaab as a product-driven full-stack project focused on solving real problems for small WhatsApp sellers.

---

⭐ If you like the idea, feel free to star the repository!

```

