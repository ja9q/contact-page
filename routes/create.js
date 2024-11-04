const express = require('express');
const router = express.Router();
const geo = require('node-geocoder');
const geocoder = geo({ provider: 'openstreetmap' });

// render the create contact page; pass in a blank contact so it doesn't crash
router.get('/', async (req, res) => {
    res.render('contact-form', { title: "Create Contact", contact: { id: -1,
     namePrefix: '',
     firstName: '',
     lastName: '',
     phoneNumber: '',
     emailAddress: '',
     street: '',
     city: '',
     state: '',
     zip: '',
     country: '',
     contactByEmail: 0,
     contactByPhone: 0,
     contactByMail: 0 }});
});

// create the contact when there is post request on the page
router.post('/', async (req, res) => {
    // get the form data and trim it
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
    
    var addr = street + " " + city + " " + state + " " + zip + " " + country;

    // try to geolocate the address on a map
    const result = await geocoder.geocode(addr);
    var lat = 0;
    var lng = 0;

    if (result.length > 0) {
        addr = result[0].formattedAddress;
        
        lat = result[0].latitude;
        lng = result[0].longitude;
    } else {
        
    }
    
    const contactByPhone = (req.body.contact_by_phone !== undefined) ? 1 : 0;
    const contactByEmail = (req.body.contact_by_email !== undefined) ? 1 : 0;
    const contactByMail = (req.body.contact_by_mail !== undefined) ? 1 : 0;

    // create the contact
    const id = await req.db.createContact(prefix, first, last, phone, email, street, city, state, zip, country, lat, lng, contactByPhone, contactByEmail, contactByMail);

    // redirect back to the main page
    res.redirect('/');
});

module.exports = router;