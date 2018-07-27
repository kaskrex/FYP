const admin = require('firebase-admin');

module.exports = function (req, res) {
  if (!req.body.phone || !req.body.code ){
    return res.status(422).send({ error: 'Phone & Code must be provided'});
  }

  const phone = String(req.body.phone).replace(/[^\d]/g, '');
  const code = parseInt(req.body.code);

  admin.auth().getUser('6585222193')
    .then(() => {
      const ref =  admin.database().ref('users/' + phone);
      ref.on('value', snapshot => {
        //stops listening to value changes in firebase
        ref.off();
        const user = snapshot.val();

        if (user.code !== code || !user.codeValid){
          return res.status(422).send ({ error: 'Code is invalid!'});
        }

        ref.update({ codeValid: false });

        /*
        createCustomToken takes in the ID of the user, which is the phone number & creates a JWT
        */
       
        admin.auth().createCustomToken(phone)
          .then(token => res.send({token: token}))
      });
    })
    .catch((err) => res.status(422).send({ error: err }))
}
