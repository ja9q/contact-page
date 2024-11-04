const express = require('express');
const router = express.Router();
const geo = require('node-geocoder');
const geocoder = geo({ provider: 'openstreetmap' });


router.get('/', async (req, res) => {
    const contacts = await req.db.getAllContacts();
    res.json({ contacts: contacts, user: req.session.user });
});

module.exports = router;