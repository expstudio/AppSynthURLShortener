
require('../servers/mongodb')(function(db) {
  db.collection('counters').insert((
   {
      _id: "urlid",
      seq: 0
   }
  ), function(err, _url) {
    if (err) {
      console.log('Failed with err: ', err.toString());
    }

    console.log('--Seed done--');
  });
});