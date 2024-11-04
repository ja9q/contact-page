const express = require('express');
const router = express.Router();
const geo = require('node-geocoder');
const geocoder = geo({ provider: 'openstreetmap' });

// check if the user is currently logged in because if not, they can't delete/edit contacts
const logged_in = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.status(401);
        res.render('error', {title: "Error 401", desc: `You are not authorized.`, promptLogin: true});
    }
}

// main page with all the contacts

// render the main page
router.get('/', async (req, res) => {
    const userId = req.session.user ? req.session.user.id : -1;
    const contacts = await req.db.getAllContacts();
    // keep the title so it can be manually implemented for better formatting
    res.render('contacts-all', { title:"", contacts: contacts });
});

// render the single contact page
router.get('/:contactId', async (req, res) => {
    const contact = await req.db.getContactById(req.params.contactId);
    // create a 404 if there is no contact with this id (or the path in general)
    if (contact !== undefined) {
        res.render('contact-view', { title:"Contact Info", contact: contact });
    } else {
        res.status(404);
        res.render('error', {title: "Error 404", desc: "Page not found."});
    }
});

router.get('/:contactId/edit', logged_in, async (req, res) => {
    const contact = await req.db.getContactById(req.params.contactId);
    // create a 404 if there is no contact with this id
    if (contact !== undefined) {
        res.render('contact-form', { title:"Update Contact", contact: contact, isEditing: true });
    } else {
        res.status(404);
        res.render('error', {title: "Error 404", desc: "Page not found."});
    }
});

router.post('/:contactId/edit', logged_in, async (req, res) => {
    const contact = await req.db.getContactById(req.params.contactId);

    const prefix = req.body.prefix.trim();
    const first = req.body.first.trim();
    const last = req.body.last.trim();
    const phone = req.body.phone.trim();
    const email = req.body.email.trim();

    const street = req.body.street.trim();
    const city = req.body.city.trim();
    const state = req.body.state.trim();
    const zip = req.body.zip.trim();
    const country = req.body.country.trim();
    
    const contactByPhone = (req.body.contact_by_phone !== undefined) ? 1 : 0;
    const contactByEmail = (req.body.contact_by_email !== undefined) ? 1 : 0;
    const contactByMail = (req.body.contact_by_mail !== undefined) ? 1 : 0;

    // reevaluate the address's coordinates
    var addr = street + " " + city + " " + state + " " + zip + " " + country;

    // try to geolocate the address on a map
    const result = await geocoder.geocode(addr);
    var lat = 0;
    var lng = 0;

    if (result.length > 0) {
        addr = result[0].formattedAddress;
        
        lat = result[0].latitude;
        lng = result[0].longitude;
    }

    // create a 404 if there is no contact with this id
    if (contact !== undefined) {
        const id = req.db.updateContact(req.params.contactId, prefix, first, last, phone, email, street, city, state, zip, country, lat, lng, contactByPhone, contactByEmail, contactByMail);
        res.redirect("/");
    } else {
        res.status(404);
        res.render('error', {title: "Error 404", desc: "Page not found."});
    }
});

router.get('/:contactId/delete', logged_in, async (req, res) => {
    const contact = await req.db.getContactById(req.params.contactId);
    // create a 404 if there is no contact with this id
    if (contact !== undefined) {
        res.render('contact-delete', { title:"Delete Contact", contact: contact });
    } else {
        res.status(404);
        res.render('error', {title: "Error 404", desc: "Page not found."});
    }
});

router.post('/:contactId/delete', logged_in, async (req, res) => {
    const contact = await req.db.getContactById(req.params.contactId);
    // create a 404 if there is no contact with this id
    if (contact !== undefined) {
        req.db.deleteContact(contact.id);
        res.redirect("/");
    } else {
        res.status(404);
        res.render('error', {title: "Error 404", desc: "Page not found."});
    }
});

module.exports = router;