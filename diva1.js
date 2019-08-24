// Puppeteer script for uploading a MODS file ('/home/maguire/z1.mods') into DiVA
//
// G. Q. Maguire Jr.
// 2019.07.20

// https://kth.test.diva-portal.org/dream/add/add1.jsf

const puppeteer = require('puppeteer');
const fs = require('fs');
const config = require('./config.json'); // contains username and password to use

// const delay = ms => new Promise(res => setTimeout(res, ms));

(async() => {
    const cookiesString = fs.readFileSync('./canvas-session.json', 'utf8');
    //console.log("cookiesString are ", cookiesString);
    const cookies = JSON.parse(cookiesString);
    //console.log("cookies are ", cookies);

    process.on('unhandledRejection', (reason, p) => {
	console.error('Unhandled Rejection at: Promise', p, 'reason:', reason);
    });

    const browser = await puppeteer.launch({headless: false,
					    //userDataDir: '/home/maguire/puppeteer/puppeteer_data'
					   });


    const page = await browser.newPage();
    await page.setViewport({
	width: 1280,
	height: 1024,
	deviceScaleFactor: 1,
    });
    
    // the following line makes it possible to see the console in the running browser
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    // execute a commands in the browser - will generate "PAGE LOG: url is about:blank"
    await page.evaluate(() => console.log(`url is ${location.href}`));

    console.info("setting cookies")
    await page.setCookie.apply(page, cookies);

    diva1_url='https://kth.test.diva-portal.org/dream/info.jsf'
    console.log("diva1_url is ", diva1_url);
    await page.goto(diva1_url, {waitUntil: 'load'});
    console.log('FOUND!', page.url());
    // This will produce: FOUND! https://saml-5.sys.kth.se/idp/profile/SAML2/Redirect/SSO?execution=e1s1
    // since the user is not yet logged in
    
    await page.waitForNavigation();

    diva2_url='https://kth.test.diva-portal.org/dream/add/add1.jsf'
    console.log("diva2_url is ", diva2_url);
    await page.goto(diva2_url, {waitUntil: 'load'});
    console.log('FOUND!', page.url());
    // This will produce: https://login.kth.se/login?service=https%3A%2F%2Fsaml-5.sys.kth.se%2Fidp%2FAuthn%2FExtCas%3Fconversation%3De2s1&entityId=https%3A%2F%2Fwww.diva-portal.org%2Fshibboleth
    await page.waitForNavigation();

    // 2nd try
    diva1_url='https://kth.test.diva-portal.org/dream/info.jsf'
    console.log("diva1_url is ", diva1_url);
    await page.goto(diva1_url, {waitUntil: 'load'});
    console.log('FOUND!', page.url());
    // This will produce something line: FOUND! https://saml-5.sys.kth.se/idp/profile/SAML2/Redirect/SSO?SAMLRequest=xxxxxxx
    
    await page.waitForNavigation();

    diva_importlist_url='https://kth.test.diva-portal.org/dream/import/importList.jsf'
    console.log("diva_importlist_url is ", diva_importlist_url);
    await page.goto(diva_importlist_url, {waitUntil: 'load'});
    console.log('FOUND!', page.url());
    //This will produce: FOUND! https://kth.test.diva-portal.org/dream/import/importList.jsf
    // since the user is now logged in
    
    const ib2 = await page.evaluate(() => {
	const ib=document.querySelector(".diva2implistimportbut input").value
	return ib;
    });
    console.info("ib2 is ", ib2);

    const importListButton=".diva2implistimportbut input"; // find the button
    console.log('importListButton is ', importListButton);
    
    await page.evaluate((importListButton) => document.querySelector(importListButton).click(), importListButton); 
    console.log('just after eval of importListButton');

    const typeselect= await page.evaluate(() => {
	const s1=document.querySelector(".diva2implisttype > .diva2implistdrop > select").value
	return s1;
    });
    console.info("typeselect is ", typeselect)
    await page.waitFor(1000)

    // set the import type
    await page.select('.diva2implisttype > .diva2implistdrop > select', 'MODS3');
    await page.reload();
    await page.waitFor(1000)
    //page.waitForNavigation({ waitUntil: 'networkidle0' })
    
    const typeselect2= await page.evaluate(() => {
	const s1=document.querySelector(".diva2implisttype > .diva2implistdrop > select").value
	return s1;
    });
    console.info("typeselect2 is ", typeselect2);
    await page.waitFor(1000)
    
    //find the class="iceInpFile" iframe
    //const iframe= await page.evaluate(() => {
    //	const s1=document.querySelector("iframe.iceInpFile").contentDocument.querySelector("#fileUploadForm input[name=upload]"); 
    //	return s1;
    //});

    const ielementHandle = await page.$('iframe.iceInpFile');
    const iframe = await ielementHandle.contentFrame();
    const fileInput = await iframe.$('#fileUploadForm input[name=upload]');
    await fileInput.uploadFile('/home/maguire/z1.mods');

    // when the upload is successful there will be a message of the form:
    // <div class="diva2implistmessage"><span class="iceOutTxt" id="importListUploadPopupForm:j_id244">File upload successful. To complete the import click on the Import button.</span></div>

    const waitformessage = await page.waitFor('div.diva2implistmessage span.iceOutTxt')
    const message1= await page.evaluate(() => {
	const s1=document.querySelector('div.diva2implistmessage span.iceOutTxt').textContent
	return s1;
    });
    console.info("message1 is ", message1);
    await page.waitFor(1000)


    // alternative to the above is - note that this waits until the text as the expected value
    // await page.waitForXPath("div.diva2implistmessage span.iceOutTxt and contains(., 'File upload successful. To complete the import click on the Import button.')]");

    
    const waitforinputbutton = await page.waitFor('input.diva2impsokbutton');
    console.info("waitforinputbutton is ", waitforinputbutton);
    
    //const focusButton = await page.focus('input.diva2impsokbutton', {delay: 1000});
    const importButton = await page.click('div.diva2implistbuttons div.diva2implistbutton input.diva2impsokbutton', {delay: 1000});
    //await page.$eval('div.diva2implistbuttons div.diva2implistbutton input.diva2impsokbutton', el => {el.focus; el.click()});

    console.info("Just after click of Import");
    page.waitForNavigation({ waitUntil: 'networkidle0' })
    

    var frames = await page.frames();
    console.info("frames is ", frames);
    debugger;

    // const chooseFile="#fileUploadForm"; // find the form
    // const chooisFileForm= await page.evaluate(() => {
    // 	const s1=document.querySelector("iframe.iceInpFile").contentDocument.querySelector("#fileUploadForm").submit();
    // 	return s1;
    // });
    // return;
    // console.info("chooisFileForm is ", chooisFileForm);

    // await page.evaluate((chooseFile) => document.querySelector(chooseFile).submit(), chooseFile); 
    // console.log('just after submit of chooseFile form');


    // diva_add2_url='https://kth.test.diva-portal.org/dream/add/add2.jsf'
    // console.log("diva_add2_url is ", diva_add2_url);
    // await page.goto(diva_add2_url, {waitUntil: 'load'});
    // console.log('FOUND!', page.url());
    
    // await page.waitForNavigation();


    // const token = await page.evaluate(() => {
    // 	const token1=document.querySelector("#edit_bank_form input[name=authenticity_token]").value // output the token just to see it
    // 	return token1;
    // });
    // console.info("token", token);

    // const title="A new and interesting question bank"
    // await page.$eval('#edit_bank_form #assessment_question_bank_title', (el, _title) => el.value = _title, title); // output the token just to see it

    // const f1 = await page.$eval('form#edit_bank_form', form => form.submit());
    // page.waitFor(3000);
    // console.info("f1", f1);


    await page.screenshot({path: 'diva1.png'});

    // Extract the results from the page
    // const links = await page.evaluate(() => {
    // 	let questionBanks = [];	// this will collect the question bank informatio

    // 	const anchors = Array.from(document.querySelectorAll('.question_bank'));
    // 	anchors.forEach(function(anchor) {
    // 	    let jsonObject = {
    // 		id: anchor.id,
    // 		title: anchor.querySelector('.title').text,
    // 		href: anchor.querySelector('.title').href,
    //         };
    //         questionBanks.push(jsonObject);
    // 	});

    // 	return questionBanks;
    // 	//return anchors.map(anchor => anchor.id+','+anchor.querySelector('.title').href+','+anchor.querySelector('.title').text); // textContent
    // });
    // //console.log(links.join('\n'));

    // fs.writeFile('results5.json', JSON.stringify(links), function(err) {
    //     if (err) throw err;
    //     console.log('completed writing JSON information about question banks');
    // });

    //browser.close();

})();
