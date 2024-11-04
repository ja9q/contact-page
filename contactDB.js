require('dotenv').config();
const Database = require('dbcmps369');
const bcrypt = require('bcryptjs');

// wrapper class for the project's database
class ContactData {
    constructor() {
            this.db = new Database();
    }

    async initialize() {
        await this.db.connect();

        // create the contact table + include a contact-by-mail option
        await this.db.schema('Contacts', [
            { name: 'id', type: 'INTEGER'},
            { name: 'namePrefix', type: 'TEXT'},
            { name: 'firstName', type: 'TEXT'},
            { name: 'lastName', type: 'TEXT'},
            { name: 'phoneNumber', type: 'TEXT'},
            { name: 'emailAddress', type: 'TEXT'},
            { name: 'street', type: 'TEXT'},
            { name: 'city', type: 'TEXT'},
            { name: 'state', type: 'TEXT'},
            { name: 'zip', type: 'TEXT'},
            { name: 'country', type: 'TEXT'},
            { name: 'lat', type: 'NUMERIC'},
            { name: 'lng', type: 'NUMERIC'},
            { name: 'contactByEmail', type: 'INTEGER'},
            { name: 'contactByPhone', type: 'INTEGER'},
            { name: 'contactByMail', type: 'INTEGER'}
        ], 'id');

        // create the users table
        await this.db.schema('Users', [
            { name: 'id', type: 'INTEGER'},
            { name: 'firstName', type: 'TEXT'},
            { name: 'lastName', type: 'TEXT'},
            { name: 'username', type: 'TEXT'},
            { name: 'pwHash', type: 'TEXT'}
        ], 'id');

        // check if the user cmps369 exists and create them if they don't
        const cmpsCheck = await this.findUserByUsername("cmps369");
        if (cmpsCheck === undefined) {
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync("rcnj", salt);
        
            const id = await this.createUser("CMPS369", "Student", "cmps369", hash);
        }
    }

    // functions related to the contacts table
    async getAllContacts() {
        const contacts = await this.db.read('Contacts', []);
        return contacts;
    }

    async getContactById(contactId) {
        const contact = await this.db.read('Contacts', [{column: 'id', value: contactId}]);
        return (contact.length > 0) ? contact[0] : undefined;
    }
    
    async createContact(prefix, first, last, phone, email, street, city, state, zip, country, lat, lng, contactByPhone, contactByEmail, contactByMail) {
        const id = await this.db.create('Contacts', [
            { column: 'namePrefix', value: prefix},
            { column: 'firstName', value: first},
            { column: 'lastName', value: last},
            { column: 'phoneNumber', value: phone},
            { column: 'emailAddress', value: email},
            { column: 'street', value: street},
            { column: 'city', value: city},
            { column: 'state', value: state},
            { column: 'zip', value: zip},
            { column: 'country', value: country},
            { column: 'lat', value: lat},
            { column: 'lng', value: lng},
            { column: 'contactByEmail', value: contactByEmail},
            { column: 'contactByPhone', value: contactByPhone},
            { column: 'contactByMail', value: contactByMail}
        ]);

        return id;
    }
    
    async updateContact(id, prefix, first, last, phone, email, street, city, state, zip, country, lat, lng, contactByPhone, contactByEmail, contactByMail) {
        await this.db.update('Contacts', [
            { column: 'namePrefix', value: prefix},
            { column: 'firstName', value: first},
            { column: 'lastName', value: last},
            { column: 'phoneNumber', value: phone},
            { column: 'emailAddress', value: email},
            { column: 'street', value: street},
            { column: 'city', value: city},
            { column: 'state', value: state},
            { column: 'zip', value: zip},
            { column: 'country', value: country},
            { column: 'lat', value: lat},
            { column: 'lng', value: lng},
            { column: 'contactByEmail', value: contactByEmail},
            { column: 'contactByPhone', value: contactByPhone},
            { column: 'contactByMail', value: contactByMail}
        ], [
            { column: 'id', value: id}
        ]);

        return id;
    }

    async deleteContact(contactId) {
        await this.db.delete('Contacts',  [
            { column: 'id', value: contactId}
        ]);
    }

    // functions related to the users table
    async findUserByUsername(username) {
        const user = await this.db.read('Users', [{column: 'username', value: username}]);
        return (user.length > 0) ? user[0] : undefined;
    }

    async findUserById(id) {
        const user = await this.db.read('Users', [{column: 'id', value: id}]);
        return (user.length > 0) ? user[0] : undefined;
    }

    // add user
    async createUser(first, last, username, hash) {
        const id = await this.db.create('Users', [
            { column: 'firstName', value: first },
            { column: 'lastName', value: last },
            { column: 'username', value: username },
            { column: 'pwHash', value: hash }
        ]);

        return id;
    }
}

module.exports = ContactData;