const express = require('express');
const { create, verifyEmail, reSendEmailVerificationToekn, forgetPassword } = require('../controller/user');
const { userVaidator, validate } = require('../middleware/validator');

const router = express.Router()

router.post('/create',userVaidator, validate ,create);
router.post('/verify-email',verifyEmail);
router.post('/resend-email-verificationToken',reSendEmailVerificationToekn);
router.post('/forget-password',forgetPassword);

module.exports = router