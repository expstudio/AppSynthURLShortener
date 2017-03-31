### Start local server for testing
First step run `npm install`

Then `node backend/scripts/seed.js` for the first time to seed sequence data.

Then `node server.js`


### Generate URL form
- `http://localhost:4000`

### Security issues
- Flooding, DDOS, CSRF
- Sanitize and validate url input
- Redirect loop because of friendly alias url.
- Sequence guessing
- Javascript content in url
    - javascript:(function()xxxx

### Scalability issues
- Encryption/Decryption time 
- Lookup sequence id time
- Lookup existing url time when create shorten url
