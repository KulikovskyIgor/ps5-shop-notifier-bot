const admin = require('firebase-admin');

const account = {
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
console.log('account', account);
console.log('-------------');
console.log('account', JSON.stringify(account));

admin.initializeApp({
    credential: admin.credential.cert(account)
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