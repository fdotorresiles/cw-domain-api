const nodemailer = require('nodemailer');

export default ({ domainxusers }) => {
    console.log(domainxusers)
    /*
    //Obtener información de usuario, dominio que se busco, y palabras y urls encontradas
    let transporter = nodemailer.createTransport({
        host: 'smtp-mail.outlook.com',
        port: 587,
        secure: false, // secure:true for port 465, secure:false for port 587
        auth: {
            user: 'fdotorresiles@outlook.com',
            pass: 'religion=6328'
        }
    });

    // setup email data with unicode symbols
    let mailOptions = {
        from: 'fdotorresiles@outlook.com', // sender address
        to: 'ltorres@impesa.net', // list of receivers
        subject: 'Notificaciones', // Subject line
        text: 'Hello world ?', // plain text body
        html: '<b>Hello world ?</b>' // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
    });
    */
}

