const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

// logout
router.get('/logout', async (req, res) => {
    req.session.user = undefined;
    res.redirect('/');
})

// render the main page
router.get('/login', async (req, res) => {
    res.render('login', { title:"Sign in", hide_login: true });
});

router.post('/login', async (req, res) => {
    const username = req.body.username.trim();
    const pw = req.body.password.trim();
    const user = await req.db.findUserByUsername(username);
    if (user && bcrypt.compareSync(pw, user.pwHash)) {
        req.session.user = user;

        res.redirect('/');
        return;
    } else {
        res.render('login', { title:"Sign in", hide_login: true, message: 'Log in failed' });
        return;
    }
});


router.get('/signup', async (req, res) => {
    res.render('signup', { title:"Sign up", hide_login: true });
});

router.post('/signup', async (req, res) => {
    const first = req.body.first.trim();
    const last = req.body.last.trim();
    const username = req.body.username.trim();
    const p1 = req.body.password.trim();
    const p2 = req.body.password2.trim();
    if (p1 != p2) {
        res.render('signup', { title:"Sign up", hide_login: true, message: 'Passwords do not match!' });
        return;
    }

    const user = await req.db.findUserByUsername(username);
    if (user) {
        res.render('signup', { title:"Sign up", hide_login: true, message: 'This account already exists!' });
        return;
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(p1, salt);

    const id = await req.db.createUser(first, last, username, hash);
    req.session.user = await req.db.findUserById(id);
    res.redirect('/');
});

module.exports = router;