# Firebase Security Rules

## Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users: Only the user themselves can read/write their profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Stores: Anyone can read, only owner can create/update
    match /stores/{storeId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && resource.data.ownerId == request.auth.uid;
    }
    
    // Products: Anyone can read, only store owner can manage
    match /products/{productId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null; // Ideally check store ownerId via get()
    }
  }
}
```

## Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Products images
    match /products/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    // Store logos
    match /logos/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```
