import EventEmitter from "eventemitter3";
import localforage from "localforage";
import { Aggregator, Query } from "mingo";
import "mingo/init/system";

class Collection extends EventEmitter {

    /**@type {string} */
    #name;

    /**@type {Database} */
    #db;

    /**@type {LocalForage} */
    #lf;

    constructor(db, name) {

        super();
        
        this.#db = db;
        this.#name = name;

        this.#lf = localforage.createInstance({
            driver: [localforage.INDEXEDDB, localforage.LOCALSTORAGE],
            name: this.#db.name(),
            storeName: this.#name
        })
    }

    name() { return this.#name }

    find(query, options = { sort: null, limit: 0, skip: 0 }) {
        return new Promise((resolve, reject) => {
            const data = [];
            this.#lf.iterate((value, _) => {
                data.push(value);
            }).then(() => {
                let cursor = new Query(query).find(data);
                // if sort
                if (options?.sort) cursor = cursor.sort(options.sort);
                // if limit
                if (options?.limit) cursor = cursor.limit(options.limit);
                // if skip
                if (options?.skip) cursor = cursor.skip(options.skip);
                resolve(cursor.all())
            })
            .catch(reject);
        })
    }

    /**
     * 
     * @param {any[]} pipeline 
     * @returns {Promise<any[]>}
     */
    aggregate(pipeline) {
        return new Promise((resolve, reject) => {
            const data = [];
            this.#lf.iterate((value, _) => {
                data.push(value);
            }).then(() => {
                resolve(new Aggregator(pipeline).run(data))
            })
            .catch(reject);
        })
    }

    findOne(query) {
        return new Promise((resolve, reject) => {
            const data = [];
            this.#lf.iterate((value, _) => {
                if (new Query(query).find([value]).count()) {
                    return value;
                }
            }).then((doc) => {
                resolve(doc || null)
            })
            .catch(reject);
        })
    }

    findById(id) {
        return new Promise((resolve, reject) => {
            const data = [];
            this.#lf.getItem(id)
            .then(resolve)
            .catch(reject);
        })
    }

    put(doc) {
        return new Promise((resolve, reject) => {

            if (!doc || typeof doc !== 'object') {
                throw Error(`Data must be an object`);
            }

            // TODO use unique keys
            // if no id, return error;
            if (!doc._id) {
                throw Error(`Data must contain an _id`);
            }

            this.#lf.iterate((value, key) => {
                if (key == doc._id) {
                    return value
                }
            }).then((value) => {
                doc = Object.assign({}, value || {}, doc);
                this.#lf.setItem(doc._id, doc)
                .then((val) => {
                    this.emit('change', val);
                    resolve(val);
                })
                .catch(reject)
            })
            .catch(reject);
        })
    }

    /**
     * 
     * @param {any[]} docs 
     * @returns 
     */
    bulkPut(docs) {
        return new Promise((resolve, reject) => {

            let items = [];

            for (const doc of docs) {
                if (!doc || typeof doc !== 'object') {
                    continue;
                } 

                if (!doc._id) {
                    continue;
                }
                items.push(doc);
            }

            const ids = items.map(e => e._id);

            this.#lf.iterate((value, key) => {
                if (ids.includes(key)) {
                    const index = items.findIndex(e => e._id == key);
                    if (index >= 0) {
                        items[index] = Object.assign({}, value, items[index]);
                    }
                }
            }).then(() => {
                for (const doc of items) {
                    this.#lf.setItem(doc._id, doc)
                    .then((val) => {
                        this.emit('change', val);
                    });
                }
                resolve(items);
            })
            .catch(reject);
        })
    }

    keys() { return this.#lf.keys() }

    remove(id) {
        return new Promise((resolve, reject) => {
            this.#lf.removeItem(id)
            .then(resolve)
            .catch(reject);
        })
    }
}

class Database {
    
    /**@type {string} */
    #name;

    /**@type {object} */
    #collection = {}

    constructor(dbName, stores = {}) {
        this.#name = dbName;
        this.#init(stores);
    }

    #init(stores) {
        if (typeof stores == 'object') {
            for (const [key, value] of Object.entries(stores)) {
                this.#collection[key] = new Collection(this, key, value);
            }
        }
    }

    name() { return this.#name }

    /**
     * Retrieve a {@link Collection} instance.
     * @param {string} name 
     * @returns {Collection}
     */
    collection(name) {
        const coll = this.#collection[name];

        if (!coll) throw new Error(`Collection ${name} does not exist`);

        return coll;
    }
}

export const db = new Database("app.gwx.db", {
    "notifications": [],
})