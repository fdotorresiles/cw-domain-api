var schedule = require('node-schedule');
var moment = require('moment');
var async = require("async");
var modulevar = require('../variables');
var request = require('request');
import config from '../config.json';
const SENDGRID_API_KEY = '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';
const SENDGRID_SENDER = 'Twice Pixels';
const Sendgrid = require('sendgrid')(SENDGRID_API_KEY);

module.exports = class mail {
    constructor() {}

    start(itemWord){
        var date = moment(itemWord.periodicity);
        date.add(2, 'minutes');
        var rule = new schedule.RecurrenceRule();
        rule.hour = date.hour();
        rule.minute = date.minutes(); //aumentar 2 minutos

        console.log(rule.minute);
        var th = schedule.scheduleJob({ rule }, function(itemWord){
            console.log("Hilo de correo para el id:", itemWord.id);
            request.get( config.baseurl + 'Notifications?filter[where][userxdomainId]='+itemWord.id, function(err, response, body) {
                if (!err && response.statusCode == 200) {
                    var notificaciones = JSON.parse(body);
                    var message = "";

                    notificaciones.forEach(function(element) {
                        message += element.urlresult + "\n";
                        
                    }, this);

                    const sgReq = Sendgrid.emptyRequest({
                        method: 'POST',
                        path: '/v3/mail/send',
                        body: {
                          personalizations: [{
                            to: [{ email: 'ltorres@impesa.net' }],
                            subject: 'Notificaciones'
                          }],
                          from: { email: SENDGRID_SENDER },
                          content: [{
                            type: 'text/plain',
                            value: message
                          }]
                        }
                      });
                    
                      Sendgrid.API(sgReq, (err) => {
                        if (err) {
                          //next(err);
                          return;
                        }

                        notificaciones.forEach(function(element) {
                            element.notify = true;

                            var options = {
                                method: 'post',
                                body: element,
                                json: true,
                                url: config.baseurl + 'Notifications/'+element.id
                            }

                            request(options, function (err, res, body) {
                                if (err) {
                                    console.log(err)
                                    return
                                }
                            });
                            
                        }, this);

                        // Render the index route on success
                      });

                }
                

                
            });
        }.bind(null, itemWord));
        //Programar tarea
    }
}