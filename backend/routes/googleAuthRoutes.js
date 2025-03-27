const express = require('express');
const passport = require('passport');
const { googleAuthCallback, completeOnboarding } = require('../controllers/googleAuthController');

const router = express.Router();

// Rota para iniciar o processo de autenticação Google
router.get(
    '/google',
    passport.authenticate('google', {
        scope: ['profile', 'email']
    })
);

// Rota de callback para a autenticação Google
router.get(
    '/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/#login?error=google_login_failed',
        session: false
    }),
    googleAuthCallback
);

// Rota para completar o onboarding (adicionar informações extras)
router.post('/complete-onboarding', completeOnboarding);

module.exports = router;