### Start local server for testing
First step run `npm install`

Then `node server.js`



### Process of deploying to production server
- Use `ssh` to connect to server
- Backend
    * Backend api server located in `~/tinyapp-backend`
    * Update new version in master using `git pull origin master`
    * To restart server using  `pm2 restart server`
    * To show log using `pm2 logs`
- Browser Version
    * Browser version running on NGinx located in `/var/www/tinyapp_ionic`
    * To update version go to `~/tinyapp-browser`
    * Git `pull origin master`
    * Go to https://gitlab.iwa.fi/tinyapp/tinyapp-browser
    * Copy all files from `~/tinyapp-browser/www/` to `~/tinyapp-browser`
    * To restart server using `sudo service nginx restart`
    

### Database manipulation

- Use ssh to connect to server
- `mongo tiny-app` to connect mongodb server
- Available collections
    * users
    * events
    * groups
    * messages
    * group_messages
    * invitations
    * nurseries
    * students
    * sessions
    * historyRecords
- Check collection schema at https://trello.com/c/k50T0EhJ/234-user-flow-descriptions-and-how-data-is-linked-to-each-other-we-were-asked-that-what-information-is-deleted-when-user-deletes-own
- `db.users.find({})` to show all records in `users` collection.
- `db.users.find({"_id": ObjectId("587c3cbb07bf58bff86276dd")})` to find specific user by `_id`
- `db.users.find({"local.email": "way@iwa.fi"})` to find specific user by `email`
- `db.users.remove({"_id": ObjectId("587c3cbb07bf58bff86276dd")})` to remove specific user by `_id`
- `db.historyRecords.insert({[JSON OBJECT]})` to insert new record to collection.
- `db.collection('invitations').update({_id: invitation._id}, {[FULL JSON OBJECT]})` to update record with whole new record.
- `db.collection('events').update({invitation_id: invitation_id}, {$set: {'title': invitation.title, 'description': invitation.description}})` to update some part of record using `$set` function.