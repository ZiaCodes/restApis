const User = require('../models/user');
const EmailVerificationToken = require('../models/emailVerificationToken');
const passwordResetToken = require('../models/passwordResetToken');
const { isValidObjectId } = require('mongoose');
const { generateOTP, generateMailTransporter } = require('../utils/email');
const { sendError, generateRandomByte } = require('../utils/helper');


//create a new user (Method)
exports.create = async (req,res) => {
    const{name, email, password} = req.body;

    // checking if same email exist or not
    const oldUser =await User.findOne({ email });
    if(oldUser) 
        return sendError(res, "This email is already in use");

    // creating new User
    const newUser = new User({name, email, password});
    await newUser.save();


    // generating 6 digit OTP
    let OTP = generateOTP();

    // Storing OTP in db
    const newEmailVerificationToken = new EmailVerificationToken({owner: newUser._id, token:OTP});
    await newEmailVerificationToken.save();


    //Send to user OTP
    var transport = generateMailTransporter();

      transport.sendMail({
        from: "verification@reviewapp.com",
        to: newUser.email,
        subject:"Email Verification",
        html:`
        <p> Your verification OTP: </p>
        <h3>${OTP}</h3>
        <br>
        <p> <b> Note : </b>This OTP is Valid for one hour only. </p>
        <p> Thank You<p>
        `,
      });

      res.json({message:"Please verify your email. OTP has been sent to your Email Account."});
};


exports.verifyEmail = async (req,res) =>{
  const {userId, OTP} = req.body

  if( !isValidObjectId(userId) )
    return sendError(res,"Invalid userId!");

  const user = await User.findById(userId)

  if(!user)
    return sendError(res, "userId not found!",404);


  if(user.isVerified)
    return res.json({message:"user is already verified!"});

  const token = await EmailVerificationToken.findOne({owner: userId});

  if(!token) 
    return sendError(res, "Token not found");

  const isMatched = await token.compaireToken(OTP)

  if(!isMatched) 
    return sendError(res,"Please submit a valid OTP!");

  user.isVerified = true;
  await user.save()

  await EmailVerificationToken.findByIdAndDelete(token._id);

  //Send to user OTP
  var transport = generateMailTransporter();

  transport.sendMail({
    from: "verification@reviewapp.com",
    to: user.email,
    subject: "Welcome to our App",
    html:`
    <p>Welcome to our App and thank you for choosing us.</p>
    <br>
    <p> Thank You<p>
    `,
  });

  res.json({message: " Your Email is verified!"})
}



exports.reSendEmailVerificationToekn = async (req, res) =>{
  const {userId} = req.body

  const user = await User.findById(userId)
  if(!user) 
    return sendError(res, "userId not found!", 404);

  if(user.isVerified) 
    return res.json({message:"user is already verified!"});

  const alreadyHasToken = await EmailVerificationToken.findOne({owner: userId});

  if(alreadyHasToken)
    return res.json({message:"Only after an hour, You can request another OTP!"});

       // generating 6 digit OTP
       let OTP = generateOTP();
   
       // Storing OTP in db
       const newEmailVerificationToken = new EmailVerificationToken({owner: user._id, token:OTP});
       await newEmailVerificationToken.save();
   
   
       //Send to user OTP
       var transport = generateMailTransporter();
   
         transport.sendMail({
           from: "verification@reviewapp.com",
           to: user.email,
           subject:"Email Verification",
           html:`
           <p> Your verification OTP: </p>
           <h3>${OTP}</h3>
           <br>
           <p> <b> Note : </b>This OTP Valid for one hour only. </p>
           <p> Thank You<p>
           `,
         });
   
         res.json({message:"New OTP has been sent to your email account."});

}


exports.forgetPassword = async(req,res) => {
  const {email} = req.body;

  if(!email) return sendError(res, 'Email is Missing !')

  const user = await User.findOne({email})
  if(!user) return sendError(res, 'user not found!',404);

  const alreadyHasToken = await passwordResetToken.findOne({owner: user._id})
  if(alreadyHasToken) return sendError(res, "only after an hour you can generate another token!");

  const token = await generateRandomByte();
  const newPasswordResetToken = await passwordResetToken({owner: user._id,token})
  await newPasswordResetToken.save();

  const resetPasswordUrl = `http://localhost:3000/reset-password?token=${token}&id=${user._id}`;

  //Send to user OTP
  var transport = generateMailTransporter();
   
  transport.sendMail({
    from: "security@reviewapp.com",
    to: user.email,
    subject:"Reset Password Link",
    html:`
    <p>Click here to reset password: </p>
    <a href=${resetPasswordUrl}>Change password</a>
    <br>
    <p>If the above link doesn't work please
      copy paste the below link into your
      browser </p>
      <a href=${resetPasswordUrl}> ${resetPasswordUrl} </a>
      <br>
      <p> <b> Note : </b>This Link is Valid for one hour only. </p>
      <p> Thank You<p>
    `,
  });

  res.json({message: "Passwrd reset Link has been sent to your email account !"});

};