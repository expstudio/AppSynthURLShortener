var APP = angular.module('TinyApp', [
	'ngRoute', 'ui.router', 'ngResource', 'firebase', 'ngMessages', 'ui.calendar', 'ui.bootstrap',
    'ngSanitize', 'toastr', 'xeditable', 'btford.socket-io', 'angularFileUpload', 'ngCkeditor',
    'ui.jq', 'pascalprecht.translate', 'LocalStorageModule'
]);

APP.config(function ($translateProvider) {
    $translateProvider.translations('en', {
        LANG_TEXT_EN: 'English',
        LANG_TEXT_FI: 'Suomeksi',
        SLOGAN: 'Where small matters make a big difference',
        SUPPORT_FT: 'Support',
        HOMEPAGE: 'Home',
        Q_A: 'Q&A',
        CONTACT_US: 'Contact us',
        SUBSCRIBE_TEXT:'Stay up to date with the latest news from TinyApp',
        SUBSCRIBE_PLACEHOLDER: 'Enter your email address',
        SUBSCRIBE_TEXT_BTN: 'Subscribe now',
        LOG_IN: 'Log in',
        LOG_OUT: 'Log out',
        SIGNUP: 'Sign up',
        CREATE_NEW_ACCOUNT: 'Create new account',
        IM_A_TEACHER: 'I\'m a teacher',
        IM_A_PARENT: 'I\'m a parent',
        SIGN_UP_NOW: 'Sign up now',
        ONLY_2MINS: 'It only takes 2 minutes!',
        FULL_NAME: 'Name',
        EMAIL: 'Email',
        PASSWORD: 'Password',
        CONFIRM_PWD: 'Confirm password',
        GROUP_CODE: 'Daycare code',
        SELECT_CITY: 'Select the city in which your daycare is located',
        SELECT_KINDERGARTEN: 'Select your daycare',
        ENTER_GROUP_NAME: 'Enter name of your group',
        AGREE_TERMS_FIRST_HALF: 'By signing up you agree to our ',
        AGREE_TERMS_SECOND_HALF: 'terms of service and privacy policy.',
        HAVE_ACCOUNT: 'Already have an account',
        CODE_NOTE: '(1) This code is used when you join an existing group. Please ask your colleague for the code.',
        SIGNUP_SOCIALS: 'Later you will be able to sign up using your social media accounts',
        FORGOT_PWD: 'Forgot password',
        REMEMBER_ME: 'Remember me',
        NO_ACCOUNT: 'Don\'t have a TinyApp account yet? ',
        CREATE_NOW: 'Create your account now',
        KDG_GROUP: 'Daycare group',
        INCARE_STATUS: 'Incare',
        OUTCARE_STATUS: 'Outcare',
        INCARE_REPORT: 'Incare',
        OUTCARE_REPORT: 'Outcare',
        SICK: 'Sick',
        VACATION: 'On holiday',
        INCARE: 'Check in',
        OUTCARE: 'Check out',
        SAVE_STT: 'Save today\'s status',
        MY_GROUP: 'My child group',
        MESSAGES: 'Messages',
        CALENDAR: 'Calendar',
        HELP: 'Help',
        PROFILE: 'Profile',
        STT_UPDATED: 'Status is updated',
        INBOX: 'Inbox',
        SENT: 'Sent',
        DRAFT: 'Draft',
        SEND_MES: 'Send message',
        ADD_CHILD: 'Add child',
        ADD_ROW: 'Add row',
        STT_REPORT: 'Status report',
        CHILD: 'Child',
        WELCOME_TO: 'Welcome to the group of ',
        CREATE_YOUR_GROUP: 'Create your group',
        ENTER_CHILD_NAME: 'Enter child\'s name',
        CREATE_GROUP: 'Create group',
        ADD_EVENT: 'Add event',
        DAY: 'Day',
        WEEK: 'Week',
        MONTH: 'Month',
        MON: 'Mon',
        TUE: 'Tue',
        WED: 'Wed',
        THU: 'Thu',
        FRI: 'Fri',
        SAT: 'Sat',
        SUN: 'Sun',
        TITLE: 'Title',
        NEW_EVENT: 'New event',
        START_DATE: 'Start date',
        START_TIME: 'Start time',
        END_DATE: 'End date',
        END_TIME: 'End time',
        PUBLISH: 'Publish',
        CANCEL: 'Cancel',
        SAVE: 'Save',
        EDIT_EVENT: 'Edit event',
        CLOSE: 'Close',
        SAVE_CHANGES: 'Save changes',
        TODAY: 'Today',
        MY_CHILD: 'My child',
        NICKNAME: 'Nickname',
        ALLERGIES: 'Allergies',
        CONTACT_PERSON1: 'Primary contact/ Parent 1',
        CONTACT_PERSON2: 'Parent 2',
        PICKUP_PEOPLE: 'Who else can pick me up?',
        OTHER_NOTES: 'Other notes',
        ADD_USER:  'Add other user to this profile',
        USERS_EMAIL: 'Enter new user’s email address',
        EDIT: 'Edit',
        EMPTY: 'Empty',
        NO_DESCRIPTION: 'No description',
        NAME: 'Name',
        ADDRESS: 'Address',
        PHONE: 'Phone',
        ADD_MORE: 'Add more',
        PROFILE_PIC: 'Profile picture',
        CHOOSE_FILE: 'Choose file',
        CREATE_PROFILE: 'Create profile',
        HELP_THANK_YOU_TEXT:  'This is trial version of TinyApp. Thank you for you patience.',
        HELP_QUESTION_COMMENTS:  'If you have any questions or comments please contact us via email or phone. We will get back to you as soon as possible.',
        SUBSCRIBE_NOW: 'Subscribe now',
        ENTER_GROUP_NAME: 'Enter name of the group',
        LOGIN_TO_TINYAPP: 'Log in to TinyApp',
        OR: 'Or',
        KINDERGARTEN_GROUP: 'Daycare group',
        SAVE_STT: 'Save today\'s status',
        PROFILE: 'Profile',
        INBOX: 'Inbox',
        SENT: 'Sent',
        DRAFT: 'Draft',
        SEND_MESSAGE: 'Send message',
        COMPOSE_MESSAGE: 'Compose a new message',
        ADD_RECIPIENTS: 'Add recipients',
        SELECT_ALL: 'Select all',
        CHOOSE_TEMPLATE: 'Write a heading or choose a template',
        SAVE_DRAFT: 'Save draft',
        SEND: 'Send',
        CREATE_YOUR_CHILD_PROFILE: 'Please create a profile for your child',
        EMAIL_TO_RESET_PASSWORD: 'Enter email to reset your password',
        SUBMIT: 'Submit',
        RESET_PASSWORD: 'Reset your password',
        SIGN_IN_SOCIAL: 'Sign in with social accounts will be added in the future',
        HI: 'Hi',
        KIND_REGARDS: 'Kind regards',
        EXTRA_CLOTHES_TPL_TITLE: 'Extra clothes needed',
        EXTRA_CLOTHES_TPL_BODY:'Please bring extra indoor clothes for your child.',
        DIAPERS_TPL_TITLE: 'Nappies',
        DIAPERS_TPL_BODY:'Please bring a new packet of nappies for your child.',
        RAIN_CLOTHES_TPL_TITLE: 'Rain clothes',
        RAIN_CLOTHES_TPL_BODY:'Please check that your child has rain clothes and rubber boots at the daycare.',
        ABSENT_TPL_TITLE: 'Absent',
        ABSENT_TPL_BODY: 'My child will be absent',
        ABSENT_START_DATE: 'From',
        ABSENT_END_DATE: 'Until',
        ABSENT_REASON: 'Reason',
        STT_UPDATED_NOTI: 'Status is updated.',
        REQUEST_SENT_NOTI: 'Your request has been sent. Please check your email to create a new password.',
        PROFILE_UPDATED_NOTI: 'Profile is updated',
        CHILDREN_CREATED_NOTI: 'Group is created succesfully',
        PASSWORD_UPDATED_NOTI: 'Your password has been updated',
        SUBSCRIPTION_THANK_NOTI: 'Thank you for your subscription. You will receive the latest news from us.',
        NEW_MESSAGE_NOTI: 'You have a new message!',
        INFO: 'Info',
        MESSAGE_SENT_NOTI: 'Message sent!',
        MESSAGE_SAVED_AS_DRAFT_NOTI: 'Your message has been saved as a draft',
        MESSAGE_SENDING_ERR_NOTI: 'There was an error sending the message. Please try again.',
        MESSAGE_CANCELED_NOTI: 'Message has been cancelled.',
        CHILD_ADDED_TO_PROFILE_NOTI: 'has been added to your profile',
        CHILD_ADDED_ERROR_NOTI: 'This child has already been added!',
        SIGNUP_SUCCEEDED_NOTI: 'Signed up successfully!',
        WELCOME: 'Welcome',
        DRAFT_UPDATED_NOTI: 'Draft is updated',
        EVENT_SAVED_NOTI: 'Your event has been saved',
        STT_SAVED_NOTI: 'Today status is saved',
        HOW_TINY_HELP: 'How can TinyApp help you?',
        TINY_MISSION: 'We make the connection between teachers and parents stronger than ever before',
        THANK_SIGNUP_HEADER: 'Thank you for registering for our service.',
        THANK_SIGNUP_BODY: 'A confirmation email has been sent. Please check your inbox and activate your account.',
        ACTIVATED_MESS: 'Your account is now activated and you can continue using the TinyApp application. ',
        CLICK_HERE: 'Click here',
        TO_DISCOVER: ' to discover our services.',
        FILL_IN_EMPTY_FIELDS: 'Please fill in all empty fields.',
        TERMS_CONDITIONS: 'Terms and Conditions',
        WARM_WELCOME_TC: 'A warm welcome to the TinyApp application! TinyApp is currently in the pilot phase and below you can find the Terms and Conditions related to this trial. Please read these carefully.',
        CONTACT_EMAIL: 'If you have any questions related to these Terms and Conditions then please contact us by email at',
        FIRST_ITEM_TC: 'The Application is currently being piloted.',
        SECOND_ITEM_TC: 'The Application is being continuously updated and this may cause service breaks, disruptions or other similar issues. Where possible, users will be informed of all upcoming service breaks.',
        THIRD_ITEM_TC:'We do not guarantee that the Application will be suitable for the needs of all users while being piloted.',
        FOURTH_ITEM_TC:'The user is responsible for ensuring the security of their account username and password.',
        FIFTH_ITEM_TC:'The user is responsible for their use of the Application and all information submitted to the Application.',
        SIXTH_ITEM_TC:'Accounts and related information may be deleted by sending an email request to hello@tinyapp.biz from the same email address through which the TinyApp account was created.',
        SEVENTH_ITEM_TC:'The service works best with Chrome and Safari browsers.',
        QA_HEADING: 'Q&A related to the TinyApp pilot',
        QUESTION1: 'How do I start using TinyApp?',
        ANSWER1_P1: 'Go to the website',
        ANSWER1_P2: 'and click on ’Sign up’ at the top of the page. You will then be able to create an account as either a teacher or parent. You will be given additional instructions during the process of creating your account. NOTE: The ability to log in via social media will be added at a later date.',
        QUESTION2: 'Which browsers support the app?',
        ANSWER2_P1: 'The app currently works best in Chrome and Safari. We have noticed several problems when using different versions of Internet Explorer (IE) and are currently working to fix these issues. In the meantime however, we highly recommend using a different browser.',
        QUESTION3: 'Where will the app store my data?',
        ANSWER3_P1: 'TinyAPP uses the world’s largest and most widely used solution providers. During the pilot we will use Heroku provided by Amazon’s cloud computing service in addition to a database solution provided by MongoLab.',
        QUESTION4: 'How do I delete my own account and related information?',
        ANSWER4_P1: 'You can delete your own account and any information associated with it by sending an email request to the TinyApp team at hello@tinyapp.biz. This email must come from the same email address you used to create your account (for example, if your TinyApp account was created using the email address john.smith@example.com, the request to delete your account must come from this address).',
        QUESTION5: 'Who can access my TinyApp account information?',
        ANSWER5_P1: 'You will choose your own TinyApp username and password, and your account can only be accessed with this data. As a result, we cannot remind users of their password or provide a new one; instead, all users must reset their own passwords if necessary using the ’forgot password’ function.',
        ANSWER5_P2: 'Daycare staff will be able to view each child\'s information, but will not have editing rights for the profile. Staff will however be able to send and view messages, create new calendar entries and update the status of each child (in care, on holiday, sick).',
        ANSWER5_P3: 'Parents may only view messages and calendar entries pertaining to their own children, and are the only ones able to edit their child\'s profile.',
        QUESTION6: 'What does the pilot include?',
        ANSWER6_P1: 'During the pilot the daycare teacher can:',
        ANSWER6_P1_ITEM1: 'Log in to the service and create their own account',
        ANSWER6_P1_ITEM2: 'Create a new daycare group',
        ANSWER6_P1_ITEM3: 'Send messages and calendar invitations',
        ANSWER6_P1_ITEM4: 'Send the week’s programme to families',
        ANSWER6_P1_ITEM5: 'Check each child’s personal profile',
        ANSWER6_P1_ITEM6: 'Update each child’s individual status',
        ANSWER6_P2: 'During the pilot the parent can:',
        ANSWER6_P2_ITEM1: 'Log in to the service and create their own profile',
        ANSWER6_P2_ITEM2: 'Create a profile for their child',
        ANSWER6_P2_ITEM3: 'Reply to messages and calendar invitations from the daycare teacher',
        ANSWER6_P2_ITEM4: 'Update their child’s status',
        ANSWER6_P2_ITEM5: 'View their child’s weekly programme',
        ANSWER6_P3: 'During the pilot it will be possible to improve existing functionalities and to suggest new ones by providing feedback to the TinyApp team.',
        QUESTION7: 'What do I have to do during the pilot?',
        ANSWER7_P1: 'We hope that you will be active in using TinyApp when engaging in daycare-parent communication. We also hope that you will report any errors you find in the service and will offer any suggestions you may have for further developing TinyApp in the future.',
        QUESTION8: 'I have just updated my child’s profile, but the changes don’t appear to have been saved?',
        ANSWER8_P1: 'You may need to refresh your browser in order to see the changes. This can be done by clicking on the ‘refresh’ icon which is found on the right-hand side of the address bar in Safari, and to the left of the address bar in Chrome.',
        ANSWER8_P2: 'If refreshing the page does not help and you still can’t see the latest updates, try logging out and then back in. If the problem persists then please contact the TinyApp team.',
        QUESTION9: 'Where can I report a fault I have discovered in the app?',
        ANSWER9_P1: 'You can report any faults you have found to the email address',
        ANSWER9_P2: 'or calling Marjut on +358500414818.',
        QUESTION10: 'What happens after the pilot?',
        ANSWER10_P1: 'At the end of the pilot we will review the app’s success in improving communication between daycare staff and parents through interviews and questionnaire. The daycare will then decide if they wish to continue using TinyApp in the future.',
        QUESTION11: 'How is security being addressed during the pilot?',
        ANSWER11_P1: 'TinyAPP uses the world’s largest and most widely used solution providers. During the pilot, we will be using Heroku offered by Amazon’s cloud computing service in order to enable us to automatically receive all necessary security updates. Security is further enhanced as a result of all users choosing their own usernames and passwords, which must be kept safe at all times.',
        SEARCH: 'Search',
        EXPORT: 'Export',
        CHOOSE_START_DATE: 'Choose start date',
        CHOOSE_END_DATE: 'Choose end date',
        "Error: User not found": "Error: User not found",
        "Error: Wrong password": "Error: Oops! Wrong password",
        "Error: Email is in use": "Email is in use!",
        "Error: Group not found": "Group not found",
        "Cannot find partner": "We can not find the email of your partner. Please ask your partner to sign up.",
        "You are already a subscriber.": "You are already a subscriber.",
        "Email is invalid": "Email is invalid",
        "Cannot find this email in our system.": "Cannot find this email in our system.",
        JOIN_GROUP: 'Join group',
        "Group has been added": "Group has been added",
        "There was an error": "There was an error"
    });

    $translateProvider.translations('fi', {
        LANG_TEXT_EN: 'English',
        LANG_TEXT_FI: 'Suomeksi',
        SLOGAN: 'Suuria asioita pienten ihmisten maailmasta',
        SUPPORT_FT: 'Tuki',
        HOMEPAGE: 'Etusivu',
        Q_A: 'Usein kysyttyä',
        CONTACT_US: 'Yhteystiedot',
        SUBSCRIBE_TEXT:'Pysy ajantasalla uusimmista TinyApp uutisista',
        SUBSCRIBE_PLACEHOLDER: 'Kirjoita tähän kenttään sähköpostiosoitteesi',
        SUBSCRIBE_TEXT_BTN: 'Seuraa meitä',
        LOG_IN: 'Kirjaudu sisään',
        LOG_OUT: 'Kirjaudu ulos',
        SIGNUP: 'Luo tunnus',
        CREATE_NEW_ACCOUNT: 'Luo uusi tili',
        IM_A_TEACHER: 'Olen opettaja',
        IM_A_PARENT: 'Olen vanhempi',
        SIGN_UP_NOW: 'Kirjaudu nyt',
        ONLY_2MINS: 'Se vie vain 2 minuuttia',
        FULL_NAME: 'Nimi',
        EMAIL: 'Sähköposti',
        PASSWORD: 'Salasana',
        CONFIRM_PWD: 'Vahvista salasana',
        GROUP_CODE: 'Koodi päiväkodista',
        SELECT_CITY: 'Valitse kaupunki, jossa päiväkotisi sijaitsee',
        SELECT_KINDERGARTEN: 'Valitse päiväkotisi',
        ENTER_GROUP_NAME: 'Kirjoita ryhmäsi nimi',
        AGREE_TERMS_FIRST_HALF: 'Kirjautumalla palveluun hyväksyt meidän ',
        AGREE_TERMS_SECOND_HALF: 'käyttöehdot ja yksityisyysasetukset',
        HAVE_ACCOUNT: 'Onko sinulla jo tili?',
        CODE_NOTE: '(1) Tarvitset koodin, jos liityt jo olemassa olevaan ryhmään. Kysy koodi opettajakollegaltasi, joka on luonut ryhmän',
        SIGNUP_SOCIALS: 'Kirjautuminen sosiaalisen median käyttäjätilien avulla tulee käyttöön myöhemmin.',
        FORGOT_PWD: 'Unohdin salasanani',
        REMEMBER_ME: 'Muista minut',
        NO_ACCOUNT: 'Eikö sinulla ole vielä TinyApp-tiliä?',
        CREATE_NOW: 'Luo tilisi nyt',
        KDG_GROUP: 'Päiväkotiryhmä',
        INCARE_STATUS: 'Hoidossa',
        OUTCARE_STATUS: 'Poissa',
        INCARE_REPORT: 'Paikalla',
        OUTCARE_REPORT: 'Poissa',
        SICK: 'Sairaana',
        VACATION: 'Lomalla',
        INCARE: 'Kirjaa sisään',
        OUTCARE: 'Kirjaa ulos',
        SAVE_STT: 'Tallenna tämän päivän läsnäolot',
        MY_GROUP: 'Minun lapsiryhmäni',
        MESSAGES: 'Viestit',
        CALENDAR: 'Kalenteri',
        HELP: 'Apua',
        PROFILE: 'Profiili',
        STT_UPDATED: 'Tilanne on päivitetty',
        INBOX: 'Saapuneet ',
        SENT: 'Lähetetyt ',
        DRAFT: 'Luonnokset',
        SEND_MES: 'Lähetä ',
        ADD_CHILD: 'Lisää lapsi',
        ADD_ROW: 'Lisää rivi',
        STT_REPORT: 'Läsnäoloraportti',
        CHILD: 'Lapsi',
        WELCOME_TO: 'Tervetuloa ryhmään ',
        CREATE_YOUR_GROUP: 'Luo ryhmäsi',
        ENTER_CHILD_NAME: 'Kirjoita lapsen nimi',
        CREATE_GROUP: 'Luo ryhmä',
        ADD_EVENT: 'Lisää tapahtuma',
        DAY: 'Päivä',
        WEEK: 'Viikko',
        MONTH: 'Kuukausi',
        MON: 'Ma',
        TUE: 'Ti',
        WED: 'Ke',
        THU: 'To',
        FRI: 'Pe',
        SAT: 'La',
        SUN: 'Su',
        TITLE: 'Otsikko',
        NEW_EVENT: 'Uusi tapahtuma',
        START_DATE: 'Aloituspäivä',
        START_TIME: 'Aloitusaika',
        END_DATE: 'Lopetuspäivä',
        END_TIME: 'Lopetusaika',
        PUBLISH: 'Julkaise',
        CANCEL: 'Peruuta',
        SAVE: 'Tallenna',
        EDIT_EVENT: 'Päivitä',
        CLOSE: 'Sulje',
        SAVE_CHANGES: 'Tallenna muutokset',
        TODAY: 'Tänään',
        MY_CHILD: 'Lapseni',
        NICKNAME: 'Lempinimi',
        ALLERGIES: 'Allergiat',
        CONTACT_PERSON1: 'Ensisijainen yhteyshenkilö/ Vanhempi 1',
        CONTACT_PERSON2: 'Vanhempi 2',
        PICKUP_PEOPLE: 'Kuka muu voi noutaa minut?',
        OTHER_NOTES: 'Mitä muuta',
        ADD_USER:  'Lisää toinen käyttäjä tähän profiiliin',
        USERS_EMAIL: 'Kirjoita toisen käyttäjän sähköpostiosoite',
        EDIT: 'Muokkaa',
        EMPTY: 'Tyhjä',
        NO_DESCRIPTION: 'Ei kuvausta',
        NAME: 'Nimi',
        ADDRESS: 'Osoite',
        PHONE: 'Puhelinnumero',
        ADD_MORE: 'Lisää useampi',
        PROFILE_PIC: 'Profiilikuva',
        CHOOSE_FILE: 'Valitse kuva',
        CREATE_PROFILE: 'Luo profiili',
        HELP_THANK_YOU_TEXT:  'Tämä on TinyApp-sovelluksen pilottiversio. Kiitokset kärsivällisyydestäsi.',
        HELP_QUESTION_COMMENTS:  'Jos sinulla on kysymyksiä tai kommentteja niin olethan yhteydessä meihin sähköpostitse tai puhelimitse. Palaamme asiaan mahdollisimman pian.',
        SUBSCRIBE_NOW: 'Tilaa uutiskirje',
        ENTER_GROUP_NAME: 'Kirjoita ryhmäsi nimi',
        LOGIN_TO_TINYAPP: 'Kirjaudu TinyApp-sovellukseen',
        OR: 'Tai',
        KINDERGARTEN_GROUP: 'Päiväkotiryhmä',
        SAVE_STT: 'Tallenna tämän päivän läsnäolot',
        PROFILE: 'Profiili',
        INBOX: 'Saapuneet ',
        SENT: 'Lähetetyt ',
        DRAFT: 'Luonnokset',
        SEND_MESSAGE: 'Lähetä viesti',
        COMPOSE_MESSAGE: 'Kirjoita uusi viesti',
        ADD_RECIPIENTS: 'Lisää vastaanottajat',
        SELECT_ALL: 'Valitse kaikki',
        CHOOSE_TEMPLATE: 'Kirjoita otsikko tai valitse viestipohja',
        SAVE_DRAFT: 'Tallenna luonnos',
        SEND: 'Lähetä',
        CREATE_YOUR_CHILD_PROFILE: 'Luo lapsesi profiili',
        EMAIL_TO_RESET_PASSWORD: 'Kirjoita sähköpostiosoitteesi niin lähetämme sinulle ohjeet salasanan uusimiseksi.',
        SUBMIT: 'Lähetä',
        RESET_PASSWORD: 'Uusi salasanasi',
        SIGN_IN_SOCIAL: 'Kirjautuminen sosiaalisen median käyttäjätilien avulla tulee käyttöön myöhemmin.',
        HI: 'Hei',
        KIND_REGARDS: 'Ystävällisin terveisin',
        EXTRA_CLOTHES_TPL_TITLE: 'Varavaatteet',
        EXTRA_CLOTHES_TPL_BODY:'Lapseltanne ovat varavaatteet vähissä. Pyydämme täydentämään sisävaatteita mahdollisimman pian, kiitos.',
        DIAPERS_TPL_TITLE: 'Vaipat',
        DIAPERS_TPL_BODY:'Vaipat ovat loppumassa. Pyydämme tuomaan lisää vaippoja mahdollisimman pian, kiitos.',
        RAIN_CLOTHES_TPL_TITLE: 'Kuravaatteet',
        RAIN_CLOTHES_TPL_BODY:'Muistattehan tarkistaa, että lapsellanne on päiväkodissa puhtaat kuravaatteet ja sopivat kumisaappaat.',
        ABSENT_TPL_TITLE: 'Poissa',
        ABSENT_TPL_BODY: 'Lapseni on poissa päiväkodista ajalla:',
        ABSENT_START_DATE: 'Alku pvm',
        ABSENT_END_DATE: 'Loppu pvm',
        ABSENT_REASON: 'Syy',
        STT_UPDATED_NOTI: 'Läsnäolo on päivitetty.',
        REQUEST_SENT_NOTI: 'Pyyntösi uusia salasana on vastaanotettu. Saat pian sähköpostiisi ohjeet salasanan uusimiseksi.',
        PROFILE_UPDATED_NOTI: 'Profiili on päivitetty.',
        CHILDREN_CREATED_NOTI: 'Ryhmä on luotu.',
        PASSWORD_UPDATED_NOTI: 'Salasana on muutettu',
        SUBSCRIPTION_THANK_NOTI: 'Kiitokset uutiskirjeen tilauksesta!',
        NEW_MESSAGE_NOTI: 'Sinulle on uusi viesti!',
        INFO: 'Info',
        MESSAGE_SENT_NOTI: 'Viesti on lähetetty!',
        MESSAGE_SAVED_AS_DRAFT_NOTI: 'Viesti on tallennettu luonnoksena',
        MESSAGE_SENDING_ERR_NOTI: 'Viestiä ei ole lähetetty. Ole hyvä ja yritä uudelleen.',
        MESSAGE_CANCELED_NOTI: 'Viestin lähetys keskeytyi.',
        CHILD_ADDED_TO_PROFILE_NOTI: 'on lisätty profiiliisi.',
        CHILD_ADDED_ERROR_NOTI: 'Lapsi on jo ryhmässä!',
        SIGNUP_SUCCEEDED_NOTI: 'Olet kirjautunut onnistuneesti!',
        WELCOME: 'Tervetuloa',
        DRAFT_UPDATED_NOTI: 'Luonnos on tallennettu',
        EVENT_SAVED_NOTI: 'Tapahtuma on tallennettu',
        STT_SAVED_NOTI: 'Läsnäolo on tallennettu',
        HOW_TINY_HELP: 'Miten voimme auttaa?',
        TINY_MISSION: 'TinyApp vahvistaa päiväkodin ja perheen välistä viestintää',
        THANK_SIGNUP_HEADER: 'Kiitokset rekisteröitymisestä.',
        THANK_SIGNUP_BODY: 'Olemme lähettäneet sinulle vahvistusviestin. Katso sähköpostisi ja aktivoi tilisi sähköpostissa olevien ohjeiden mukaisesti.',
        ACTIVATED_MESS: 'Tilisi on nyt aktivoitu ja voit jatkaa TinyApp Application. ',
        CLICK_HERE: 'Klikkaa tästä',
        TO_DISCOVER: ' palveluumme',
        FILL_IN_EMPTY_FIELDS: 'Ole hyvä ja täytä tyhjät kentät.',
        TERMS_CONDITIONS: 'Ehdot ja edellytykset',
        WARM_WELCOME_TC: 'Lämpimästi tervetuloa käyttämään TinyApp-palvelua. TinyApp on nyt pilottikäytössä. Alla on pilottiin liittyvät ehdot ja edellytykset. Luethan ne huolellisesti.',
        CONTACT_EMAIL: 'Mikäli sinulla tulee kysyttävää ehdoista niin saat meihin yhteyden sähköpostitse',
        FIRST_ITEM_TC: 'Palvelu on pilottikäytössä.',
        SECOND_ITEM_TC: 'Palvelua kehitetään jatkuvasti pilottikäytön aikana ja tästä voi aiheutua. Palveluun käyttökatkoja, häiriöitä tai muita vastaavia tilanteita. Käyttökatkoista pyritään mahdollisuuksien mukaan ilmoittamaan Asiakkaalle etukäteen.',
        THIRD_ITEM_TC:'Pilottikäytössä olevalle Palvelulle ei anneta takuuta sen soveltuvuudesta asiakkaan käyttötarpeisiin. ',
        FOURTH_ITEM_TC:'Asiakkaan tulee huolehtia oman tilin käyttäjätunnuksesta ja salasanasta.',
        FIFTH_ITEM_TC:'Asiakas on itse vastuussa Palvelun käytöstä ja Palveluun laittamistaan tiedoista.',
        SIXTH_ITEM_TC:'Oman tilin ja siihen liittyvät tiedot saat halutessasi poistetuksi lähettämällä sähköpostitse pyynnön TinyApp-tiimille hello@tinyapp.biz samasta sähköpostiosoitteesta, josta loit TinyApp-tilin.',
        SEVENTH_ITEM_TC:'Palvelu toimii parhaiten Chrome- ja Safari- selaimilla.',
        QA_HEADING: 'Kysymyksiä ja vastauksia TinyApp-pilottiin',
        QUESTION1: 'Miten otan TinyApp-sovelluksen käyttöön?',
        ANSWER1_P1: 'Mene verkkosivulle',
        ANSWER1_P2: 'ja valitse yläreunasta \"Luo tunnus\". Tämän jälkeen voi valita luotko tilin opettajana vai vanhempana. Lisäohjeita saat tilin luomisen yhteydessä. HUOM! Sosiaalisen median sisäänkirjautumisvaihtoehdot tulevat käyttöön myöhemmin.',
        QUESTION2: 'Millä selaimella palvelu toimii?',
        ANSWER2_P1: 'Palvelu toimii tällä hetkellä parhaiten Chrome- ja Safari-selaimilla. Olemme tunnistaneet ongelmia palvelun käytössä Internet Explorer (IE)-selaimen eri versioilla ja selvitämme niitä parhaillaan. Suosittelemme toistaiseksi käyttämään muita selaimia kuin IE:tä. ',
        QUESTION3: 'Mihin sovellukseen laitettu tieto tallentuu?',
        ANSWER3_P1: 'TinyApp käyttää maailman suurimpien ja laajasti hyödynnettyjen teknologiatoimijoiden ratkaisuja. Pilotin aikana käytämme Herokun tarjoamaa Amazon AWS-pilvipalveluympäristöä sekä  pilvipalveluna tarjottavaa MongoLab-tietokantaratkaisua.',
        QUESTION4: 'Miten saan oman tilin ja siihen liittyvät tiedot poistetuksi?',
        ANSWER4_P1: 'Oman tilin ja siihen liittyvät tiedot saat poistetuksi lähettämällä sähköpostitse pyynnön TinyApp-tiimille (hello@tinyapp.biz) samasta sähköpostiosoitteesta, josta loit TinyApp-tilin. Jos olet käyttänyt TinyApp-palvelussa sähköpostiosoitetta minna.mallikas@esimerkki.fi, tilin poistopyyntö tulee lähettää samasta sähköpostiosoitteesta.',
        QUESTION5: 'Kuka näkee TinyApp- tilillä olevat tiedot?',
        ANSWER5_P1: 'Jokainen käyttäjä asettaa omalle TinyApp-tililleen käyttäjätunnuksen sekä salasanan. Vain näillä tiedoilla näkee tilin tiedot. Tämän vuoksi emme voi palauttaa tai antaa uusia salasanoja, vaan jokaisen käyttäjän täytyy uusia salasanansa itse \"Unohdin salasanani\"-toiminnolla.',
        ANSWER5_P2: 'Päiväkotiryhmän henkilökunta näkee kaikkien lasten profiilitiedot, mutta ei pääse niitä muokkaamaan. Päiväkotiryhmän henkilökunta näkee myös viestiliikenteen, kalenterimerkinnät ja lapsen tilan (paikalla, lomalla, sairaana).',
        ANSWER5_P3: 'Kukin vanhempi näkee ja pystyy muokkaamaan vain oman lapsensa profiilitietoja ja näkee opettajan lähettämät viestit ja kalenteritapahtumat.',
        QUESTION6: 'Mitä pilotti pitää sisällään?',
        ANSWER6_P1: 'Pilotin aikana päiväkodin opettaja pystyy:',
        ANSWER6_P1_ITEM1: 'kirjautumaan palveluun ja luomaan oman tilin',
        ANSWER6_P1_ITEM2: 'luomaan päiväkotiryhmän',
        ANSWER6_P1_ITEM3: 'lähettämään viestejä ja kalenterikutsuja sekä',
        ANSWER6_P1_ITEM4: 'jakamaan viikko-ohjelman perheille',
        ANSWER6_P1_ITEM5: 'katsomaan lapsen/lasten profiileja sekä',
        ANSWER6_P1_ITEM6: 'päivittämään lasten läsnäolon',
        ANSWER6_P2: 'Pilotin aikana vanhemmat pystyvät: ',
        ANSWER6_P2_ITEM1: 'kirjautumaan palveluun ja luomaan oman tilin',
        ANSWER6_P2_ITEM2: 'luomaan oman lapsen profiilin',
        ANSWER6_P2_ITEM3: 'vastaamaan päiväkodin opettajien viesteihin ja kalenterikutsuihin',
        ANSWER6_P2_ITEM4: 'päivittämään lapsen läsnäolon sekä',
        ANSWER6_P2_ITEM5: 'katsomaan viikko-ohjelman',
        ANSWER6_P3: 'Pilotin aikana parannetaan jo olemassa olevia toiminnallisuuksia sekä toteutetaan uusia päiväkodin henkilökunnalta ja vanhemmilta saadun palautteen avulla.',
        QUESTION7: 'Mitä minun pitää tehdä pilotin aikana?',
        ANSWER7_P1: 'Toivomme, että käytät TinyApp-palvelua aktiivisesti päiväkodin ja perheen välisessä viestinnässä ja että raportoit tunnistamasi viat TinyApp-tiimille. Lisäksi kuulemme mielellämme toiveitasi ja kehitysehdotuksiasi.',
        QUESTION8: 'Päivitin juuri lapseni profiilia, mutta en näe uusia tietoja',
        ANSWER8_P1: 'Välillä päivitetyt tiedot vaativat, että päivität koko sivun selaimen “päivitä”-toiminnalla. Tämä onnistuu esimerkiksi klikkaamalla “päivitä”-ikonia Safari-selaimessa web-sivun osoiterivin oikeasta reunasta ja Chrome-selaimessa vastaavasti osoiterivin vasemmasta reunasta. ',
        ANSWER8_P2: 'Jos “päivitä” ei auta ja päivitetyt tiedot eivät edelleenkään näy, kirjaudu ulos palvelusta ja kirjaudu uudelleen sisään. Mikäli tämäkään ei auta niin ole yhteydessä TinyApp-tiimiin.',
        QUESTION9: 'Mihin voin ilmoittaa löytämäni viat?',
        ANSWER9_P1: 'Voit ilmoittaa löytämäsi viat sähköpostitse osoitteeseen',
        ANSWER9_P2: 'tai puhelimitse Marjut/ 0500 414 818.',
        QUESTION10: 'Mitä tapahtuu pilottijakson jälkeen?',
        ANSWER10_P1: 'Pilottijakson jälkeen arvioimme yhdessä päiväkodin henkilöstön ja pilottiin osallistuneiden vanhempien kanssa Palvelun soveltuvuutta päiväkodin ja perheiden väliseen viestintään. TinyApp-tiimi haastattelee ja/tai lähettää kyselyn sekä päiväkodin henkilökunnalle että vanhemmille. Pilottiin osallistunut päiväkoti päättää mahdollisesta Palvelun jatkokäytöstä.',
        QUESTION11: 'Miten tietoturva on huomioitu pilotin aikana?',
        ANSWER11_P1: 'TinyApp käyttää maailman suurimpien ja laajasti hyödynnettyjen teknologiatoimijoiden ratkaisuja. Pilotin aikana käytämme Herokun tarjoamaa Amazon AWS-pilvipalveluympäristöä, joka muun muassa mahdollistaa sen, että saamme tarvittavat tietoturvapäivitykset automaattisesti. Lisäksi jokainen TinyApp-tili on henkilökohtaisen käyttäjätunnuksen ja salasanan takana. Jokaisen Palvelun käyttäjän tulee itse huolehtia käyttäjätunnuksen ja salasanan turvallisuudesta.',
        SEARCH: 'Hae',
        EXPORT: 'Tallenna raportti',
        CHOOSE_START_DATE: 'Valitse aloituspäivä',
        CHOOSE_END_DATE: 'Valitse Lopetuspäivä',
        "Error: Wrong password": "Oops! Väärä salasana.",
        "Error: User not found": "Käyttäjää ei löytynyt",
        "Error: Email is in use": "Sähköposti on jo käytössä!",
        "Error: Group not found": "Ryhmää ei löydy",
        "Cannot find partner": "Lisäämäsi henkilön sähköpostia ei löydy. Pyydä häntä kirjautumaan palveluun.",
        "You are already a subscriber.": "Olet jo tilannut uutiskirjeen.",
        "Email is invalid": "Tarkista sähköpostiosoite.",
        "Cannot find this email in our system.": "Tätä sähköpostiosoitetta ei löydy järjestelmästämme.",
        JOIN_GROUP: 'Liity ryhmään',
        "Group has been added": "Group has been added",
        "There was an error": "There was an error",
        "Callback": "Soittopyyntö",
        "Could you please call to the nursery as soon as possible.": "Voisitko ystävällisesti soittaa päiväkotiin pian.",
        "Calendar updated": "Kalenteri päivitetty",
        "Please check the latest updates in the calendar.": "Tarkistattehan kalenterista uusimmat päivitykset.",
        "Feedback and Wishes!": "Palautetta ja toiveita!",
        "Praise, ask, wish or critisize.": "Kehu, ihmettele, toivo tai moiti.",
        "We appreciate your feedback and improve TinyApp service continously.": "Kehitämme palvelua pilotin aikana.",
        "Your email address": "Sähköpostisoitteesi",
        "Enter your message": "Viesti",
        "Send": "Lähetä",
        "Save profile": "Tallenna",
        "Feedback": "Palaute",
        "Thank you for your feedback.": "Kiitokset palautteesta.",
        "Group has been added.": "Uusi ryhmä on lisätty.",
        "Delete profile": "Poista profiili"
    });

    $translateProvider.preferredLanguage('en');
});
APP.config(function($stateProvider, $urlRouterProvider, $locationProvider, toastrConfig, localStorageServiceProvider){
    localStorageServiceProvider
        .setPrefix('tinyApp');
    angular.extend(toastrConfig, {
        allowHtml: true,
        closeButton: true,
        closeHtml: '<button>&times;</button>',
        containerId: 'toast-container',
        extendedTimeOut: 1000,
        iconClasses: {
            error: 'toast-error',
            error: 'toast-error',
            info: 'toast-info',
            success: 'toast-success',
            warning: 'toast-warning'
        },
        maxOpened: 0,
        messageClass: 'toast-message',
        newestOnTop: true,
        onHidden: null,
        onShown: null,
        positionClass: 'toast-top-right',
        tapToDismiss: true,
        timeOut: 5000,
        titleClass: 'toast-title',
        toastClass: 'toast'
    });
    var routePermission = {
        teacher: {
            auth: function(authClient) {
                return authClient.authorizeUser('teacher');
            }
        },
        parent: {
            auth: function(authClient) {
                return authClient.authorizeUser('parent');
            }
        },
        user: {
            auth: function(authClient) {
                return authClient.authorizeAuthenticatedUser();
            }
        }
    };
    $urlRouterProvider.otherwise("/");

    $stateProvider
        .state('/', {
            url: '/',
            templateUrl: "views/home.html"
            //controller: 'mainController'
        })
        .state('login', {
            url: '/login',
            templateUrl: "views/login.html",
            controller: 'userController'
        })

        .state('signup', {
            url: '/signup',
            templateUrl: 'views/signup.html',
            controller: 'userController'
        })
            .state('teacher', {
                url: '/teacher',
                templateUrl: 'views/teacher-signup.html',
                controller: 'userController'
            })

            .state('parent', {
                url: '/parent',
                templateUrl: 'views/parent-signup.html',
                controller: 'userController'
            })
        .state('inform', {
            url: '/inform',
            templateUrl: 'views/informEmail.html',
            controller: 'userController'
        })

        .state('tinyapp', {
            url: '/tiny-app',
            templateUrl: 'views/tinyapp.html',
            controller: 'userController'
        })

        .state('QandA', {
            url: '/question-answer',
            templateUrl: 'views/question-answer.html'
        })
        .state('downloadApp', {
            url: '/download',
            templateUrl: 'views/download.html'
            //controller: 'mainController'
        })

        .state('eng', {
            url: '/eng/about-us',
            templateUrl: 'views/inEnglish.html'
        })

        .state('help', {
            url: '/help',
            templateUrl: 'views/help.html'
        })
        .state('addstudent', {
            url: '/addstudent',
            templateUrl: 'teacher/views/addStudent.html',
            controller: 'teacherController',
            resolve: routePermission.teacher
        })

        .state('home', {
            url: '/home',
            templateUrl: 'common/views/homeview.html',
            resolve: routePermission.user
        })

        .state('messages', {
            url: '/messages',
            templateUrl: 'common/views/messages.html',
            controller: 'sendMessageController',
            resolve: routePermission.user
        })

        .state('calendar', {
            url: '/calendar-events',
            templateUrl: 'calendar/views/calendarEvents.html',
            controller: 'calendarController',
            resolve: routePermission.user
        })

        .state('sendMessage', {
            url: '/sendMessage',
            templateUrl: 'common/views/sendMessage.html',
            controller: 'sendMessageController',
            params: { draftMessage: null, index: -1 },
            resolve: routePermission.user
        })

        .state('createProfile', {
            url: '/createProfile',
            templateUrl: 'parent/views/createProfile.html',
            controller: 'parentController',
            resolve: routePermission.parent
        })

        .state('detail', {
            url: '/createProfile/:id',
            templateUrl: 'parent/views/childProfile.html',
            controller: 'parentController',
            resolve: routePermission.parent
        })

        .state('upload', {
            url: '/upload',
            templateUrl: 'common/views/upload.html',
            controller: 'uploadController'
        })

        .state('profile', {
            url: '/profile/:id',
            templateUrl: 'student/views/profile.html',
            controller: 'teacherController',
            resolve: routePermission.teacher
        })

        .state('resetPassword', {
            url: '/resetPassword/:token',
            templateUrl: 'common/views/resetPassword.html'
        })

        .state('statusreport', {
            url: '/statusReport',
            templateUrl: 'teacher/views/statusReport.html',
            controller: 'statusReportController'
        })

        .state('joinGroup', {
            url: '/join_group',
            templateUrl: 'parent/views/joinGroup.html',
            controller: 'parentController'
        })



    $locationProvider.html5Mode(true);
});

APP.factory('httpRequestInterceptor', function (localStorageService) {
  return {
    request: function (config) {

      config.headers['Authorization'] = 'Bearer ' + localStorageService.get('token');

      return config;
    }
  };
});

APP.config(function($httpProvider){
    $httpProvider.interceptors.push('httpRequestInterceptor');
});

APP.run(function($rootScope, $state, editableOptions) {
    editableOptions.theme = 'bs3';
    $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, rejection) {
        if (rejection === 'not authenticated') {
            $state.go('login');
        } else if (rejection === 'not authorized') {
            $state.go('/');
        }
    });
});