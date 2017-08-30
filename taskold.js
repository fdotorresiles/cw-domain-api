var schedule = require('node-schedule');
var modulevar = require('../variables');
const nodemailer = require('nodemailer');
var request = require('request');
var GoogleSearch = require('google-search');
var moment = require('moment');

export default ({ config }) => {

    request.get( config.baseurl + 'Notifications', function(err, response, body) {
        if (!err && response.statusCode == 200) {
            var notificaciones = JSON.parse(body);
            if(notificaciones.length > 0 ){
                
                notificaciones.forEach(function(notificacion) {
                    modulevar.addNotificacion(notificacion)
                }, this);
            }
        }
    });

    var thdomainsxuser = schedule.scheduleJob({ rule: '*/5 * * * * *' }, function(){
        request.get( config.baseurl + 'DomainsperUsers?filter[where][active]=true' , function(err, response, body) {

            if (!err && response.statusCode == 200) {
                var wDomain = JSON.parse(body);
                wDomain.forEach(function(element) {

                    var userexist = modulevar.getWorkingDomain().some(function (item) {
                        return item.id == element.id;
                    });
                    
                    if( !userexist ) {   
                        modulevar.addWorkingDomain(element);
                    }

                }, this);   
            }
        })
    });

    var thbusqueda = schedule.scheduleJob({ rule: '*/5 * * * * *' }, function(){

        if (modulevar.getWorkingDomain() != null ) {

            modulevar.getWorkingDomain().forEach(function(wdomain) {

                var programdomain = modulevar.getProgramerDomain().some(function (item) {
                    return item.id == wdomain.id;
                });

                if ( !programdomain ) {
                    modulevar.addProgramerDomain(wdomain)

                    //var time = wdomain.periodicity.split(':');
                    var date = moment(wdomain.periodicity)
                    console.log(date.hour())
                    console.log(date.minutes())

                    var crule = new schedule.RecurrenceRule();
                    crule.hour = date.hour();
                    crule.minute = date.minutes();

                    const itemRule = {
                        programerDomain: wdomain
                    }

                    new Thread(crule, itemRule, config); //ToDo Agregar en lista para poder editar y quitar cuando se necesite

                }
            }, this);
        }
    });
}

function Thread(rule, itemRule, config) {
    console.log('Begin')
    var temptagsxdomainxuser = null;
    var tempdomain = null;

    var th = schedule.scheduleJob({ rule }, function(){

        request.get( config.baseurl + 'DomainsperUsers/' + itemRule.programerDomain.id + '/tagperDomainxUsers?filter[where][active]=true' , function(err, response, body) {
            if (!err && response.statusCode == 200) {
                var tagsxdomainxuser = JSON.parse(body);
                if(tagsxdomainxuser.length > 0 ){
                    temptagsxdomainxuser = tagsxdomainxuser;
                    request.get( config.baseurl + 'Domains/'+ itemRule.programerDomain.domainId , function(err, response, body) {
                        var domain = JSON.parse(body);
                        tempdomain = domain;
                        
                        var googleSearch = new GoogleSearch({
                            key: domain.key,
                            cx: domain.cx
                        });
                        console.log('0')
                        tagsxdomainxuser.forEach(function(tagdomain) {
                            console.log(tagdomain.tag)
                            googleSearch.build({
                            q: tagdomain.tag,
                            googlehost: domain.url
                            },
                            function(error, response) {
                                if (response != null ) {

                                    if (response.items != undefined ) {

                                        response.items.forEach(function(resultquery) {

                                            var notificacionexists = modulevar.getNotificaciones().some(function (item) {
                                                return item.userxdomainId == itemRule.programerDomain.id && item.urlresult == resultquery.link && item.tagperDomainxUserId == tagdomain.id;
                                            });

                                            if ( !notificacionexists ) {
                                                var currentnotificacion = {
                                                    userxdomainId: itemRule.programerDomain.id,
                                                    urlresult: resultquery.link,
                                                    //creationurlDate: resultquery.pagemap.metatags[0].creationdate,
                                                    tagperDomainxUserId: tagdomain.id,
                                                    notify: false
                                                };

                                                var options = {
                                                    method: 'post',
                                                    body: currentnotificacion,
                                                    json: true,
                                                    url: config.baseurl + 'TagsperDomainsxUsers/'+tagdomain.id+'/notificacitiontagId'
                                                }

                                                request(options, function (err, res, body) {
                                                    if (err) {
                                                        console.log(err)
                                                        return
                                                    }
                                                    modulevar.addNotificacion(currentnotificacion)
                                                });
                                            }
                                        }, this);
                                    }
                                }
                            });
                        })

                        setTimeout(function(){

                            console.log('1')
                            var cuerpo_correo = [];
                            //GetUsuario
                            if(temptagsxdomainxuser.length > 0 ){
                                console.log('2')
                                temptagsxdomainxuser.forEach(function(tagdomain) {
                                    console.log('3')
                                    request.get( config.baseurl + 'TagsperDomainsxUsers/' + tagdomain.id + '/notificacitiontagId?filter[where][notify]=false', function(err, response, body) {
                                        var tagsfinds = JSON.parse(body);
                                        console.log('4')
                                        if(tagsfinds.length > 0 ){
                                            const item = {
                                                tagbusqueda: tagdomain,
                                                resultadotag: tagsfinds
                                            }
                                            console.log('5')
                                            cuerpo_correo.push(item)
                                        }
                                        console.log('Send', cuerpo_correo.length)
                                    })
                                })

                                setTimeout(function(){
                                    console.log("WAITING");
                                    console.log('6')
                                    console.log('Send', cuerpo_correo)
                                    if (cuerpo_correo.length > 0 ) {
                                        request.get( config.baseurl + 'UserCustoms/' + itemRule.programerDomain.userId, function(err, response, body) {
                                            if (!err && response.statusCode == 200) {
                                                var user = JSON.parse(body);
                                                console.log('7')

                                                let transporter = nodemailer.createTransport({
                                                    host: 'smtp-mail.outlook.com',
                                                    port: 587,
                                                    secure: false, // secure:true for port 465, secure:false for port 587
                                                    auth: {
                                                        user: 'fdotorresiles@outlook.com',
                                                        pass: 'religion=6328'
                                                    }
                                                });

                                                var messagebody = "";

                                                cuerpo_correo.forEach(function(palabras) {
                                                    console.log('Send ', palabras)
                                                    messagebody += "Palabra a buscar: " + palabras.tagbusqueda.tag + "\n"
                                                    messagebody += "Se encontro en las siguientes direcciones: \n"
                                                    palabras.resultadotag.forEach(function(busqueda) {
                                                        messagebody += busqueda.urlresult + "\n"
                                                        
                                                    }, this);

                                                    messagebody += ""
                                                    messagebody += "\n"
                                                    
                                                }, this);

                                                setTimeout(function(){

                                                    console.log('8')
                                                    console.log(messagebody)
                                                    let mailOptions = {
                                                        from: 'fdotorresiles@outlook.com', // sender address
                                                        to: user.email, // list of receivers
                                                        subject: 'Notificaciones', // Subject line
                                                        text: messagebody, // plain text body
                                                    };

                                                    // send mail with defined transport object
                                                    transporter.sendMail(mailOptions, (error, info) => {
                                                        if (error) {
                                                            return console.log(error);
                                                        }
                                                        console.log('Message %s sent: %s', info.messageId, info.response);

                                                        cuerpo_correo.forEach(function(item) {

                                                            item.resultadotag.forEach(function(element) {
                                                                element.notify = true

                                                                var options = {
                                                                    method: 'put',
                                                                    body: element,
                                                                    json: true,
                                                                    url: config.baseurl + 'Notifications/'+element.id
                                                                }

                                                                request(options, function (err, res, body) {
                                                                    if (err) {
                                                                        console.log(err)
                                                                        return
                                                                    }
                                                                    console.log(body)
                                                                });
                                                                
                                                            }, this);

                                                        }, this);
                                                        //Cambiar estado de notificación.
                                                    });

                                                }, 10000);
                                            }
                                        });
                                    }
                                }, 10000);
                            }

                        }, 15000);

                        //new mail({itemRule, temptagsxdomainxuser, tempdomain});
                    });
                }
            }
        });

    })
}

function mail(domainxuser, temptagsxdomainxuser, tempdomain) { 
}