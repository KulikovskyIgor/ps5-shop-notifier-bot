module.exports.queue = (arr, asyncFunc) => {
    return arr.reduce((acc, curr) => {
        return acc.then(res => {
            return asyncFunc(curr).then(resp => {
                return [...res, resp];
            });
        });
    }, Promise.resolve([]));
};

module.exports.shallowEqual = (objA, objB, ...keys) => {
    return keys.every(key => {
        return Object.prototype.hasOwnProperty.call(objA, key) &&
            Object.prototype.hasOwnProperty.call(objB, key) &&
            objA[key] === objB[key];
    });
};

module.exports.ucfirst = (str) => {
    const firstLetter = str.substr(0, 1);
    return firstLetter.toUpperCase() + str.substr(1);
};