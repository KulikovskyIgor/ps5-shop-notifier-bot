const admin = require('firebase-admin');

const serviceAccount = {
	"type": process.env.CF_TYPE,
	"project_id": process.env.CF_PROJECT_ID,
	"private_key_id": process.env.CF_PRIVATE_KEY_ID,
	"private_key": process.env.CF_PRIVATE_KEY,
	"client_email": process.env.CF_CLIENT_EMAIL,
	"client_id": process.env.CF_CLIENT_ID,
	"auth_uri": process.env.CF_AUTH_URI,
	"token_uri": process.env.CF_TOKEN_URI,
	"auth_provider_x509_cert_url": process.env.CF_AUTH_PROVIDER_URL,
	"client_x509_cert_url": process.env.CF_CLIENT_CERT_URL
};

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

module.exports.getUsers = () => {
    return db
        .collection('users')
        .where('subscription', '==', true)
        .get()
        .then(snapshot => {
            const users = [];
            snapshot.forEach(doc => users.push(doc.data()));
            return users;
        });
};

module.exports.addUser = (chatId, firstName, lastName) => {
    return db
        .collection('users')
        .doc(`${chatId}`)
        .set(
            { chatId, firstName, lastName, subscription: true },
            { merge: true }
        );
};

module.exports.removeUser = (chatId) => {
    return db
        .collection('users')
        .doc(`${chatId}`)
        .update({ subscription: false });
};

module.exports.getStores = () => {
    return db
        .collection('stores')
        .get()
        .then(snapshot => {
            const stores = [];
            snapshot.forEach(doc => stores.push({ id: doc.id, ...doc.data() }));
            return stores;
        });
};

module.exports.addStoreStats = (storeId, stats) => {
    return db
        .collection('stores')
        .doc(`${storeId}`)
        .set(
            { stats },
            { merge: true }
        );
};