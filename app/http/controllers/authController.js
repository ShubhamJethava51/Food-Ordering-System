const User = require("../../models/user");
const bcrypt = require("bcrypt");
const passport = require("passport");
const JWT = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const token = require("../../models/token");
const user = require("../../models/user");

const mailSender = async (mailAddress, userID, token) => {
  const testMail = await nodemailer.createTestAccount();
  const link = `http://localhost:3000/resetPassword/${userID}/${token}`;
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "giveuponyourdreamserwin@gmail.com",
      pass: "qniaxjwgqcqfjqil",
    },
  });

  let info = await transporter.sendMail({
    from: "Kabir Food Corner <giveuponyourdreamserwin@gmail.com>", // sender address
    to: `Re: <${mailAddress}>`, // list of receivers
    subject: "Reset Password", // Subject line
    text: "Kabir Food Corner password reset link", // plain text body
    html: `<h2>Kabir Food Corner</h2><p>Link for resetting your Kabir Food Corner password,</p><p>Click on link to reset your password:</p><a href=${link}>Reset Password</a><hr>`, // html body
  });
};

function authController() {
  const _getRedirectUrl = (req) => {
    return req.user.role === "admin" ? "/admin" : "/customer/orders";
  };

  return {
    login(req, res) {
      res.render("auth/login");
    },

    postLogin(req, res, next) {
      passport.authenticate("local", (err, user, info) => {
        //if field is empty
        const { email, password } = req.body;

        //You forgot a field!! (Field Validation)

        if (!email || !password) {
          req.flash("error", "All fields are required"); //as per register it will return 'message' object
          return res.redirect("/login");
        }

        //it is 'done' function which we used there, it'll take all the arguments of 'done' function
        //basically we're defining it here
        if (err) {
          req.flash("error", info.message);
          return next(err);
        }
        if (!user) {
          req.flash("error", info.message);
          return res.redirect("/login");
        }

        req.logIn(user, (err) => {
          if (err) {
            req.flash("error", info.message);
            return next(err);
          }

          return res.redirect(_getRedirectUrl(req));
        });
      })(req, res, next);
    },

    register(req, res) {
      res.render("auth/register");
    },

    async postRegister(req, res) {
      const { name, email, password, confirmPassword } = req.body;

      //You forgot (a) field!! (Field Validation)

      if (!name || !email || !password || !confirmPassword) {
        req.flash("error", "All fields are required"); //give 'message' named object which we can use in page
        req.flash("name", name); //this both fields will be same even after redirection
        req.flash("email", email);
        return res.redirect("/register");
      }

      //Email already exists!! (email validation)
      User.exists({ email: email }, (err, result) => {
        if (result) {
          req.flash("error", "Email already exist");
          return res.redirect("/register");
        }
      });

      //checking if password match
      if (password === confirmPassword) {
        //password security, CHECKED! (hashing password)
        const hashedPassword = await bcrypt.hash(password, 10);

        //Create user
        const user = new User({
          name,
          email,
          password: hashedPassword,
        });

        user
          .save()
          .then((user) => {
            //Login
            return res.redirect("/login");
          })
          .catch((err) => {
            if (err) {
              req.flash("error", "Something went wrong");
              return res.redirect("/register");
            }
          });
      } else {
        req.flash("error", "Password does not match!");
        req.flash("name", name);
        req.flash("email", email);
        return res.redirect("/register");
      }
    },

    logout(req, res) {
      req.logout(); //this will remove 'user' object from 'req'
      return res.redirect("/login");
    },

    forgotPassForm(req, res) {
      //forgot password form with one input field
      res.render("auth/forgotPassword");
    },

    async resetLinkSend(req, res) {
      //checking if given email is registered or not
      const user = await User.findOne({ email: req.body.email });
      //if email is entered
      if (req.body.email) {
        //if user is in database
        if (user) {
          // make a object for token
          var encodeWithToken = {
            userID: user._id,
            email: req.body.email,
          };

          // create a token secret from user password and created date
          const tokenSecret = user.password + "-" + user.createdAt.getTime();

          //encode with the token secret generated from old hash password of user and created date
          const tokenForUser = JWT.sign(encodeWithToken, tokenSecret);

          //template for token
          const tokenTemp = {
            userID: user._id,
            token: tokenForUser,
          };

          // finding if token exist for given user
          const existingToken = await token.exists({ userID: user._id });

          if (existingToken) {
            //if token already Exists then delete the previous token add new one and send new email
            await token.deleteOne({ userID: user._id }).exec((err, result) => {
              if (err) {
                req.flash("error", "Something went wrong!");
                return res.redirect("/forgotPassForm");
              }
              if (result.deletedCount > 0) {
                token.create(tokenTemp, (err, token) => {
                  if (token) {
                    //if token is created then send mail

                    mailSender(req.body.email, user._id, token.token)
                      .then(() => {
                        req.flash("success", "Email sent check your inbox!");
                        return res.redirect("/login");
                      })
                      .catch((err) => {
                        if (err) {
                          req.flash(
                            "error",
                            "Something went wrong while sending email!"
                          );
                          return res.redirect("/forgotPassForm");
                        }
                      });
                  }
                  if (err) {
                    req.flash(
                      "error",
                      "Something went wrong while creating token!"
                    );
                    return res.redirect("/forgotPassForm");
                  }
                });
              }
            });
          } else {
            //if token is not there then making new one for user

            token.create(tokenTemp, (err, token) => {
              if (token) {
                //if token is created then send mail

                mailSender(req.body.email, user._id, token.token)
                  .then(() => {
                    req.flash("success", "Email sent check your inbox!");
                    return res.redirect("/login");
                  })
                  .catch((err) => {
                    if (err) {
                      req.flash(
                        "error",
                        "Something went wrong while sending email!"
                      );
                      return res.redirect("/forgotPassForm");
                    }
                  });
              }
              if (err) {
                req.flash(
                  "error",
                  "Something went wrong while creating token!"
                );
                return res.redirect("/forgotPassForm");
              }
            });
          }
        } else {
          req.flash("error", "Email you have entered is not registered!");
          return res.redirect("/register");
        }
      } else {
        req.flash("error", "Provide Email Address!");
        return res.redirect("/forgotPassForm");
      }
    },

    async resetPassForm(req, res) {
      const tokenUser = await token.findOne({ userID: req.params.id });
      if (tokenUser) {
        //if token given is valid
        if (tokenUser.token === req.params.token) {
          //if token given in the url is matching the token found in database for that perticular user
          return res.render("auth/resetPasswordForm", { tokenUser });
        } else {
          // if token is not matching then link has been used and password is changed once
          req.flash("error", "Token Expired!");
          return res.redirect("/login");
        }
      } else {
        // link is used after 1 hour
        req.flash("error", "Link already used!");
        return res.redirect("/login");
      }
    },

    async postResetPassword(req, res) {
      const { tokenUser, tokenId, password, repassword } = req.body;
      //token userId will be given hidden in that form with tokenId

      //finding user from database with given token userId
      const givenUser = await user.findOne({ _id: tokenUser });

      if (!password || !repassword) {
        //check no field is left blank
        req.flash("error", "All fields are required");
        return res.redirect(`/resetPassword/${tokenUser}/${tokenId}`);
      }

      //if password and re-entered password are same
      if (password === repassword) {
        //hashing password
        const hashedPassword = await bcrypt.hash(password, 10);
        const isSame = await bcrypt.compare(password, givenUser.password);

        // checking if current given password is not same as previous one
        if (isSame === false) {
          //creating token secret on base on user hashed password and time
          const tokenSecret =
            givenUser.password + "-" + givenUser.createdAt.getTime();

          //verifying if given token is not already used it will not verify token if secret is changed(password is changed)
          JWT.verify(tokenId, tokenSecret, (err, decoded) => {
            if (decoded) {
              //if it is verified then change the user password
              user.updateOne(
                { _id: decoded.userID },
                { password: hashedPassword },
                (err, updated) => {
                  //error in updating
                  if (err) {
                    req.flash(
                      "error",
                      "Something went wrong while updating password!"
                    );
                    return res.redirect("/login");
                  }
                  if (updated) {
                    //if password got changed
                    req.flash("success", "Updated password successfully!");
                    return res.redirect("/login");
                  }
                }
              );
            }
            if (err) {
              // jwt can't verify it with given token secret means password has been changed with this link
              req.flash("error", "Link is already used!");
              return res.redirect("/login");
            }
          });
        } else {
          // if previous password is same as this one
          req.flash("error", "Password can't be same!");
          return res.redirect(`/resetPassword/${tokenUser}/${tokenId}`);
        }
      } else {
        //if both password fields does not match
        req.flash("error", "Password does not match");
        return res.redirect(`/resetPassword/${tokenUser}/${tokenId}`);
      }
    },
  };
}

module.exports = authController;
