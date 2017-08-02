import resource from 'resource-router-middleware';
import { Router } from 'express';

var GoogleSearch = require('google-search');
var modulevar = require('../variables');
const nodemailer = require('nodemailer');

export default ({ config, db }) => {

	let api = Router();
	var googleSearch = new GoogleSearch({
        key: 'AIzaSyAN5Ll2fnLcbqfu9d1mIyMWyA-NvV1-UuM',
        cx: '016362743853806142283:kp9ftpxjdrm'
    });

	api.get('/counter', (req, res) => {
		res.json( { 'status': modulevar.getCounter() } );
	});

	api.get('/workingusers', (req, res) => {
		res.json(modulevar.getWorkinUsers());
	});

	api.get('/sendmail', (req, res) => {

		let transporter = nodemailer.createTransport({
			host: 'smtp-mail.outlook.com',
			port: 587,
			secure: false, // secure:true for port 465, secure:false for port 587
			auth: {
				user: 'username',
				pass: 'pass'
			}
		});

		// setup email data with unicode symbols
		let mailOptions = {
			from: '"Fred Foo 👻" <fdotorresiles@outlook.com>', // sender address
			to: 'ltorres@impesa.net', // list of receivers
			subject: 'Hello ✔', // Subject line
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


		res.json('Sending..');
	});


	api.get('/workingdomain', (req, res) => {
		res.json(modulevar.getWorkingDomain());
	});

	api.get('/colanotificaciones', (req, res) => {
		var response = {
			count: modulevar.getNotificaciones().length,
			results: modulevar.getNotificaciones() 
		}

		res.json(response);
	});

	api.get('/search/:value', (req, res) => {
		googleSearch.build({
		q: req.params.value,
		googlehost: "http://www.imprentanacional.go.cr" // Restricts results to URLs from a specified site 
		}, function(error, response) {
			res.json(response);
		});
	});


	return api;
}
