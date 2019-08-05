// Puppeteer script for extracting the KTH organization for authors/supervisors/examiners
//
// G. Q. Maguire Jr.
// 2019.07.31

// https://kth.test.diva-portal.org/dream/add/add1.jsf

const puppeteer = require('puppeteer');
const fs = require('fs');
const config = require('./config.json'); // contains username and password to use
const os = require('os');

// const file_name = process.argv[2];
// if (!file_name) {
//     throw "Please provide a JSON with information about the output file to use as the first argument";
// }
// console.log("file_name is ", file_name);

// Viewport && Window size
const width = 1280
const height = 900

// const delay = ms => new Promise(res => setTimeout(res, ms));


// KTH organisationPopupForm:tree:n-root:j_id198

async function forwardAndBackwardButtons(page) {
    // Back Cancel/Save Draft and Continue buttons
    // in div class='diva2addtextbotmargin'
    // <div class="diva2addtextareatop"><div class="diva2backfortop">

    let heading_cmds;
    let heading_ids;
    let heading_types;
    let heading_values;
    
    // This area also has three buttons
    heading_cmds = await page.$$eval('div.diva2backfortop a', nodes => nodes.map(n => n.textContent));
    heading_ids = await page.$$eval('div.diva2backfortop a', nodes => nodes.map(n => n.getAttribute('id')));

    console.info("buttons at the top of the page"," heading_cmds: ", heading_cmds, " heading_ids: ", heading_ids);
    return {heading_cmds, heading_ids};
}

// Use explicit selectors built from the id
function make_selector_from_id(id) {
    return '[id="'+id + '"]';
}

// The "^" before the equal sign make this do a prefix match against the string
function make_prefix_selector_from_id(id) {
    return '[id^="'+id + '"]';
}


function clean_name(name) {
    if (name.endsWith(':*')) {
	return name.slice(0, -2); // remove the trailing colon and asterisk - the asterisk was used to visually indicate the field is required
    } else if (name.endsWith('*')) {
	return name.slice(0, -1); // remove the trailing asterisk
    } else if (name.endsWith(':')) {
	return name.slice(0, -1); // remove the trailing colon
    } else {
	return name
    }
}

function lookup_button(buttonVector, buttonLabel) {
    for (let i = 0; i < buttonVector.length; i += 1) {
        if (buttonVector[i].singleButton_value.includes(buttonLabel)) {
	    //return buttonVector[i].singleButton_id.replace(/:/g,'\\\\:'); // to escape the colons in the id string
	    return buttonVector[i].singleButton_id;
	}
    }
}

function lookup_textAreaHandle(textareaHandles, areaNames, areaLabel) {
    for (let i = 0; i < textareaHandles.length; i += 1) {
        if (areaNames[i].includes(areaLabel)) {
	    return textareaHandles[i];
	}
    }
}

async function getTextAreaHandles(page) {
    let textareaHandles;
    textareaHandles = await page.$$('div.diva2addtextarea');

    //console.info("in getTextAreaHandles about to return ", textareaHandles)
    return textareaHandles;
}

// Each of the different sets of fields on the page '/dream/add/add2.jsf' page is in a textarea
async function getTextAreaContent(page) {
    let textareaHandles;
    textareaHandles = await page.$$('div.diva2addtextarea');
    // console.info("in getTextAreaContent handles are ", textareaHandles)

    let text_arr;
    // loop thru all handles
    text_arr = [];
    for(const textareaHandle of textareaHandles){
	// pass the single handle below
	const singleTextArea = await page.evaluate(el => el.querySelector('div.diva2addtextchoice2').textContent, textareaHandle);
	//console.info("singleTextArea is ", singleTextArea);
	text_arr.push(singleTextArea);
    }

    return text_arr;
}

async function getTextAreaBlanksAuthor(page) {
    let field_arr;
    let nameOfNextField;
    let fields;			// this will be a dict of the field names and a dict of their IDs and types
    let areas_fields;			// this will be a dict of the field names and a dict of their IDs and types
    let textareaHandles;
    
    field_arr = [];
    fields={};
    
    console.info('Handling case for Author');

    // get all the textarea handles
    textareaHandles = await page.$$('div.diva2addtextarea');

    // loop thru all handles
    for(const textareaHandle of textareaHandles){
	let nameOfTextArea='';
	let nameOfTextField=await page.evaluate(el => el.querySelector('div.diva2addtextchoice2').textContent, textareaHandle);
	
	nameOfTextField=nameOfTextField.trim()
	if (nameOfTextField.startsWith('Author')) {
	    // pass the single handle below
	    const divs = await textareaHandle.$$('fieldset > div');
	    console.info("divs length is ", divs.length);
	    for (let i = 0; i < divs.length; i++) {
		let textDiv='';
		let iId='';
		let iType='';
		let iValue='';
		let dClass='';
		let dText='';
		console.info("iteration ", i);

		className = await divs[i]._remoteObject.description;
		console.info("className is ", className);

		// case for an Author
		if (i == 0 && className === 'div.diva2addtextchoicebr') {
		    // scalar version:
		    //   dText = await page.evaluate(element => element.textContent, divs[i]);
		    // vector version:
		    textDiv = await divs[i].$$eval('div.diva2addtextchoice2', nodes => nodes.map(n => n.textContent));
		    console.info("textDiv is ", textDiv, " and should be the same as the area name:", nameOfTextField);

		    // This area has three buttons: 'Connect authority record »', 'Get saved personal data »', and 'Save personal data »'
		    iId = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
		    iType = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
		    iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));

		    console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
		    field_arr.push({nameOfTextField, className, textDiv, iId, iType, iValue})
		    for (let m = 0; m < iId.length; m++) {
			fields[clean_name(iValue[m])]={ID: iId[m], Type: iType[m]};
		    }
		}
		if (i == 1 && className === 'div.diva2addtextplus5') { // "Last name:*" & "Academic title:"
		    textDiv = await divs[i].$$eval('.diva2addtextchoicecolbr', nodes => nodes.map(i => i.textContent));
		    console.info("textDiv is ", textDiv);

		    iId    = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
		    iType  = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
		    iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));

		    console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
		    field_arr.push({nameOfTextField, className, textDiv, iId, iType, iValue})
		    for (let m = 0; m < iId.length; m++) {
			fields[clean_name(textDiv[m])]={ID: iId[m], Type: iType[m]};
		    }
		}
		if (i == 2 && className === 'div.diva2addtextplusname') { // 'First name'
		    textDiv = await divs[i].$$eval('.diva2addtextchoicecolbr', nodes => nodes.map(i => i.textContent));
		    console.info("textDiv is ", textDiv);

		    iId    = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
		    iType  = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
		    iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));

		    console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
		    field_arr.push({nameOfTextField, className, textDiv, iId, iType, iValue})
		    for (let m = 0; m < iId.length; m++) {
			fields[clean_name(textDiv[m])]={ID: iId[m], Type: iType[m]};
		    }
		}

		if (i == 3 && className === 'div.diva2addtextplusid') { // 'Local User Id:'
		    textDiv = await divs[i].$$eval('div.diva2addtextchoicecolbr', nodes => nodes.map(i => i.textContent));
		    console.info("textDiv is ", textDiv);

		    iId    = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
		    iType  = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
		    iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));

		    console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
		    field_arr.push({nameOfTextField, className, textDiv, iId, iType, iValue})
		    for (let m = 0; m < iId.length; m++) {
			fields[clean_name(textDiv[m])]={ID: iId[m], Type: iType[m]};
		    }
		}

		if (i == 4 && className === 'div.diva2addtextchoicecol') { // Department, unit or programme:
		    dText = await page.evaluate(element => element.textContent, divs[i]);
		    console.info("dText is ", dText);

		    if (dText.includes('Department, unit or programme')) {
			nameOfNextField=dText; // remember this name since it will be needed later
			console.info("nameOfNextField is ", nameOfNextField);
		    }
		}

		if (i == 5 && className.endsWith('icePnlGrp')) {
		    textDiv = await divs[i].$$eval('div.diva2addtextchoicecol', nodes => nodes.map(i => i.textContent));
		    console.info("textDiv is ", textDiv);

		    iId    = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
		    iType  = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
		    iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));

		    console.info("about to push nameOfNextField", nameOfNextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
		    field_arr.push({nameOfNextField, className, textDiv, iId, iType, iValue})
		    // note that a click on this field invokes: moveOrganisationPopupIntoView();iceSubmit(form,this,event)
		    for (let m = 0; m < iId.length; m++) {
			fields[clean_name(iValue[m])]={ID: iId[m], Type: iType[m]};
		    }
		}

		
		if (i ==6 && className.endsWith('icePnlSrs')) {
		    // noting to do here - until a selection is made for the previous; then the selected organization will appear in this field
		}

		if (i == 7 && className === 'div.diva2addtextchoicecol') { // 'Research group'
		    dText = await page.evaluate(element => element.textContent, divs[i]);
		    console.info("dText is ", dText);

		    if (dText.includes('Research group')) {
			nameOfNextField='Research group'; // remember this name since it will be needed later
			console.info("nameOfNextField is ", nameOfNextField);
		    }
		}

		if (i == 8 && className === 'div.diva2addtextchoicebox') {
		    textDiv = await divs[i].$$eval('div.diva2addtextchoicecol', nodes => nodes.map(i => i.textContent));
		    console.info("textDiv is ", textDiv);

		    iId    = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
		    iType  = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
		    iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));

		    console.info("about to push nameOfNextField", nameOfNextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
		    field_arr.push({nameOfNextField, className, textDiv, iId, iType, iValue})
		    for (let m = 0; m < iId.length; m++) {
			fields[clean_name(nameOfNextField)]={ID: iId[m], Type: iType[m]};
		    }
		    fields[clean_name(nameOfNextField)]={ID: iId[0], Type: iType[0]};

		}

		if (i == 9 && className === 'div.diva2addtextchoicecol') { // 'E-mail'
		    dText = await page.evaluate(element => element.textContent, divs[i]);
		    console.info("dText is ", dText);

		    if (dText.includes('E-mail')) {
			nameOfNextField='E-mail'; // remember this name since it will be needed later
			console.info("nameOfNextField is ", nameOfNextField);
		    }
		}

		if (i == 10 && className === 'div.diva2addtextchoicebox') {
		    textDiv = await divs[i].$$eval('div.diva2addtextchoicecol', nodes => nodes.map(i => i.textContent));
		    console.info("textDiv is ", textDiv);

		    iId    = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
		    iType  = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
		    iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));

		    console.info("about to push nameOfNextField", nameOfNextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
		    field_arr.push({nameOfNextField, className, textDiv, iId, iType, iValue})
		    for (let m = 0; m < iId.length; m++) {
			fields[clean_name(nameOfNextField)]={ID: iId[m], Type: iType[m]};
		    }
		    fields[clean_name(nameOfNextField)]={ID: iId[0], Type: iType[0]};
		}

		if (i == 11 && className === 'div.diva2addtextchoicecol') { // 'Other organisationl'
		    dText = await page.evaluate(element => element.textContent, divs[i]);
		    console.info("dText is ", dText);

		    if (dText.includes('Other organisation')) {
			nameOfNextField='Other organisation'; // remember this name since it will be needed later
			console.info("nameOfNextField is ", nameOfNextField);
		    }
		}

		if (i == 12 && className === 'div.diva2addtextchoicebox') {
		    textDiv = await divs[i].$$eval('div.diva2addtextchoicecol', nodes => nodes.map(i => i.textContent));
		    console.info("textDiv is ", textDiv);

		    iId    = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
		    iType  = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
		    iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));

		    console.info("about to push nameOfNextField", nameOfNextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
		    field_arr.push({nameOfNextField, className, textDiv, iId, iType, iValue})
		    for (let m = 0; m < iId.length; m++) {
			fields[clean_name(nameOfNextField)]={ID: iId[m], Type: iType[m]};
		    }
		    fields[clean_name(nameOfNextField)]={ID: iId[0], Type: iType[0]};

		    nameOfNextField=''; // no longer valid
		}
		// Ignore the remaining fields
	    }
	    console.info("in ", nameOfTextField, "fields are:", fields );
	    return fields;
	}
    }
}



async function makeOrganizationSelection(page, blanks, textAreaName) {
    //
    // The organisationPopupForm:tree is dynamically loaded and only the part that you have visible
    // can be selected from.
    // Accessing selectors of the form '[id="organisationPopupForm:tree-d-9"] a'
    // access the "+" GIF and make this part of the tree visible. [Note the "d" in the name.]
    // To access the actual organization entry, use a selector that has ":n" in it rather than a "d".
    //
    // For example:
    // the + for ICT is at '[id="organisationPopupForm:tree-d-9"] a'
    // the + for COS is at '[id="organisationPopupForm:tree-d-9-1"] a'
    // ICT/COSRSlab  is at '[id^="organisationPopupForm:tree:n-9-1-3"] a'
    // await page.click('[id="organisationPopupForm:tree-d-9"] a'); // ICT
    // await page.waitFor(1000);
    // await page.click('[id="organisationPopupForm:tree-d-9-1"] a'); // COS
    // await page.waitFor(1000);
    // await page.click('[id^="organisationPopupForm:tree-d-9-1-3"] a'); // ICT/COS/RSlab

    selector=make_selector_from_id(blanks[textAreaName]['Choose organisation »'].ID);
    await page.click(selector);
    // wait for the form to the popup to appear
    //selector=make_prefix_selector_from_id('organisationPopupForm:tree:n-root');
    selector=make_prefix_selector_from_id('organisationPopupForm:tree-d-root');
    await page.waitFor(3000);
    await page.waitFor(selector);


    // look for organization addrsses in the thesis_info strucuture
    // Consider the case:
    // "Author1":{
    //  "Last name": "Maguire Jr.",
    //	"First name": "Gerald Q.",
    //	"Local User Id": "u1d13i2c",
    //	"Research group": "CCS",
    //	"E-mail": "maguire@kth.se",
    //	"organisation": {"L1": "School of Information and Communication Technology (ICT)",
    //			 "L2": "Communication Systems, CoS",
    //			 "L3": "Radio Systems Laboratory (RS Lab)"}
    //    },

    let tmp;			// the base of the ID to be used

    // the organization information from the kth_org structure
    let org1=null;		// for L1
    let org2=null;		// for L2
    let org3=null;		// for L3

    let index1=null;
    let index2=null;
    let index3=null;
    
    let selector1=null;
    let selector2=null;
    let selector3=null;
    
    if (thesis_info[textAreaName]['organisation'].hasOwnProperty('L1')) {
	org1=thesis_info[textAreaName]['organisation']['L1'];
	index1=kth_org[org1]['ID'];
	console.info("org1 is ", org1, "index1 is", index1);

	if (thesis_info[textAreaName]['organisation'].hasOwnProperty('L2')) {
	    org2=thesis_info[textAreaName]['organisation']['L2'];
	    index2=kth_org[org1][org2]['ID'];
	    console.info("org2 is ", org2, "index2 is", index2);

	    if (thesis_info[textAreaName]['organisation'].hasOwnProperty('L3')) {
		org3=thesis_info[textAreaName]['organisation']['L3'];
		index3=kth_org[org1][org2][org3]['ID'];
		console.info("org3 is ", org3, "index3 is", index3);
	    }
	}
    }

    // look at the case of L1
    // if (index1 && !index2) {
    // 	try {
    // 	    selector=make_prefix_selector_from_id('organisationPopupForm:tree-d-root-c');
    // 	    await page.waitForSelector(selector, { timeout: 100 })
    // 	    selector1=make_prefix_selector_from_id('organisationPopupForm:tree:n-'+index1)+' a';
    // 	    await page.click(selector1);
    // 	} catch (error) {
    // 	    console.log("selector not visible")
    // 	    selector1=make_prefix_selector_from_id('organisationPopupForm:tree-d-root')+' a';
    // 	    await page.click(selector1);
    // 	    selector1=make_prefix_selector_from_id('organisationPopupForm:tree:n-'+index1)+' a';
    // 	    await page.click(selector1);
    // 	}
    // }
    
    // for L1 and L2
    try {
	selector=make_selector_from_id('organisationPopupForm:tree-d-root-c');
 	console.log("selector is ", selector);
 	await page.waitForSelector(selector, { timeout: 100 })
    } catch (error) {
 	console.log("selector not visible: A");
	selector=make_selector_from_id('organisationPopupForm:tree:n-root');
 	console.log("selector is ", selector);
 	await page.click(selector);
    }
    

    selector=make_selector_from_id('organisationPopupForm:tree-d-root-c');
    console.log("selector is ", selector);
    await page.waitForSelector(selector, { timeout: 100 })

    if (index1 && !index2) {
	selector1=make_prefix_selector_from_id('organisationPopupForm:tree:n-'+index1)+' a';
 	console.log("selector1 is ", selector1);
	await page.click(selector1);
	console.info("selected the school");
	return;
    }

    try {
	selector=make_selector_from_id('organisationPopupForm:tree-d-'+index1+'-c');
	console.log("selector is ", selector)
	await page.waitForSelector(selector, { timeout: 1000 });
    } catch (error) {
	selector=make_selector_from_id('organisationPopupForm:tree-d-'+index1)+' a';
	console.log("selector is ", selector);
	await page.click(selector);
    }

    selector=make_selector_from_id('organisationPopupForm:tree-d-'+index1+'-c');
    console.log("selector is ", selector)
    await page.waitForSelector(selector, { timeout: 1000 })

    if (index1 && index2 && !index3) {
	selector1=make_prefix_selector_from_id('organisationPopupForm:tree:n-'+index2)+' a';
 	console.log("selector1 is ", selector1);
	await page.click(selector1);
	console.info("selected the department");
	return;
    }

    try {
	selector=make_selector_from_id('organisationPopupForm:tree-d-'+index2+'-c');
 	console.log("selector is ", selector);
 	await page.waitForSelector(selector, { timeout: 1000 })
    } catch (error) {
	selector=make_selector_from_id('organisationPopupForm:tree-d-'+index2)+' a';
 	console.log("selector is ", selector);
 	await page.click(selector);
    }

    selector=make_selector_from_id('organisationPopupForm:tree-d-'+index2+'-c');
    await page.waitForSelector(selector, { timeout: 1000 });

    selector1=make_prefix_selector_from_id('organisationPopupForm:tree:n-'+index3)+' a';
    console.log("selector1 is ", selector1);
    await page.click(selector1);
    console.info("selected the division");
    return;
}

async function extractOrganizationInformation(page, blanks) {
    //
    // The organisationPopupForm:tree is dynamically loaded and only the part that you have visible
    // can be selected from.
    // Accessing selectors of the form '[id="organisationPopupForm:tree-d-9"] a'
    // access the "+" GIF and make this part of the tree visible. [Note the "d" in the name.]
    // To access the actual organization entry, use a selector that has ":n" in it rather than a "d".
    //
    // For example:
    // the + for ICT is at '[id="organisationPopupForm:tree-d-9"] a'
    // the + for COS is at '[id="organisationPopupForm:tree-d-9-1"] a'
    // ICT/COSRSlab  is at '[id^="organisationPopupForm:tree:n-9-1-3"] a'
    // await page.click('[id="organisationPopupForm:tree-d-9"] a'); // ICT
    // await page.waitFor(1000);
    // await page.click('[id="organisationPopupForm:tree-d-9-1"] a'); // COS
    // await page.waitFor(1000);
    // await page.click('[id^="organisationPopupForm:tree-d-9-1-3"] a'); // ICT/COS/RSlab

    let selector;
    
    selector=make_selector_from_id(blanks['Author']['Choose organisation »'].ID);
    await page.click(selector);
    // wait for the form to the popup to appear
    //selector=make_prefix_selector_from_id('organisationPopupForm:tree:n-root');
    selector=make_prefix_selector_from_id('organisationPopupForm:tree-d-root');
    await page.waitFor(3000);
    await page.waitFor(selector);

    let kth_org={};
    let dPrefix;		// prefix of the displayed tree
    let tmp;			// the base of the ID to be used

    // the organization information from the kth_org structure
    let org1=null;		// for L1
    let org2=null;		// for L2
    let org3=null;		// for L3

    let index1=null;
    let index2=null;
    let index3=null;
    
    let selector1=null;
    let selector2=null;
    let selector3=null;

    let divs;
    let iIDs;
    let textDiv;

    let divs1;
    let iIDs1;
    let textDiv1;

    let divs2;
    let iIDs2;
    let textDiv2;

    let already_clicked={};
    
    // organisationPopupForm:tree-d-root-c has the list of entries for the schools
    selector=make_selector_from_id('organisationPopupForm:tree-d-root-c');
    console.log("selector is ", selector);
    await page.waitForSelector(selector, { timeout: 100 })
    
    selector=selector+' div.iceTreeRow'
    divs = await page.$$(selector);
    console.log("divs length is ", divs.length);

    iIDs = await page.$$eval(selector, nodes => nodes.map(n => n.getAttribute('id')));
    textDiv = await page.$$eval(selector, nodes => nodes.map(i => i.textContent));
    console.log("iIDs are ", iIDs, "textDiv are ", textDiv);

    dPrefix='organisationPopupForm:tree-d-';

    // iterate throught the schools
    for (let i = 0; i < divs.length; i++) {
	let img_src;
	
	console.log("i is ", i);
	org1=textDiv[i].trim();
	index1=iIDs[i].slice(dPrefix.length);
	console.info("org1 is ", org1, "index1 is", index1);
	kth_org[org1]={};
	kth_org[org1]['ID']=index1;

	// create a selector to access the "+" entry to open the next level of the tree 
	selector1=make_selector_from_id(iIDs[i]);
	console.log("selector1 for School ", org1, " is ", selector1);
	img_src = await page.$$eval(selector1+' > a  img', nodes => nodes.map(n => n.getAttribute('src')));
	console.info("img_src is ", img_src);

	// if there is a "+" click on it to open
	if ((img_src[0] == '../css/icefaces/css-images/tree_nav_top_open.gif') ||
	    (img_src[0] == '../css/icefaces/css-images/tree_nav_top_open_no_siblings.gif') ||
	    (img_src[0] == '../css/icefaces/css-images/tree_nav_middle_open.gif') || 
	    (img_src[0] == '../css/icefaces/css-images/tree_nav_bottom_open.gif')) {
	    await page.click(selector1+' > a');
	    await page.waitFor(1000); // wait for the departments to appear

	    try {
		selector0='organisationPopupForm:tree-d-'+i+'-c'; // entries for the departments in a school
		console.log("selector0 is ", selector0);
		await page.waitForSelector(make_selector_from_id(selector0), { timeout: 1000 })

		selector0=make_selector_from_id(selector0)+' div.iceTreeRow';
		console.log("selector0-prime is ", selector0);
		divs1 = await page.$$(selector0);
		console.log("divs1 length is ", divs1.length);
		console.log("divs1 is ", divs1);
		iIDs1 = await page.$$eval(selector0, nodes => nodes.map(n => n.getAttribute('id')));
		textDiv1 = await page.$$eval(selector0, nodes => nodes.map(i => i.textContent));
		console.log("iIDs1 are ", iIDs1, "textDiv1 are ", textDiv1);

		// iterate throught the departments of the school
		for (let j = 0; j < divs1.length; j++) {
		    let img_src;
		    console.log("j is ", j);

		    org2=textDiv1[j].trim();
		    console.info("Department is ", org2);
		    index2=iIDs1[j].slice(dPrefix.length).split(':')[0]; // as the Nordic Institute for Theoretical Physics NORDITA index2 is 0-0:j_id202 -- rmove the trailing ":j_id202"
		    console.info("org2 is ", org2, "index2 is", index2);
		    kth_org[org1][org2]={};
		    kth_org[org1][org2]['ID']=index2;

		    //selector2=make_selector_from_id(iIDs1[j])+' a';
		    //console.log("selector2 is ", selector2);
		    //await page.click(selector2);
		    console.info("ID is ", iIDs1[j]);

		    selector2=make_selector_from_id(iIDs1[j]);
		    console.log("selector2 is ", selector2);
		    innerText = await page.$$eval(selector2, nodes => nodes.map(n => n.textContent));
		    localIDs = await page.$$eval(selector2, nodes => nodes.map(n => n.getAttribute('id')));
		    img_src = await page.$$eval(selector2+' > a  img', nodes => nodes.map(n => n.getAttribute('src')));
		    console.info("img_src is ", img_src, "innerText is", innerText, "localIDs", localIDs);

		    // if there is a "+" click on it to open
		    if ((img_src[0] == '../css/icefaces/css-images/tree_nav_top_open.gif') ||
			(img_src[0] == '../css/icefaces/css-images/tree_nav_top_open_no_siblings.gif') ||
			(img_src[0] == '../css/icefaces/css-images/tree_nav_middle_open.gif') || 
			(img_src[0] == '../css/icefaces/css-images/tree_nav_bottom_open.gif')) {
			await page.click(selector2+' > a');
			await page.waitFor(1000); // wait for the divisions to appear

			// look for divison information
			try {
			    division_selector0='organisationPopupForm:tree-d-'+i+'-'+j+'-c';
			    console.log("division_selector0 is ", division_selector0);
			    await page.waitForSelector(make_selector_from_id(division_selector0), { timeout: 1000 })

			    selector0=make_selector_from_id(division_selector0)+' div.iceTreeRow';
			    console.log("selector0-prime is ", selector0);
			    divs2 = await page.$$(selector0);
			    console.log("divs2 length is ", divs2.length);
			    console.log("divs2 is ", divs2);
			    iIDs2 = await page.$$eval(selector0, nodes => nodes.map(n => n.getAttribute('id')));
			    textDiv2 = await page.$$eval(selector0, nodes => nodes.map(i => i.textContent));
			    console.log("iIDs2 are ", iIDs2, "textDiv2 are ", textDiv2);

			    for (let k = 0; k < divs2.length; k++) {
				console.log("k is ", k);
				
				org3=textDiv2[k].trim();
				index3=iIDs2[k].slice(dPrefix.length).split(':')[0]; // as the Nordic Institute for Theoretical Physics NORDITA index2 is 0-0:j_id202 -- rmove the trailing ":j_id202"
				console.info("org3 is ", org3, "index3 is", index3);
				kth_org[org1][org2][org3]={}; 
				kth_org[org1][org2][org3]['ID']=index3;
			    }
			} catch (error) {
			    console.info("no subtree for division: ", selector0);
			}
		    }
		}
	    } catch (error) {
		console.info("no subtree for department");
	    }
	}
    }
    console.info("kth_org is ", kth_org);
    return kth_org;
    
}



//////////////////////////////////////////////////////////////////////

(async() => {

    const host_name=config.diva.host
    let status;
    let selector;

    process.on('unhandledRejection', (reason, p) => {
	console.error('Unhandled Rejection at: Promise', p, 'reason:', reason);
    });

    const browser = await puppeteer.launch({headless: false,
					    //slowMo: 50,
					    //userDataDir: '/home/maguire/puppeteer/puppeteer_data'
					    args: [
						`--window-size=${ width },${ height }`
					    ],
					   }
					  );

    const page = await browser.newPage();
    await page.setViewport({
	width: 1280,
	height: 800,
	deviceScaleFactor: 1,
    });
    
    // the following line makes it possible to see the console in the running browser
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    // execute a commands in the browser - will generate "PAGE LOG: url is about:blank"
    await page.evaluate(() => console.log(`url is ${location.href}`));

    await page.setRequestInterception(true);
    page.on("request", request => {
	const url = request.url();
	console.log("request url:", url);
	request.continue();
    });
    page.on("requestfailed", request => {
	const url = request.url();
	console.log("request failed url:", url);
    });
    page.on("response", response => {
	const request = response.request();
	const url = request.url();
	const status = response.status();
	console.log("response url:", url, "status:", status);
    });


    //diva1_url='http://'+host_name+'/dream/info.jsf'
    diva1_url='http://'+host_name+'/dream/add/add1.jsf'
    console.log("diva1_url is ", diva1_url);
    await page.goto(diva1_url, {waitUntil: 'load'});
    console.log('FOUND!', page.url());
    // This will produce: FOUND! https://saml-5.sys.kth.se/idp/profile/SAML2/Redirect/SSO?execution=e1s1
    // since the user is not yet logged in
    
    await page.waitForNavigation();

    diva2_url='http://'+host_name+'/dream/add/add1.jsf'
    console.log("diva2_url is ", diva2_url);
    await page.goto(diva2_url, {waitUntil: 'load'});
    console.log('FOUND!', page.url());
    // This will produce: https://login.kth.se/login?service=https%3A%2F%2Fsaml-5.sys.kth.se%2Fidp%2FAuthn%2FExtCas%3Fconversation%3De2s1&entityId=https%3A%2F%2Fwww.diva-portal.org%2Fshibboleth
    if (await page.url().includes('https://login.kth.se/login')) {
	await page.focus('#username');
	await page.type('#username', config.diva.username);
	await page.focus('#password');
    }
    await page.waitForNavigation();

    // 2nd try
    //diva1_url='http://'+host_name+'/dream/info.jsf'
    diva1_url='http://'+host_name+'/dream/add/add1.jsf'
    console.log("diva1_url is ", diva1_url);
    await page.goto(diva1_url, {waitUntil: 'load'});
    console.log('FOUND!', page.url());
    // This will produce something line: FOUND! https://saml-5.sys.kth.se/idp/profile/SAML2/Redirect/SSO?SAMLRequest=xxxxxxx
    
    await page.waitForNavigation();

    // go to the page to add a publication
    diva_add_url='http://'+host_name+'/dream/add/add1.jsf'
    console.log("diva_add_url is ", diva_add_url);
    await page.goto(diva_add_url, {waitUntil: 'load'});
    console.log('FOUND!', page.url());
    //This will produce: FOUND! https://kth.test.diva-portal.org/dream/add/add1.jsf
    // since the user is now logged in

    // the page has on it:
    // <div class="diva2addtextplus">
    // <fieldset class="diva2addborder">
    // <div class="diva2addlistdown2">
    // <select class="iceSelOneMnu" id="j_id15:publicationType" name="j_id15:publicationType" onblur="setFocus('');" onchange="setFocus('');iceSubmitPartial(form, this, event);" onfocus="setFocus(this.id);" size="1" tabindex="1"><option value="article">Article in journal</option>
    // <option value="bookReview">Article, book review</option>
    // <option value="review">Article, review/survey</option>
    // <option value="artisticOutput">Artistic output</option>
    // <option value="book">Book</option>
    // <option value="chapter">Chapter in book</option>
    // <option value="collection">Collection (editor)</option>
    // <option value="conferencePaper">Conference paper</option>
    // <option value="conferenceProceedings">Conference proceedings (editor)</option>
    // <option value="dataset">Data set</option>
    // <option value="comprehensiveDoctoralThesis">Doctoral thesis, comprehensive summary</option>
    // <option value="monographDoctoralThesis">Doctoral thesis, monograph</option>
    // <option value="comprehensiveLicentiateThesis">Licentiate thesis, comprehensive summary</option>
    // <option value="monographLicentiateThesis">Licentiate thesis, monograph</option>
    // <option value="manuscript">Manuscript (preprint)</option>
    // <option value="other">Other</option>
    // <option value="patent">Patent</option>
    // <option value="report">Report</option>
    // <option value="studentThesis">Student thesis</option></select></div></fieldset></div>
    

    // <select class="iceSelOneMnu" id="j_id15:publicationType" name="j_id15:publicationType" onblur="setFocus('');" onchange="setF
    let pubtype;
    pubtype = await page.evaluate(() => {
	const t1=document.querySelector("div.diva2addtextplus div.diva2addlistdown2 select.iceSelOneMnu").value
	return t1;
    });
    console.info("pubtype is ", pubtype);

    // set the type of document
    await page.select('div.diva2addtextplus div.diva2addlistdown2 select.iceSelOneMnu', 'studentThesis');
    await page.reload();
    await page.waitFor(1000);
    //page.waitForNavigation({ waitUntil: 'networkidle0' })
    
    pubtype = await page.evaluate(() => {
	const t1=document.querySelector("div.diva2addtextplus div.diva2addlistdown2 select.iceSelOneMnu").value
	return t1;
    });
    console.info("pubtype is now ", pubtype);
    await page.waitFor(1000);

    //The page also has a continue button
    // <div class="diva2backfor">
    // <div>
    // <fieldset class="diva2addborder">
    // <div class="icePnlGrp diva2arrowback" id="j_id15:j_id158"><a class="iceCmdLnk diva2linkback" href="javascript:;" id="j_id15:j_id159" onblur="setFocus('');" onclick="var form=formOf(this);form['j_id15:_idcl'].value='j_id15:j_id159';return iceSubmit(form,this,event);" onfocus="setFocus(this.id);">Back</a></div>
    // <div class="icePnlGrp diva2end" id="j_id15:j_id160"><a class="iceCmdLnk diva2linksave" href="javascript:;" id="j_id15:j_id161" onblur="setFocus('');" onclick="var form=formOf(this);form['j_id15:_idcl'].value='j_id15:j_id161';return iceSubmit(form,this,event);" onfocus="setFocus(this.id);">Cancel</a></div>
    // <div class="icePnlGrp diva2arrowforadd" id="j_id15:j_id162">
    // <a class="iceCmdLnk diva2linkfor" href="javascript:;" id="j_id15:j_id163" onblur="setFocus('');" onclick="var form=formOf(this);form['j_id15:_idcl'].value='j_id15:j_id163';return iceSubmit(form,this,event);" onfocus="setFocus(this.id);">Continue</a></div></fieldset></div></div>

    const continue_from_add1 = await page.click('div.diva2backfor fieldset.diva2addborder a.diva2linkfor', {delay: 1000});
    //await page.$eval('div.diva2implistbuttons div.diva2implistbutton input.diva2impsokbutton', el => {el.focus; el.click()});

    console.info("Just after click of Continue");
    await page.waitFor(1000);
    
    const waitforadd2 = await page.waitFor('div.diva2addtextplusname')
    console.log('FOUND after Continue!', page.url());

    // Lastname field:
    //	<div class="diva2addtextplus5">
    //    <div class="diva2addtextplusname">
    //	    <div class="diva2addtextchoicecolbr">Last name:<span class="iceOutTxt diva2asterisk" id="addForm:authorSerie:0:j_id697">*</span></div>
    //	    <div class="diva2addtextchoicebox">
    //	      <input class="iceInpTxt" id="addForm:authorSerie:0:autFamily" name="addForm:authorSerie:0:autFamily" onblur="setFocus('');" onfocus="setFocus(this.id);" onkeypress="iceSubmit(form,this,event);" onmousedown="this.focus();" size="35" type="text"></div></div>
    await page.waitFor(1000);

   
    let blanks={};
    blanks['Author'] = await getTextAreaBlanksAuthor(page);
    // console.info("blanks are ", blanks);

    for(var key in blanks) {
	var value = blanks[key];
	console.info("blanks[", key, "] is ", value);
    }

    let kth_org;
    kth_org=await extractOrganizationInformation(page, blanks);

    // extract the organization info:
    // Author information


    // Save the data about where things are in this instance of DiVA
    let collected_data;
    var current_date = new Date();
    var isWin = (os.platform() === 'win32');
    if (isWin) {
	output_file_name='org-data-'+current_date.toISOString().slice(0,10)+'.json';
	collected_data={'blanks': blanks, 'kth_org': kth_org};
	fs.writeFile(output_file_name, JSON.stringify(collected_data), function(err) {
            if (err) throw err;
            console.log('completed writing JSON information about DiVA');
	});
    } else [
	output_file_name='org-data-'+current_date.toISOString()+'.json';
	collected_data={'blanks': blanks, 'kth_org': kth_org};
	fs.writeFile(output_file_name, JSON.stringify(collected_data), function(err) {
            if (err) throw err;
            console.log('completed writing JSON information about DiVA');
	});

    }
    return;
    debugger;


})();
