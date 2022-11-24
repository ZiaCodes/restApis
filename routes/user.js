const express = require('express');
const { create, verifyEmail, reSendEmailVerificationToekn, forgetPassword, sendResetPasswordTokenStatus, resetPassword } = require('../controller/user');
const { isValidPasswordResetToken } = require('../middleware/user');
const { userVaidator, validate, validatePassword } = require('../middleware/validator');

const router = express.Router()

router.post('/create',userVaidator, validate ,create);
router.post('/verify-email',verifyEmail);
router.post('/resend-email-verificationToken',reSendEmailVerificationToekn);
router.post('/forget-password',forgetPassword);
router.post('/verify-pass-reset-token',isValidPasswordResetToken, sendResetPasswordTokenStatus);
router.post('/reset-password',validatePassword,validate,isValidPasswordResetToken, resetPassword);

module.exports = router