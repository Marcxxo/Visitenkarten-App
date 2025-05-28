const DB_NAME = 'VisitenkartenVideos';
const DB_VERSION = 1;
const STORE_NAME = 'videos';

let db = null;

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };

    request.onerror = (event) => {
      reject('Fehler beim Öffnen der Datenbank: ' + event.target.errorCode);
    };
  });
}

export async function saveVideo(id, videoBlob) {
  const database = await openDatabase();
  const transaction = database.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.put({ id: id, data: videoBlob });

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = (event) => {
      reject('Fehler beim Speichern des Videos: ' + event.target.errorCode);
    };
  });
}

export async function getVideo(id) {
  const database = await openDatabase();
  const transaction = database.transaction([STORE_NAME], 'readonly');
  const store = transaction.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.get(id);

    request.onsuccess = (event) => {
      resolve(event.target.result ? event.target.result.data : null);
    };

    request.onerror = (event) => {
      reject('Fehler beim Abrufen des Videos: ' + event.target.errorCode);
    };
  });
}

export async function deleteVideo(id) {
  const database = await openDatabase();
  const transaction = database.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = (event) => {
      reject('Fehler beim Löschen des Videos: ' + event.target.errorCode);
    };
  });
}

// Hinzugefügt für den Export von Profilen
export async function getAllVideoIds() {
  const database = await openDatabase();
  const transaction = database.transaction([STORE_NAME], 'readonly');
  const store = transaction.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.getAllKeys();

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject('Fehler beim Abrufen aller Video-IDs: ' + event.target.errorCode);
    };
  });
}

// Funktion zum Löschen aller Videos (optional, für Bereinigung)
export async function deleteAllVideos() {
  const database = await openDatabase();
  const transaction = database.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.clear();

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = (event) => {
      reject('Fehler beim Löschen aller Videos: ' + event.target.errorCode);
    };
  });
}

// Beispiel für wie man save/get für Bilder nutzen würde:
// const imageId = `profileImage_${firstName}_${lastName}`;
// await saveVideo(imageId, imageBlob); // Verwende saveVideo für Bilder
// const imageBlob = await getVideo(imageId); // Verwende getVideo für Bilder 