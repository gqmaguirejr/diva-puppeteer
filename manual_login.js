const puppeteer = require('puppeteer');
const fs = require('fs');
const config = require('./config.json'); // contains username and password to use

//const login_url='http://'+config.canvas.host+'/login/canvas';
const login_url='https://kth.test.diva-portal.org/dream/info.jsf';
console.info("login_url is ", login_url);


(async() => {
    const browser = await puppeteer.launch({headless: false, userDataDir: './puppeteer_data' });
    const page = await browser.newPage();
    await page.setViewport({
	width: 1280,
	height: 1024,
	deviceScaleFactor: 1,
    });
    await page.goto(login_url, {waitUntil: 'load'});
    console.log(page.url());

    // wait for the user to fill in the login form
    await page.waitForNavigation();

    const cookies = await page.cookies()
    //console.info("cookies are ", cookies);

    fs.writeFile('canvas-session.json', JSON.stringify(cookies, null, 2), function(err) {
        if (err) throw err;
        console.log('completed write of cookies');
    });

    browser.close();

})();
