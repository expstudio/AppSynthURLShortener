### Start local server for testing
First run npm install 

Then node server.js



### Process of deploying to production server
- Use ssh to connect to server
- Backend
    * Backend api server located in ~/tinyapp-backend
    * Update new version in master using git pull origin master
    * To restart server using  ‘pm2 restart server’
    * To show log using ‘pm2 logs’
- Browser Version
    * Browser version running on NGinx located in /var/www/tinyapp_ionic 
    * To update version go to ~/tinyapp-browser
    * Git pull origin master
    * https://gitlab.iwa.fi/tinyapp/tinyapp-browser
    * Copy all files from ~/tinyapp-browser/www/ to ~/tinyapp-browser
    * To restart server using ‘sudo service nginx restart’
    * 