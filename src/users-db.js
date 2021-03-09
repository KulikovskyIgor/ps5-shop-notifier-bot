const admin = require('firebase-admin');
const serviceAccount = require('../db-conf.json');

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