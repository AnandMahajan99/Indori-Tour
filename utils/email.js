const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstname = user.name.split(' ')[0];
    this.url = url;
    this.from = `Anand Mahajan <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    // console.log(process.env.NODE_ENV);
    // if (process.env.NODE_ENV === 'production') {
    // sendgrid
    console.log('SEND');
    return nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: process.env.SENDGRID_USERNAME,
        pass: process.env.SENDGRID_PASSWORD
      }
    });
    // }

    // 1) create a transporter
    // return nodemailer.createTransport({
    //   host: process.env.EMAIL_HOST,
    //   port: process.env.EMAIL_PORT,
    //   auth: {
    //     user: process.env.EMAIL_USER,
    //     pass: process.env.EMAIL_PASSWORD
    //   }
    // });
  }

  async send(template, subject) {
    // 1) Render HTML based on a pug template
    const fn = pug.compileFile(`${__dirname}/../views/email/${template}.pug`);
    const html = fn({
      firstname: this.firstname,
      url: this.url,
      subject
    });

    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html)
    };

    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Indori Travels Family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token(valid only for 10 minutes)'
    );
  }
};
