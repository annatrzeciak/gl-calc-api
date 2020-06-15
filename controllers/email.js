const debug = require("debug")("controller:email");

const nodemailer = require("nodemailer");
const config = require("../config");

let transport = nodemailer.createTransport({
  host: "mail.cba.pl",
  port: 587,
  auth: {
    user: config.MAIL_SERVER_USER,
    pass: config.MAIL_SERVER_PASSWORD
  }
});

const message = {
  from: "a.trzeciak@code-way.com"
};
exports.sendConfirmationEmail = (name, email, tokens) => {
  const generatedConfirmEmail = generateConfirmEmail(name, email, tokens);
  transport.sendMail({ from: message.from, ...generatedConfirmEmail }, function(
    err,
    info
  ) {
    if (err) {
      debug("Error during sending email", err);
    } else {
      debug(
        `Sent email to: ${name}<${generatedConfirmEmail.to}>, Subject: ${generatedConfirmEmail.subject} `
      );
    }
  });
};
const generateConfirmEmail = (name, email, tokens) => {
  const confirmLink = `${config.API_URL}/users/confirm/${email}/${tokens.refreshToken}`;
  return {
    to: email,
    subject: `Witaj w ${config.APP_NAME}. Potwierdź email`,
    html: `
    <h3>Witaj ${name}!</h3>
    <p>Cieszymy się, że zarejestrowałeś/aś się w serwisie ${config.APP_NAME}:)</p>
    <p>Aby korzystać z pełnych możliwości serwisu, potwierdź swój adres email.</p>
    <p>Wystarczy, że klikniesz w ten link:<br><a href="${confirmLink}">${confirmLink}</a></p>
    <p>Podany link wygasa po 24 godzinach.</p>
    <p>Zespół ${config.APP_NAME}</p>
    `
    // TODO: Styles !!!
  };
};
