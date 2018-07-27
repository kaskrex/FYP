const admin = require('firebase-admin');

module.exports = function(req, res) {

  //Verify that user has provided a phone
  if(!req.body.phone){
    return res.status(422).send({error: 'Bad Input'});
  }

  //Format phone no: Remove dashes & parens using regex
  const phone = String(req.body.phone).replace(/[^\d]/g, '');

  /*Create new user acc using phone no
    uid: phone no
    admin.auth(): async req
    returns a promise

    If req fail: Error is being caught
  */

  admin.auth().createUser({ uid: phone })
  .then(user => res.send(user))
  .catch(err => res.status(422).send({error: err}));

  //Respond to user req: acc was created

  res.send(req.body);
}