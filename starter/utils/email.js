const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');
const { join } = require('node:path');

module.exports = class Email {
  constructor(user,url) {
    this.to = user.email
    this.FirstName = user.name.split(' ')[0];
    this.url = url
    this.from =`"Denys Harkovenko" <${process.env.EMAIL_FROM}>`
  }

  newTransport(){
    if(process.env.NODE_ENV==='production'){
      // SendGrid
      nodemailer.createTransport(
        {
          service: 'SendGrid',
          auth:{
            user:process.env.SENDGRID_USERNAME,
            pass:process.env.SENDGRID_PASSWORD

          }
        }
      )
    }
    return nodemailer.createTransport({
      host:process.env.EMAIL_HOST,
      port:process.env.EMAIL_PORT,
      auth:{
        user:process.env.EMAIL_USERNAME,
        pass:process.env.EMAIL_PASSWORD
      }
    });
  };

  //1 Send the actual email
  async send(template,subject){
    // 1 Render the HTML based on a pug template
    const html = pug.renderFile(
      join(__dirname, '..', '..', 'views', 'emails', `${template}.pug`),
      {
        firstName: this.FirstName,
        url: this.url,
        subject
      }
    );

    // 2 Define Email Options
    const mailOptions ={
      from: this.from,
      to:this.to,
      subject,
      html,
      text:htmlToText.convert(html)
    };

    // 3 Create the transport and send Email

    await this.newTransport().sendMail(mailOptions);

  }
  async sendWelcome(){
    await this.send(`welcome`,"Welcome to the Natours Family!")
  }

  async sendPasswordReset(){
    await this.send('passwordReset',"Your password reset token (valid for only 10 minutes)")
  }
}

