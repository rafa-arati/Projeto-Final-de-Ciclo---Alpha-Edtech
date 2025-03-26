const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

module.exports = function configurePassport() {
    // Serialização do usuário para armazenar na sessão
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    // Deserialização para recuperar o usuário da sessão
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    });

    // Configuração da estratégia Google OAuth
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        passReqToCallback: true,
        scope: ['profile', 'email']
    }, async (req, accessToken, refreshToken, profile, done) => {
        try {
            console.log('Recebidos dados do perfil Google:', {
                id: profile.id,
                displayName: profile.displayName,
                emails: profile.emails && profile.emails.length > 0 ? profile.emails[0].value : 'Email não fornecido',
                photos: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null
            });

            // Verifica se já existe um usuário com este ID do Google
            let user = await User.findByGoogleId(profile.id);

            // Caso o usuário já exista, retorna-o
            if (user) {
                console.log('Usuário Google já cadastrado, ID:', user.id);
                return done(null, user);
            }

            // Verifica se existe um usuário com o mesmo email
            const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;
            if (email) {
                user = await User.findByEmail(email);

                // Se encontrar um usuário com o mesmo email, atualiza com o Google ID
                if (user) {
                    console.log('Usuário com email já cadastrado, atualizando com Google ID');
                    const updatedUser = await User.updateUser(user.id, {
                        google_id: profile.id,
                        photo_url: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null
                    });
                    return done(null, updatedUser);
                }
            }

            // Caso não exista, cria um novo usuário
            console.log('Criando novo usuário com dados do Google');
            const newUser = await User.create({
                name: profile.displayName,
                email: email,
                google_id: profile.id,
                photo_url: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null,
                username: email ? email.split('@')[0] : `user_${Date.now()}`, // Username temporário
                onboarding_completed: false
            });

            return done(null, newUser);
        } catch (error) {
            console.error('Erro na autenticação Google:', error);
            return done(error, null);
        }
    }));

    return passport;
};