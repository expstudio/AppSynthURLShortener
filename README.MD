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
- Javascript content in url
    - javascript:(function()%7Bjavascript%3A (function () %7Bvar elem %3D document.querySelectorAll(%5B"body"%2C"html"%2C"div"%2C"section"%2C"header"%2C"footer"%2C"img"%5D)%3Bfor( index%3D0%3B index < elem.length%3B index%2B%2B ) %7BremoveGrayscale(elem%5Bindex%5D)%3B%7Dvar str %3D "*%7B-moz-filter%3Agrayscale(0)!important%3B-webkit-filter%3Agrayscale(0)!important%3B-o-filter%3Agrayscale(0)!important%3B-ms-filter%3Agrayscale(0)!important%3B%7D"%3Bvar node %3D document.createElement(%27style%27)%3Bnode.innerHTML %3D str%3Bdocument.head.appendChild(node)%3Bfunction removeGrayscale( element )%7Bvar filter %3D window.getComputedStyle(element%2Cnull).getPropertyValue("filter")%3Bif(filter.startsWith(%27grayscale%27))%7Belement.style.setProperty("filter"%2C "none"%2C "important")%3B%7Dfilter %3D window.getComputedStyle(element%2Cnull).getPropertyValue("-webkit-filter")%3Bif(filter.startsWith(%27grayscale%27))%7Belement.style.setProperty("-webkit-filter"%2C "none"%2C "important")%3B%7Dfilter %3D window.getComputedStyle(element%2Cnull).getPropertyValue("-o-filter")%3Bif(filter.startsWith(%27grayscale%27))%7Belement.style.setProperty("-o-filter"%2C "none"%2C "important")%3B%7Dfilter %3D window.getComputedStyle(element%2Cnull).getPropertyValue("-ms-filter")%3Bif(filter.startsWith(%27grayscale%27))%7Belement.style.setProperty("-ms-filter"%2C "none"%2C "important")%3B%7D%7D%7D())%7D)()

### Scalability issues
- Encryption/Decryption time 
- Lookup sequence id time
- Lookup existing url time when create shorten url
