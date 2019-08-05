// Puppeteer script for filling in the page for a student thesis
//
// G. Q. Maguire Jr.
// 2019.07.20

// https://kth.test.diva-portal.org/dream/add/add1.jsf

const puppeteer = require('puppeteer');
const fs = require('fs');
const config = require('./config.json'); // contains username and password to use
// Viewport && Window size
const width = 1280
const height = 900

// const delay = ms => new Promise(res => setTimeout(res, ms));

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


async function setMCEbody(page, baseSelector, v) {
    const sel='[id="'+baseSelector+'_ifr"]'
    try {
	const iframeElement = await page.$(sel);
	const iframe = await iframeElement.contentFrame();
	await iframe.evaluate((val) => document.body.innerHTML = val, v);
	const v1=await iframe.evaluate(() => document.body.innerHTML);
	console.info("setMCEbody for ", sel, " to ", v1 )
    } catch(e) {
	console.info("no such selector ", sel);
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

function lookup_textAreaHandle(textareaHandles, textAreaContent, areaLabel) {
    for (let i = 0; i < textareaHandles.length; i += 1) {
        if (textAreaContent[i].includes(areaLabel)) {
	    return textareaHandles[i];
	}
    }
}

async function getTextAreaHandles(page) {
    let textareaHandles;
    textareaHandles = await page.$$('div.diva2addtextarea');
    console.info("in getTextAreaHandles about to return ", textareaHandles)
    return textareaHandles;
}

async function getTextAreaContent(page) {
    let textareaHandles;
    textareaHandles = await page.$$('div.diva2addtextarea');
    console.info("in getTextAreaContent handles are ", textareaHandles)

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

async function getTextAreaBlanksAuthor(nameOfTextField, textareaHandle, page) {
    let field_arr;
    field_arr = [];
    let nameOfNextField;

    console.info('Handling case for Author');

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
	    console.info("textDiv is ", textDiv);

	    // This area also has three buttons
	    iId = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
	    iType = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
	    iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));

	    console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
	    field_arr.push({nameOfTextField, className, textDiv, iId, iType, iValue})
	}
	if (i == 1 && className === 'div.diva2addtextplus5') { // "Last name:*" & "Year of Birth:"
	    //    <div class="diva2addtextplus5">
	    //      <div class="diva2addtextplusname">
	    //	<div class="diva2addtextchoicecolbr">Last name:<span class="iceOutTxt diva2asterisk" id="addForm:authorSerie:0:j_id697">*</span>
	    //	</div>
	    //	<div class="diva2addtextchoicebox"><input class="iceInpTxt" id="addForm:authorSerie:0:autFamily" name="addForm:authorSerie:0:autFamily" onblur="setFocus('');" onfocus="setFocus(this.id);" onkeypress="iceSubmit(form,this,event);" onmousedown="this.focus();" size="35" type="text">
	    //	</div>
	    //      </div>
	    //      <div class="diva2addtextplus2">
	    //	<div class="diva2addtextchoicecolbr">Year of birth:
	    //	</div>
	    //	<div class="diva2addtextchoicebox"><input class="iceInpTxt" id="addForm:authorSerie:0:autBirthYear" name="addForm:authorSerie:0:autBirthYear" onblur="setFocus('');" onfocus="setFocus(this.id);" onkeypress="iceSubmit(form,this,event);" onmousedown="this.focus();" size="10" type="text" value="">
	    //	</div>
	    //      </div>
	    //    </div>
	    textDiv = await divs[i].$$eval('.diva2addtextchoicecolbr', nodes => nodes.map(i => i.textContent));
	    console.info("textDiv is ", textDiv);

	    iId    = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
	    iType  = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
	    iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));

	    console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
	    field_arr.push({nameOfTextField, className, textDiv, iId, iType, iValue})
	}
	if (i == 2 && className === 'div.diva2addtextplusname') { // 'First name'
	    textDiv = await divs[i].$$eval('.diva2addtextchoicecolbr', nodes => nodes.map(i => i.textContent));
	    console.info("textDiv is ", textDiv);

	    iId    = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
	    iType  = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
	    iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));

	    console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
	    field_arr.push({nameOfTextField, className, textDiv, iId, iType, iValue})

	}

	if (i == 3 && className === 'div.diva2addtextplusid') { // 'Local User Id:'
	    textDiv = await divs[i].$$eval('div.diva2addtextchoicecolbr', nodes => nodes.map(i => i.textContent));
	    console.info("textDiv is ", textDiv);

	    iId    = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
	    iType  = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
	    iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));

	    console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
	    field_arr.push({nameOfTextField, className, textDiv, iId, iType, iValue})
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
	}

	
	if (i == 6 && className.endsWith('icePnlSrs')) {
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

	    nameOfNextField=''; // no longer valid
	}
	// Ignore the remaining fields
    }
    return field_arr;
}

async function getTextAreaBlanksCooperation(nameOfTextField, textareaHandle, page) {
    let field_arr;
    field_arr = [];
    let nameOfNextField;

    console.info('Handling case for Cooperation');

    //      <div class="diva2addtextchoice2">Cooperation</div>
    //      <a class="info" href="#">?<span>
    //	  <p><b>Cooperation</b></p>
    //	  <p>With external collaboration means work that is done in collaboration with external parties outside the academy and where resource person should be available.</p></span></a>
    //      <div class="diva2addtextplus5">
    //	<div class="diva2addtextchoiceboxart"><label class="iceOutLbl" for="addForm:extCoop" id="addForm:j_id772">External cooperation</label>
    //	  <fieldset class="iceSelOneRb" id="addForm:extCoop" onclick=";setFocus('');iceSubmitPartial(form, this, event);">
    //	    <table border="0" cellpadding="0" cellspacing="0" class="iceSelOneRb">
    //	      <tbody><tr><td>
    //		    <input checked="checked" id="addForm:extCoop:_1" name="addForm:extCoop" onkeypress="Ice.util.radioCheckboxEnter(form,this,event);" type="radio" value="true"><label class="iceSelOneRb" for="addForm:extCoop:_1">Yes</label></td><td>
    //		    <input id="addForm:extCoop:_2" name="addForm:extCoop" onkeypress="Ice.util.radioCheckboxEnter(form,this,event);" type="radio" value="false"><label class="iceSelOneRb" for="addForm:extCoop:_2">No</label></td></tr></tbody></table></fieldset></div>
    //	<div class="icePnlGrp diva2addtextchoicecol" id="addForm:j_id774">Partner:<span class="iceOutTxt diva2asterisk" id="addForm:j_id776">*</span></div>
    //	<div class="icePnlGrp diva2addtextchoicebox" id="addForm:j_id777">
    //	  <div class="icePnlSrs" id="addForm:j_id778">
    //	    <div class="diva2partneritemtype">
    //	      <input class="iceInpTxt" id="addForm:j_id778:0:j_id780" name="addForm:j_id778:0:j_id780" onblur="setFocus('');iceSubmitPartial(form, this, event);" onfocus="setFocus(this.id);" onkeypress="iceSubmit(form,this,event);" onmousedown="this.focus();" size="60" type="text" value=""></div>
    //	    <div class="diva2addtextchoicecolbr8">
    //	      <a class="iceCmdLnk" href="javascript:;" id="addForm:j_id778:0:j_id782" onblur="setFocus('');" onclick="var form=formOf(this);form['addForm:_idcl'].value='addForm:j_id778:0:j_id782';return iceSubmitPartial(form,this,event);" onfocus="setFocus(this.id);">
    //		<div class="diva2addtextchoicecolbr5"></div></a></div></div></div></div>
    //      <div class="icePnlGrp diva2addtextchoiceboxbr" id="addForm:j_id784">
    //	<input class="iceCmdBtn diva2addsokbutton diva2backgroundcolor" id="addForm:j_id785" name="addForm:j_id785" onblur="setFocus('');" onclick="iceSubmit(form,this,event);return false;" onfocus="setFocus(this.id);" type="submit" value="Add partner »"></div></fieldset></div>


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

	if (i == 0 && className === 'div.diva2addtextchoice2') {
	    // nothing to do here
	}
	if (i == 1 && className === 'div.diva2addtextplus5') { // "Last name:*" & "Year of Birth:"
	    textDiv = await divs[i].$$eval('.diva2addtextchoicecolbr', nodes => nodes.map(i => i.textContent));
	    console.info("textDiv is ", textDiv);

	    iId    = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
	    iType  = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
	    iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));

	    console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
	    field_arr.push({nameOfTextField, className, textDiv, iId, iType, iValue})
	}
	if (i == 2 && className.endsWith('icePnlGrp.diva2addtextchoiceboxbr')) { // 
	    console.info("Do nothing, this is the Add Partner button we already found ");
	}
    }
    return field_arr;
}


async function getTextAreaBlanksTitle(nameOfTextField, textareaHandle, page) {
    let field_arr;
    field_arr = [];
    let nameOfNextField;

    console.info('Handling case for Title');

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


	if (i == 0 && className === 'div.diva2addtextchoicebr') {
	    // nothing to do here - it is simply "Title"
	}

	if (i == 1 && className === 'div.diva2addtextplus5') {
	    // nothing to do here - it simply is "Main title:*"
	    dText = await page.evaluate(element => element.textContent, divs[i]);
	    console.info("dText is ", dText);

	    if (dText.includes('Main title')) {
		nameOfNextField='Main title'; // remember this name since it will be needed later
		console.info("nameOfNextField is ", nameOfNextField);
	    }
	}

	if (i == 2 && className === 'div.diva2addtextchoicebox') {
	    // textarea for the title
	    // <div class="diva2addtextchoicebox">
	    //  <textarea class="iceInpTxtArea mceEditorSmall" cols="57" id="addForm:j_id686" name="addForm:j_id686" onmousedown="this.focus();" rows="2" aria-hidden="true" style="display: none;"></textarea>
	    //  <span role="application" aria-labelledby="addForm:j_id686_voice" id="addForm:j_id686_parent" class="mceEditor defaultSkin"> ... </div>
	    dText = await page.evaluate(element => element.innerHTML, divs[i]);
	    console.info("dText is ", dText);
	    iId = await divs[i].$$eval('textarea', nodes => nodes.map(n => n.getAttribute('id')));
	    console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " nameOfNextField: ", nameOfNextField, "iId: ", iId);
	    field_arr.push({nameOfTextField, nameOfNextField, className, textDiv, iId})
	}

	if (i == 3 && className === 'div.diva2addtextchoicecol') { // 'Subtitle'
	    dText = await page.evaluate(element => element.textContent, divs[i]);
	    console.info("dText is ", dText);

	    if (dText.includes('Subtitle')) {
		nameOfNextField='Subtitle'; // remember this name since it will be needed later
		console.info("nameOfNextField is ", nameOfNextField);
	    }
	}

	if (i == 4 && className === 'div.diva2addtextchoicebox') {
	    // textarea for the title
	    // <div class="diva2addtextchoicebox">
	    //  <textarea class="iceInpTxtArea mceEditorSmall" cols="57" id="addForm:j_id686" name="addForm:j_id686" onmousedown="this.focus();" rows="2" aria-hidden="true" style="display: none;"></textarea>
	    //  <span role="application" aria-labelledby="addForm:j_id686_voice" id="addForm:j_id686_parent" class="mceEditor defaultSkin"> ... </div>
	    iId = await divs[i].$$eval('textarea', nodes => nodes.map(n => n.getAttribute('id')));
	    console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " nameOfNextField: ", nameOfNextField, "iId: ", iId);
	    field_arr.push({nameOfTextField, nameOfNextField, className, textDiv, iId})
	}
    } 
    return field_arr;
}

async function getTextAreaBlanksAlternativeTitle(nameOfTextField, textareaHandle, page) {
    let field_arr;
    field_arr = [];
    let nameOfNextField;

    console.info('Handling case for Alternative title');

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


	if (i == 0 && className === 'div.diva2addtextchoicebr') {
	    // nothing to do here - it is simply "Alternatime title"
	}

	if (i == 1 && className === 'div.diva2addtextplus5') {
	    // nothing to do here - it simply is "Main title:*"
	    dText = await page.evaluate(element => element.textContent, divs[i]);
	    console.info("dText is ", dText);

	    if (dText.includes('Main title')) {
		nameOfNextField='Main title'; // remember this name since it will be needed later
		console.info("nameOfNextField is ", nameOfNextField);
	    }

	    // textarea for the title
	    // <div class="diva2addtextchoicebox">
	    //  <textarea class="iceInpTxtArea mceEditorSmall" cols="57" id="addForm:j_id686" name="addForm:j_id686" onmousedown="this.focus();" rows="2" aria-hidden="true" style="display: none;"></textarea>
	    //  <span role="application" aria-labelledby="addForm:j_id686_voice" id="addForm:j_id686_parent" class="mceEditor defaultSkin"> ... </div>
	    iId = await divs[i].$$eval('textarea', nodes => nodes.map(n => n.getAttribute('id')));
	    console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " nameOfNextField: ", nameOfNextField, "iD ", iId);
	    field_arr.push({nameOfTextField, nameOfNextField, className, textDiv, iId})
	}


	if (i == 2 && className === 'div.diva2addtextchoicecol') { // 'Subtitle'
	    dText = await page.evaluate(element => element.textContent, divs[i]);
	    console.info("dText is ", dText);

	    if (dText.includes('Subtitle')) {
		nameOfNextField='Subtitle'; // remember this name since it will be needed later
		console.info("nameOfNextField is ", nameOfNextField);
	    }
	}

	if (i == 3 && className === 'div.diva2addtextchoicebox') {
	    // textarea for the title
	    // <div class="diva2addtextchoicebox">
	    //  <textarea class="iceInpTxtArea mceEditorSmall" cols="57" id="addForm:j_id686" name="addForm:j_id686" onmousedown="this.focus();" rows="2" aria-hidden="true" style="display: none;"></textarea>
	    //  <span role="application" aria-labelledby="addForm:j_id686_voice" id="addForm:j_id686_parent" class="mceEditor defaultSkin"> ... </div>
	    iId = await divs[i].$$eval('textarea', nodes => nodes.map(n => n.getAttribute('id')));
	    console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " nameOfNextField: ", nameOfNextField, "iD ", iId);
	    field_arr.push({nameOfTextField, nameOfNextField, className, textDiv, iId})
	}
	// The following have already been taken care of
	// i = 4 is div.diva2addtextchoicecol for "Language"
	// i = 5 is div.diva2addtextchoicebox
    } 
    return field_arr;
}

async function getTextAreaBlanksDegree(nameOfTextField, textareaHandle, page) {
    let field_arr;
    field_arr = [];
    let nameOfNextField;

    console.info('Handling case for Degree');

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

	if (i == 0 && className === 'div.diva2addtextchoicebr') {
	    // nothing to do here - it is simply "Degree"
	    dText = await page.evaluate(element => element.textContent, divs[i]);
	    console.info("dText should simply say Degree - is ", dText);
	}

	if (i == 1 && className === 'div.diva2addtextchoicecol') { // "Level:*"
	    dText = await page.evaluate(element => element.textContent, divs[i]);
	    console.info("dText is ", dText);

	    if (dText.includes('Level')) {
		nameOfNextField='Level'; // remember this name since it will be needed later
		console.info("nameOfNextField is ", nameOfNextField);
	    }
	}

	if (i == 2 && className === 'div.diva2addtextplus5') {
	    iId = await divs[i].$$eval('select', nodes => nodes.map(n => n.getAttribute('id')));
	    nameOfNextField='Level';
	    console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " nameOfNextField: ", nameOfNextField, "iD ", iId);
	    field_arr.push({nameOfTextField, nameOfNextField, className, textDiv, iId})
	}

	if (i == 3 && className === 'div.diva2addtextchoicecol') { // "University credits:*"
	    dText = await page.evaluate(element => element.textContent, divs[i]);
	    console.info("dText is ", dText);

	    if (dText.includes('University credits')) {
		nameOfNextField='University credits'; // remember this name since it will be needed later
		console.info("nameOfNextField is ", nameOfNextField);
	    }
	}

	if (i == 4 && className === 'div.diva2addtextplus5') {
	    iId = await divs[i].$$eval('select', nodes => nodes.map(n => n.getAttribute('id')));
	    nameOfNextField='University credits';
	    console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " nameOfNextField: ", nameOfNextField, "iD ", iId);
	    field_arr.push({nameOfTextField, nameOfNextField, className, textDiv, iId})
	}

	if (i == 5 && className === 'div.diva2addtextchoicecol') { // "Educational program"
	    dText = await page.evaluate(element => element.textContent, divs[i]);
	    console.info("dText is ", dText);

	    if (dText.includes('Educational program')) {
		nameOfNextField='Educational program'; // remember this name since it will be needed later
		console.info("nameOfNextField is ", nameOfNextField);
	    }
	}

	if (i == 6 && className.endsWith('icePnlGrp.diva2addtextplus5')) {
	    iId = await divs[i].$$eval('select', nodes => nodes.map(n => n.getAttribute('id')));
	    nameOfNextField='Educational program';
	    console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " nameOfNextField: ", nameOfNextField, "iD ", iId);
	    field_arr.push({nameOfTextField, nameOfNextField, className, textDiv, iId})
	}

	if (i == 7 && className === 'div.diva2addtextchoicecol') { // "Subject / course:"
	    dText = await page.evaluate(element => element.textContent, divs[i]);
	    console.info("dText is ", dText);

	    if (dText.includes('"Subject')) {
		nameOfNextField='"Subject_course'; // remember this name since it will be needed later
		console.info("nameOfNextField is ", nameOfNextField);
	    }
	}

	if (i == 8 && className.endsWith('icePnlGrp.diva2addtextplus5')) {
	    iId = await divs[i].$$eval('select', nodes => nodes.map(n => n.getAttribute('id')));
	    nameOfNextField='Subject_course';
	    console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " nameOfNextField: ", nameOfNextField, "iD ", iId);
	    field_arr.push({nameOfTextField, nameOfNextField, className, textDiv, iId})
	}

	if (i == 9 && className === 'div.diva2addtextchoiceboxbr') {
	    // noting to do here - the "Another degree" was already found
	}
    }
	return field_arr;
}

async function getTextAreaBlanksContentCategory(nameOfTextField, textareaHandle, page) {
    let field_arr;
    field_arr = [];
    let nameOfNextField;

    console.info('Handling case for Content category');

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

	// <div class="diva2addtextchoiceboxart">
	//    <input class="iceSelBoolChkbx" id="addForm:j_id739" name="addForm:j_id739" onblur="setFocus('');" onclick="iceSubmitPartial(form, this, event);" onfocus="setFocus(this.id);" onkeypress="Ice.util.radioCheckboxEnter(form,this,event);" type="checkbox"><label class="iceOutLbl" for="addForm:slctArtisticWork" id="addForm:j_id740">Artistic work</label></div>

	if (i == 0 && className === 'div.diva2addtextchoicebr') {
	    iId = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
	    iType = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
	    iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));
	    nameOfNextField='Artistic work';
	    nameOfNextField=dText; // remember this name since it will be needed later
	    console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, "iD ", iId);
	    field_arr.push({nameOfTextField, className, iId})
	}
    }
    return field_arr;
}


async function getTextAreaBlanksOtherInformation(nameOfTextField, textareaHandle, page) {
    let field_arr;
    field_arr = [];
    let nameOfNextField;

    console.info('Handling case for Other Information');

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

	// <div class="diva2addtextarea">
	//  <fieldset class="diva2addborder">
	//    <div class="diva2addtextchoice2">Other information</div>
	//      <a class="info" href="#">?<span><p><b>Other information</b></p> ...</a>
	//    <div class="diva2addtextplus5">
	//      <div class="diva2addtextplus3">
	//         <div class="diva2addtextchoicecol">Year:<span class="iceOutTxt diva2asterisk" id="addForm:j_id756">*</span></div>
	//         <div class="diva2addtextchoicebox">
	//            <input class="iceInpTxt" id="addForm:j_id758" name="addForm:j_id758" onblur="setFocus('');iceSubmitPartial(form, this, event);" onfocus="setFocus(this.id);" onkeypress="iceSubmit(form,this,event);" onmousedown="this.focus();" size="4" type="text" value=""></div></div>
	//    <div class="diva2addtextplus2">
	//      <div class="diva2addtextchoicecol">Number of pages:</div>
	//      <div class="diva2addtextchoicebox">
	//          <input class="iceInpTxt" id="addForm:j_id763" name="addForm:j_id763" onblur="setFocus('');" onfocus="setFocus(this.id);" onkeypress="iceSubmit(form,this,event);" onmousedown="this.focus();" size="8" type="text"></div></div></div></fieldset></div>

	if (i == 0 && className === 'div.diva2addtextchoice2') {
	    dText = await page.evaluate(element => element.textContent, divs[i]);
	    console.info("dText", dText);
	}
	if (i == 1 && className === 'div.diva2addtextplus5') {
	    textDiv = await divs[i].$$eval('.diva2addtextchoicecol', nodes => nodes.map(n => n.textContent));
	    // the strings "Year:*" and "Number of pages:"
	    iId = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
	    iType = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
	    iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));
	    console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId);
	    field_arr.push({nameOfTextField, className, textDiv, iId})

	}
    }
    return field_arr;
}

async function getTextAreaBlanksSeries(nameOfTextField, textareaHandle, page) {
    let field_arr;
    field_arr = [];
    let nameOfNextField;

    console.info('Handling case for Series');

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

	if (i == 0 && className === 'div.diva2addtextchoicebr') {
	    // nothing to do here - it is simply "Series"
	    dText = await page.evaluate(element => element.textContent, divs[i]);
	    console.info("dText should simply say Series - is ", dText);
	}

	if (i == 1 && className === 'div.diva2addtextplus5') { // "Title of series:"
	    dText = await page.evaluate(element => element.textContent, divs[i]);
	    console.info("dText is ", dText);

	    if (dText.includes('Title of series')) {
		nameOfNextField='Title of series'; // remember this name since it will be needed later
		console.info("nameOfNextField is ", nameOfNextField);
	    }
	}

	if (i == 2 && className === 'div.diva2addtextchoicebox') {
	    iId = await divs[i].$$eval('select', nodes => nodes.map(n => n.getAttribute('id')));
	    console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " nameOfNextField: ", nameOfNextField, "iD ", iId);
	    field_arr.push({nameOfTextField, nameOfNextField, className, textDiv, iId})
	}

	if (i == 3 && className.includes('icePnlSrs')) { // if the above field has an inseration this field will get
	    // <div class="icePnlSrs" id="addForm:j_id937">
	    //    <div class="diva2addtextlistitemtype">TRITA-ICT-EX</div>
	    //    <div class="diva2addtextchoicecolbr8">
	    //       <a class="iceCmdLnk" href="javascript:;" id="addForm:j_id937:0:j_id941" onblur="setFocus('');" onclick="var form=formOf(this);form['addForm:_idcl'].value='addForm:j_id937:0:j_id941';return iceSubmitPartial(form,this,event);" onfocus="setFocus(this.id);"
	    //      ><div class="diva2addtextchoicecolbr5"></div></a>
	    //    </div>
	    // <div class="diva2addtextchoicecol">No. in series:</div>
	    // <div class="diva2addtextchoiceboxseries">
	    // <input class="iceInpTxt" id="addForm:j_id937:0:seriesNumber" name="addForm:j_id937:0:seriesNumber" onblur="setFocus('');iceSubmitPartial(form, this, event);" onfocus="setFocus(this.id);" onkeypress="iceSubmit(form,this,event);" onmousedown="this.focus();" size="10" type="text"></div></div>
	    textDiv = await divs[i].$$eval('div.diva2addtextchoicecol', nodes => nodes.map(n => n.textContent));
	    iId = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
	    iType = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
	    //iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));
	    console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, " iType:", iType);
	    field_arr.push({nameOfTextField, className, textDiv, iId, iType})
	}

	if (i == 4 && className === 'div.diva2addtextchoicecol') { // "No. in series:"
	    dText = await page.evaluate(element => element.textContent, divs[i]);
	    console.info("dText is ", dText);

	    if (dText.includes('No. in series')) {
		nameOfNextField='No. in series'; // remember this name since it will be needed later
		console.info("nameOfNextField is ", nameOfNextField);
	    }
	}

	if (i == 5 && className === 'div.diva2addtextchoiceboxseries') {
	    iId = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
	    iType = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
	    //iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));
	    console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " nameOfNextField: ", nameOfNextField, "iD ", iId, iType, iValue);
	    field_arr.push({nameOfTextField, nameOfNextField, className, iId, iType, iValue})
	}
    }
    return field_arr;
}		    

async function getTextAreaBlanksOtherSeries(nameOfTextField, textareaHandle, page) {
    let field_arr;
    field_arr = [];
    let nameOfNextField;

    console.info('Handling case for Other series');

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

	if (i == 0 && className === 'div.diva2addtextchoicebr') {
	    // nothing to do here - it is simply "Series"
	    dText = await page.evaluate(element => element.textContent, divs[i]);
	    console.info("dText should simply say Series - is ", dText);
	}

	if (i == 1 && className === 'div.diva2addtextplus5') { // "Title of series/ISSN:"
	    dText = await page.evaluate(element => element.textContent, divs[i]);
	    console.info("dText is ", dText);

	    if (dText.includes('Title of series/ISSN')) {
		nameOfNextField='Title of series_ISSN'; // remember this name since it will be needed later
		console.info("nameOfNextField is ", nameOfNextField);
	    }
	}

	if (i == 2 && className === 'div.diva2addtextchoicebox') {
	    iId = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
	    iType = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
	    iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));
	    console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " nameOfNextField: ", nameOfNextField, "iD ", iId, iType, iValue);
	    field_arr.push({nameOfTextField, nameOfNextField, className, iId, iType, iValue})
	}

	if (i == 3 && className === 'div.diva2addtextchoicecol') { // "ISSN:"
	    dText = await page.evaluate(element => element.textContent, divs[i]);
	    console.info("dText is ", dText);

	    if (dText.includes('ISSN')) {
		nameOfNextField='ISSN'; // remember this name since it will be needed later
		console.info("nameOfNextField is ", nameOfNextField);
	    }
	}

	if (i == 4 && className === 'div.diva2addtextchoicebox') { // a select box for the series string
	    iId = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
	    iType = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
	    iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));
	    console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " nameOfNextField: ", nameOfNextField, "iD ", iId, iType, iValue);
	    field_arr.push({nameOfTextField, nameOfNextField, className, iId, iType, iValue})
	}

	if (i == 5 && className === 'div.diva2addtextchoicecol') { // "EISSN:"
	    dText = await page.evaluate(element => element.textContent, divs[i]);
	    console.info("dText is ", dText);

	    if (dText.includes('EISSN')) {
		nameOfNextField='EISSN'; // remember this name since it will be needed later
		console.info("nameOfNextField is ", nameOfNextField);
	    }
	}

	if (i == 6 && className === 'div.diva2addtextchoicebox') { // a select box for the series string
	    iId = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
	    iType = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
	    iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));
	    console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " nameOfNextField: ", nameOfNextField, "iD ", iId, iType, iValue);
	    field_arr.push({nameOfTextField, nameOfNextField, className, iId, iType, iValue})
	}

	if (i == 7 && className === 'div.diva2addtextchoicecol') { // "EISSN:"
	    dText = await page.evaluate(element => element.textContent, divs[i]);
	    console.info("dText is ", dText);

	    if (dText.includes('EISSN')) {
		nameOfNextField='EISSN'; // remember this name since it will be needed later
		console.info("nameOfNextField is ", nameOfNextField);
	    }
	}

	if (i == 8 && className === 'div.diva2addtextchoicebox') { // a select box for the series string
	    iId = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
	    iType = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
	    iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));
	    console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " nameOfNextField: ", nameOfNextField, "iD ", iId, iType, iValue);
	    field_arr.push({nameOfTextField, nameOfNextField, className, iId, iType, iValue})
	}

    }
    return field_arr;
}

async function getTextAreaBlanksIdentifiers(nameOfTextField, textareaHandle, page) {
    let field_arr;
    field_arr = [];
    let nameOfNextField;

    console.info('Handling case for Identifiers');

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

	if (i == 0 && className === 'div.diva2addtextchoicebr') {
	    // nothing to do here - it is simply "Identifiers"
	    dText = await page.evaluate(element => element.textContent, divs[i]);
	    console.info("dText should simply say OtherSeries - is ", dText);
	}

	if (i == 1 && className === 'div.diva2addtextplus5') { // "URI:" will be the URI generated by DiVA
	    dText = await page.evaluate(element => element.textContent, divs[i]);
	    console.info("dText is ", dText);

	    if (dText.includes('URI')) {
		nameOfNextField='URI'; // remember this name since it will be needed later
		console.info("nameOfNextField is ", nameOfNextField);
		console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " nameOfNextField: ", nameOfNextField, "dText ", dText);
		field_arr.push({nameOfTextField, nameOfNextField, className, dText})
	    }
	}

	if (i == 2 && className.includes('diva2addtextplus5')) { // DiVA-ID: 
	    dText = await page.evaluate(element => element.textContent, divs[i]);
	    console.info("dText is ", dText);
	}

	// i = 3 is "Clearer"
	if (i == 4 && className === 'div.diva2addtextchoicecol') { // "ISRN:"
	    dText = await page.evaluate(element => element.textContent, divs[i]);
	    console.info("dText is ", dText);

	    if (dText.includes('ISRN')) {
		nameOfNextField='ISRN'; // remember this name since it will be needed later
		console.info("nameOfNextField is ", nameOfNextField);
	    }

	    iId = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
	    iType = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
	    iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));
	    console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " nameOfNextField: ", nameOfNextField, "iD ", iId, iType, iValue);
	    field_arr.push({nameOfTextField, nameOfNextField, className, iId, iType, iValue})
	}


	if (i == 5 && className === 'div.diva2addtextplus4') { // "DOI:"
	    dText = await page.evaluate(element => element.textContent, divs[i]);
	    console.info("dText is ", dText);

	    if (dText.includes('DOI')) {
		nameOfNextField='DOI'; // remember this name since it will be needed later
		console.info("nameOfNextField is ", nameOfNextField);
	    }

	    iId = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
	    iType = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
	    iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));
	    console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " nameOfNextField: ", nameOfNextField, "iD ", iId, iType, iValue);
	    field_arr.push({nameOfTextField, nameOfNextField, className, iId, iType, iValue})
	}

	if (i == 6 && className.includes('icePnlSrs')) { // "URL:" & "URL label:"
	    textDiv = await divs[i].$$eval('div.diva2addtextchoicecol', nodes => nodes.map(n => n.textContent));
	    iId = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
	    iType = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
	    //iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));
	    console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, " iType:", iType);
	    field_arr.push({nameOfTextField, className, textDiv, iId, iType})
	}

	// i = 7 Add URL already taken care of
    }
    return field_arr;
}

async function getTextAreaBlanksNationalSubjectCategory(nameOfTextField, textareaHandle, page) {
    let field_arr;
    field_arr = [];
    let nameOfNextField;

    console.info('Handling case for National subject category');

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

	if (i == 0 && className === 'div.diva2addtextchoicebr') {
	    // nothing to do here - it is simply "National subject category"
	    dText = await page.evaluate(element => element.textContent, divs[i]);
	    console.info("dText should simply say National subject category - is ", dText);
	}

	if (i == 1 && className.includes('icePnlGrp')) { // 
	    textDiv = await divs[i].$$eval('div.diva2addtextchoicecol', nodes => nodes.map(n => n.textContent));
	    iId = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
	    iType = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
	    //iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));
	    console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, " iType:", iType);
	    field_arr.push({nameOfTextField, className, textDiv, iId, iType})
	}

	// i = 6 is icePnlSrs - Unknown
    }
    return field_arr;
}


async function getTextAreaBlanksPartOfProject(nameOfTextField, textareaHandle, page) {
    let field_arr;
    field_arr = [];
    let nameOfNextField;

    console.info('Handling case for Part of project');

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

	if (i == 0 && className === 'div.diva2addtextchoicebr') {
	    // nothing to do here - it is simply "Part of project"
	    dText = await page.evaluate(element => element.textContent, divs[i]);
	    console.info("dText should simply say Part of project - is ", dText);
	}

	// The rest is taken care of by the add "Another project" button
    }
    return field_arr;
}

async function getTextAreaBlanksPartOfOtherProject(nameOfTextField, textareaHandle, page) {
    let field_arr;
    field_arr = [];
    let nameOfNextField;

    console.info('Handling case for Part of other project');

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

	if (i == 0 && className === 'div.diva2addtextchoicebr') {
	    // nothing to do here - it is simply "Part of other project"
	    dText = await page.evaluate(element => element.textContent, divs[i]);
	    console.info("dText should simply say Part of other project - is ", dText);
	}

	if (i == 1 && className.includes('icePnlSrs')) { // 
	    iId = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
	    iType = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
	    console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, "iD ", iId, " iType:", iType);
	    field_arr.push({nameOfTextField, className, iId, iType})
	}

	// i = 2 Another project button
    }
    return field_arr;
}


async function getTextAreaBlanksKeywords(nameOfTextField, textareaHandle, page) {
    let field_arr;
    field_arr = [];
    let nameOfNextField;

    console.info('Handling case for Keywords');

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

	if (i == 0 && className === 'div.diva2addtextchoicebr') {
	    // nothing to do here - it is simply "Keywords"
	    dText = await page.evaluate(element => element.textContent, divs[i]);
	    console.info("dText is ", dText);
	}

	if (i == 1 && className === 'div.diva2addtextplus5') { // 
	    textDiv = await divs[i].$$eval('div.diva2addtextchoicecol', nodes => nodes.map(n => n.textContent));
	    iId = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
	    iType = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
	    //iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));
	    console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, " iType:", iType);
	    field_arr.push({nameOfTextField, className, textDiv, iId, iType})
	}

	// i = 2 Another project button
    }
    return field_arr;
}

async function getTextAreaBlanksAbstract(nameOfTextField, textareaHandle, page) {
    let field_arr;
    field_arr = [];
    let nameOfNextField;

    console.info('Handling case for Abstract');

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

	if (i == 0 && className === 'div.diva2addtextchoicebr') {
	    // nothing to do here - it is simply "Abstract"
	    dText = await page.evaluate(element => element.textContent, divs[i]);
	    console.info("dText", dText);
	}

	if (i == 1 && className === 'div.diva2addtextchoiceboxab') { // 
	    iId = await divs[i].$$eval('textarea', nodes => nodes.map(n => n.getAttribute('id')));
	    console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " nameOfNextField: ", nameOfNextField, "iId: ", iId);
	    field_arr.push({nameOfTextField, nameOfNextField, className, textDiv, iId})
	}

	// i = 2 Another project button
    }
    return field_arr;
}


async function getTextAreaBlanksSupervisor(nameOfTextField, textareaHandle, page) {
    let field_arr;
    field_arr = [];
    let nameOfNextField;

    console.info('Handling case for Supervisor');

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

	// case for an Supervisor
	if (i == 0 && className === 'div.diva2addtextchoicebr') {
	    // scalar version:
	    //   dText = await page.evaluate(element => element.textContent, divs[i]);
	    // vector version:
	    textDiv = await divs[i].$$eval('div.diva2addtextchoice2', nodes => nodes.map(n => n.textContent));
	    console.info("textDiv is ", textDiv);

	    // This area also has three buttons
	    iId = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
	    iType = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
	    iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));

	    console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
	    field_arr.push({nameOfTextField, className, textDiv, iId, iType, iValue})
	}
	if (i == 1 && className === 'div.diva2addtextplus5') { // "Last name:*" & "Academic title:"
	    textDiv = await divs[i].$$eval('.diva2addtextchoicecolbr', nodes => nodes.map(i => i.textContent));
	    console.info("textDiv is ", textDiv);

	    iId    = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
	    iType  = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
	    iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));

	    console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
	    field_arr.push({nameOfTextField, className, textDiv, iId, iType, iValue})
	}
	if (i == 2 && className === 'div.diva2addtextplusname') { // 'First name'
	    textDiv = await divs[i].$$eval('.diva2addtextchoicecolbr', nodes => nodes.map(i => i.textContent));
	    console.info("textDiv is ", textDiv);

	    iId    = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
	    iType  = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
	    iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));

	    console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
	    field_arr.push({nameOfTextField, className, textDiv, iId, iType, iValue})

	}

	if (i == 3 && className === 'div.diva2addtextplusid') { // 'Local User Id:'
	    textDiv = await divs[i].$$eval('div.diva2addtextchoicecolbr', nodes => nodes.map(i => i.textContent));
	    console.info("textDiv is ", textDiv);

	    iId    = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
	    iType  = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
	    iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));

	    console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
	    field_arr.push({nameOfTextField, className, textDiv, iId, iType, iValue})
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
	}

	
	if (i == 6 && className.endsWith('icePnlSrs')) {
	    // noting to do here - until a selection is made for the previous; then the selected organization will appear in this field
	}

	if (i == 7 && className === 'div.diva2addtextchoicecol') { // 'E-mail'
	    dText = await page.evaluate(element => element.textContent, divs[i]);
	    console.info("dText is ", dText);

	    if (dText.includes('E-mail')) {
		nameOfNextField='E-mail'; // remember this name since it will be needed later
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

	}

	if (i == 9 && className === 'div.diva2addtextchoicecol') { // 'Other organisationl'
	    dText = await page.evaluate(element => element.textContent, divs[i]);
	    console.info("dText is ", dText);

	    if (dText.includes('Other organisation')) {
		nameOfNextField='Other organisation'; // remember this name since it will be needed later
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

	    nameOfNextField=''; // no longer valid
	}
	// Ignore the remaining fields
    }
    return field_arr;
}

async function getTextAreaBlanksExaminer(nameOfTextField, textareaHandle, page) {
    let field_arr;
    field_arr = [];
    let nameOfNextField;

    console.info('Handling case for Examiner');

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

	// case for an Examiner
	if (i == 0 && className === 'div.diva2addtextchoicebr') {
	    // scalar version:
	    //   dText = await page.evaluate(element => element.textContent, divs[i]);
	    // vector version:
	    textDiv = await divs[i].$$eval('div.diva2addtextchoice2', nodes => nodes.map(n => n.textContent));
	    console.info("textDiv is ", textDiv);

	    // This area also has three buttons
	    iId = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
	    iType = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
	    iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));

	    console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
	    field_arr.push({nameOfTextField, className, textDiv, iId, iType, iValue})
	}
	if (i == 1 && className === 'div.diva2addtextplus5') { // "Last name:*" & "Academic title:"
	    textDiv = await divs[i].$$eval('.diva2addtextchoicecolbr', nodes => nodes.map(i => i.textContent));
	    console.info("textDiv is ", textDiv);

	    iId    = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
	    iType  = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
	    iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));

	    console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
	    field_arr.push({nameOfTextField, className, textDiv, iId, iType, iValue})
	}
	if (i == 2 && className === 'div.diva2addtextplusname') { // 'First name'
	    textDiv = await divs[i].$$eval('.diva2addtextchoicecolbr', nodes => nodes.map(i => i.textContent));
	    console.info("textDiv is ", textDiv);

	    iId    = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
	    iType  = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
	    iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));

	    console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
	    field_arr.push({nameOfTextField, className, textDiv, iId, iType, iValue})

	}

	if (i == 3 && className === 'div.diva2addtextplusid') { // 'Local User Id:'
	    textDiv = await divs[i].$$eval('div.diva2addtextchoicecolbr', nodes => nodes.map(i => i.textContent));
	    console.info("textDiv is ", textDiv);

	    iId    = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
	    iType  = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
	    iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));

	    console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
	    field_arr.push({nameOfTextField, className, textDiv, iId, iType, iValue})
	}

	if (i == 4 && className === 'div.diva2addtextplusid') { // 'ORCiD:'
	    textDiv = await divs[i].$$eval('div.diva2addtextchoicecolbr', nodes => nodes.map(i => i.textContent));
	    console.info("textDiv is ", textDiv);

	    iId    = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
	    iType  = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
	    iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));

	    console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
	    field_arr.push({nameOfTextField, className, textDiv, iId, iType, iValue})
	}

	if (i == 5 && className === 'div.diva2addtextchoicecol') { // Department, unit or programme:
	    dText = await page.evaluate(element => element.textContent, divs[i]);
	    console.info("dText is ", dText);

	    if (dText.includes('Department, unit or programme')) {
		nameOfNextField=dText; // remember this name since it will be needed later
		console.info("nameOfNextField is ", nameOfNextField);
	    }
	}

	if (i == 6 && className.endsWith('icePnlGrp')) {
	    textDiv = await divs[i].$$eval('div.diva2addtextchoicecol', nodes => nodes.map(i => i.textContent));
	    console.info("textDiv is ", textDiv);

	    iId    = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
	    iType  = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
	    iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));

	    console.info("about to push nameOfNextField", nameOfNextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
	    field_arr.push({nameOfNextField, className, textDiv, iId, iType, iValue})
	    // note that a click on this field invokes: moveOrganisationPopupIntoView();iceSubmit(form,this,event)
	}

	
	if (i == 7 && className.endsWith('icePnlSrs')) {
	    // noting to do here - until a selection is made for the previous; then the selected organization will appear in this field
	}

	if (i == 8 && className === 'div.diva2addtextchoicecol') { // 'E-mail'
	    dText = await page.evaluate(element => element.textContent, divs[i]);
	    console.info("dText is ", dText);

	    if (dText.includes('E-mail')) {
		nameOfNextField='E-mail'; // remember this name since it will be needed later
		console.info("nameOfNextField is ", nameOfNextField);
	    }
	}

	if (i == 9 && className === 'div.diva2addtextchoicebox') {
	    textDiv = await divs[i].$$eval('div.diva2addtextchoicecol', nodes => nodes.map(i => i.textContent));
	    console.info("textDiv is ", textDiv);

	    iId    = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
	    iType  = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
	    iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));

	    console.info("about to push nameOfNextField", nameOfNextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
	    field_arr.push({nameOfNextField, className, textDiv, iId, iType, iValue})

	}

	if (i == 10 && className === 'div.diva2addtextchoicecol') { // 'Other organisation:'
	    dText = await page.evaluate(element => element.textContent, divs[i]);
	    console.info("dText is ", dText);

	    if (dText.includes('Other organisation')) {
		nameOfNextField='Other organisation'; // remember this name since it will be needed later
		console.info("nameOfNextField is ", nameOfNextField);
	    }
	}

	if (i == 11 && className === 'div.diva2addtextchoicebox') {
	    textDiv = await divs[i].$$eval('div.diva2addtextchoicecol', nodes => nodes.map(i => i.textContent));
	    console.info("textDiv is ", textDiv);

	    iId    = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
	    iType  = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
	    iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));

	    console.info("about to push nameOfNextField", nameOfNextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
	    field_arr.push({nameOfNextField, className, textDiv, iId, iType, iValue})

	    nameOfNextField=''; // no longer valid
	}
	// Ignore the remaining fields
    }
    return field_arr;
}

async function getTextAreaBlanksExaminer(nameOfTextField, textareaHandle, page) {
    let field_arr;
    field_arr = [];
    let nameOfNextField;

    console.info('Handling case for Examiner');

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

	// case for an Examiner
	if (i == 0 && className === 'div.diva2addtextchoicebr') {
	    // scalar version:
	    //   dText = await page.evaluate(element => element.textContent, divs[i]);
	    // vector version:
	    textDiv = await divs[i].$$eval('div.diva2addtextchoice2', nodes => nodes.map(n => n.textContent));
	    console.info("textDiv is ", textDiv);

	    // This area also has three buttons
	    iId = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
	    iType = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
	    iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));

	    console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
	    field_arr.push({nameOfTextField, className, textDiv, iId, iType, iValue})
	}
	if (i == 1 && className === 'div.diva2addtextplus5') { // "Last name:*" & "Academic title:"
	    textDiv = await divs[i].$$eval('.diva2addtextchoicecolbr', nodes => nodes.map(i => i.textContent));
	    console.info("textDiv is ", textDiv);

	    iId    = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
	    iType  = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
	    iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));

	    console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
	    field_arr.push({nameOfTextField, className, textDiv, iId, iType, iValue})
	}
	if (i == 2 && className === 'div.diva2addtextplusname') { // 'First name'
	    textDiv = await divs[i].$$eval('.diva2addtextchoicecolbr', nodes => nodes.map(i => i.textContent));
	    console.info("textDiv is ", textDiv);

	    iId    = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
	    iType  = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
	    iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));

	    console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
	    field_arr.push({nameOfTextField, className, textDiv, iId, iType, iValue})

	}

	if (i == 3 && className === 'div.diva2addtextplusid') { // 'Local User Id:'
	    textDiv = await divs[i].$$eval('div.diva2addtextchoicecolbr', nodes => nodes.map(i => i.textContent));
	    console.info("textDiv is ", textDiv);

	    iId    = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
	    iType  = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
	    iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));

	    console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
	    field_arr.push({nameOfTextField, className, textDiv, iId, iType, iValue})
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
	}

	
	if (i == 6 && className.endsWith('icePnlSrs')) {
	    // noting to do here - until a selection is made for the previous; then the selected organization will appear in this field
	}

	if (i == 7 && className === 'div.diva2addtextchoicecol') { // 'E-mail'
	    dText = await page.evaluate(element => element.textContent, divs[i]);
	    console.info("dText is ", dText);

	    if (dText.includes('E-mail')) {
		nameOfNextField='E-mail'; // remember this name since it will be needed later
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

	}

	if (i == 9 && className === 'div.diva2addtextchoicecol') { // 'Other organisationl'
	    dText = await page.evaluate(element => element.textContent, divs[i]);
	    console.info("dText is ", dText);

	    if (dText.includes('Other organisation')) {
		nameOfNextField='Other organisation'; // remember this name since it will be needed later
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

	    nameOfNextField=''; // no longer valid
	}
	// Ignore the remaining fields
    }
    return field_arr;
}


async function getTextAreaBlanksPresentation(nameOfTextField, textareaHandle, page) {
    let field_arr;
    field_arr = [];
    let nameOfNextField;

    console.info('Handling case for Presentation');

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

	// case for a Presentation

	if (i == 0 && className === 'div.diva2addtextchoicebr') {
	    // nothing to do here - it is simply "Presentation"
	    dText = await page.evaluate(element => element.textContent, divs[i]);
	    console.info("dText is ", dText);
	}

	if (i == 1 && className === 'div.diva2addtextplus5') { // Date
	    textDiv = await divs[i].$$eval('.diva2addtextchoicecol', nodes => nodes.map(i => i.textContent));
	    console.info("textDiv is ", textDiv);

	    iId    = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
	    iType  = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
	    iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));

	    console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
	    field_arr.push({nameOfTextField, className, textDiv, iId, iType, iValue})

	    iId    = await divs[i].$$eval('select', nodes => nodes.map(n => n.getAttribute('id')));
	    iType  = await divs[i].$$eval('select', nodes => nodes.map(n => n.getAttribute('type')));
	    iValue = await divs[i].$$eval('select', nodes => nodes.map(n => n.getAttribute('value')));

	    console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " Language: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
	    field_arr.push({nameOfTextField, className, textDiv, iId, iType, iValue})

	}
	if (i == 2 && className === 'div.diva2addtextplus') { // 'Room:'
	    textDiv = await divs[i].$$eval('.diva2addtextchoicecol', nodes => nodes.map(i => i.textContent));
	    console.info("textDiv is ", textDiv);

	    iId    = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
	    iType  = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
	    iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));

	    console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
	    field_arr.push({nameOfTextField, className, textDiv, iId, iType, iValue})

	}

	if (i == 3 && className === 'div.diva2addtextplus') { // 'Address:'
	    textDiv = await divs[i].$$eval('div.diva2addtextchoicecol', nodes => nodes.map(i => i.textContent));
	    console.info("textDiv is ", textDiv);

	    iId    = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
	    iType  = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
	    iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));

	    console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
	    field_arr.push({nameOfTextField, className, textDiv, iId, iType, iValue})
	}

	if (i == 4 && className === 'div.diva2addtextplus') { // 'City:'
	    textDiv = await divs[i].$$eval('div.diva2addtextchoicecol', nodes => nodes.map(i => i.textContent));
	    console.info("textDiv is ", textDiv);

	    iId    = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
	    iType  = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
	    iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));

	    console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
	    field_arr.push({nameOfTextField, className, textDiv, iId, iType, iValue})
	}
	// Ignore the remaining fields
    }
    return field_arr;
}

async function getTextAreaBlanksNote(nameOfTextField, textareaHandle, page) {
    let field_arr;
    field_arr = [];
    let nameOfNextField;

    console.info('Handling case for Note');

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

	if (i == 0 && className === 'div.diva2addtextchoicebr') {
	    // nothing to do here - it is simply "Note"
	    dText = await page.evaluate(element => element.textContent, divs[i]);
	    console.info("dText", dText);
	}

	if (i == 1 && className === 'div.diva2addtextplus5') { // 
	    iId = await divs[i].$$eval('textarea', nodes => nodes.map(n => n.getAttribute('id')));
	    console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " nameOfNextField: ", nameOfNextField, "iId: ", iId);
	    field_arr.push({nameOfTextField, nameOfNextField, className, textDiv, iId})
	}

	// i = 2 Another project button
    }
    return field_arr;
}


async function getTextAreaBlanks(page) {
    let textareaHandles;
    textareaHandles = await page.$$('div.diva2addtextarea');
    console.info("in getTextAreaContent handles are ", textareaHandles)

    let text_arr;
    let j=0;
    // loop thru all handles
    text_arr = [];
    for(const textareaHandle of textareaHandles){
	let nameOfTextArea='';
	let nameOfTextField=await page.evaluate(el => el.querySelector('div.diva2addtextchoice2').textContent, textareaHandle);
	let field_arr=[];;

	console.info("j is ", j, "nameOfTextField is ", nameOfTextField);

	if (nameOfTextField.startsWith('Author')) {
	    field_arr = await getTextAreaBlanksAuthor(nameOfTextField, textareaHandle, page);
	} else if (nameOfTextField.startsWith('Cooperation'))  {
	    field_arr = await getTextAreaBlanksCooperation(nameOfTextField, textareaHandle, page);
	} else if (nameOfTextField === 'Title')  {
	    field_arr = await getTextAreaBlanksTitle(nameOfTextField, textareaHandle, page);
	} else if (nameOfTextField.startsWith('Alternative title'))  {
	    field_arr = await getTextAreaBlanksAlternativeTitle(nameOfTextField, textareaHandle, page);
	} else if (nameOfTextField.startsWith('Degree'))  {
	    field_arr = await getTextAreaBlanksDegree(nameOfTextField, textareaHandle, page);
	} else if (nameOfTextField.startsWith('Content category'))  {
	    field_arr = await getTextAreaBlanksContentCategory(nameOfTextField, textareaHandle, page);
	} else if (nameOfTextField === 'Other information')  {
	    field_arr = await getTextAreaBlanksOtherInformation(nameOfTextField, textareaHandle, page);
	} else if (nameOfTextField.startsWith('Series'))  {
	    field_arr = await getTextAreaBlanksSeries(nameOfTextField, textareaHandle, page);
	} else if (nameOfTextField === 'Other series')  {
	    field_arr = await getTextAreaBlanksOtherSeries(nameOfTextField, textareaHandle, page);
	} else if (nameOfTextField.startsWith('Identifiers'))  {
	    field_arr = await getTextAreaBlanksIdentifiers(nameOfTextField, textareaHandle, page);
	} else if (nameOfTextField.startsWith('National subject category'))  {
	    field_arr = await getTextAreaBlanksNationalSubjectCategory(nameOfTextField, textareaHandle, page);
	} else if (nameOfTextField.startsWith('Part of project'))  {
	    field_arr = await getTextAreaBlanksPartOfProject(nameOfTextField, textareaHandle, page);
	} else if (nameOfTextField.startsWith('Part of other project'))  {
	    field_arr = await getTextAreaBlanksPartOfOtherProject(nameOfTextField, textareaHandle, page);
	} else if (nameOfTextField.startsWith('Keywords'))  {
	    field_arr = await  getTextAreaBlanksKeywords(nameOfTextField, textareaHandle, page);
	} else if (nameOfTextField.startsWith('Abstract'))  {
	    field_arr = await  getTextAreaBlanksAbstract(nameOfTextField, textareaHandle, page);
	} else if (nameOfTextField.startsWith('Supervisor'))  {
	    field_arr = await  getTextAreaBlanksSupervisor(nameOfTextField, textareaHandle, page);
	} else if (nameOfTextField.startsWith('Examiner'))  {
	    field_arr = await  getTextAreaBlanksExaminer(nameOfTextField, textareaHandle, page);
	} else if (nameOfTextField.startsWith('Presentation'))  {
	    field_arr = await  getTextAreaBlanksPresentation(nameOfTextField, textareaHandle, page);
	} else if (nameOfTextField.includes('Note'))  {
	    field_arr = await  getTextAreaBlanksNote(nameOfTextField, textareaHandle, page);
	} else {
	    console.info("In default handler");	    
	    // pass the single handle below
	    field_arr = [];
	    const divs = await textareaHandle.$$('fieldset > div');
	    console.info("divs length is ", divs.length);
	    for (let i = 0; i < divs.length; i++) {
		let textDiv='';
		let iId='';
		let iType='';
		let iValue='';
		let dClass;
		let dText;
		console.info("iteration ", i);

		dText = await page.evaluate(element => element.textContent, divs[i]);
		console.info("dText is ", dText);

		className = await divs[i]._remoteObject.description;
		console.info("className is ", className);


		try {
		    textDiv = await divs[i].$$eval('div', nodes => nodes.map(i => i.textContent));
		    console.info("textDiv is ", textDiv);
		} catch(e) {
		    console.info("no textDiv");
		}
		

		try {
		    iId = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
		    //console.info("id is ", iId);
		    iType = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
		    iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));
		    //iType = await divs[i].$eval('input', a => a.getAttribute('type'));
		    //iValue = await divs[i].$eval('input', a => a.getAttribute('value'));
		    console.info("id is ", iId, "iType is", iType, "ivalue is ", iValue);
		} catch(e) {
		    console.info("no input");
		}
		//if ((textDiv.length > 1) && (iId.length > 1)) {field_arr.push({className, textDiv, iId, iType, iValue})}
		field_arr.push({className, textDiv, iId, iType, iValue})
	    }
	}
	text_arr.push(field_arr);

	// to short circuit testing
	//if (j >= 21) {
	//return text_arr;
	//}

	j=j+1;
    }
    return text_arr;
}

async function getTextareabuttonHandles(page) {
    let textareabuttonHandles;
    textareabuttonHandles = await page.$$('input.iceCmdBtn.diva2addsokbutton');
    // loop thru all handles
    text_arr = [];
    for(const textareaHandle of textareabuttonHandles){
	// pass the single handle below
	const singleButton_id = await page.evaluate(el => el.id, textareaHandle);
	// console.log("button id", singleButton_id) 
	const singleButton_value = await page.evaluate(el => el.value, textareaHandle);
	// console.log("button value", singleButton_value) 
	text_arr.push({singleButton_id, singleButton_value})
    }
    return text_arr;
}

async function textAreaLang(page, textareaHandles, textAreaContent, textAreaName, lang) {
    console.info("In textAreaLang  textAreaName is ", textAreaName);
    let areaHandle;
    let language_id;
    areaHandle=lookup_textAreaHandle(textareaHandles, textAreaContent, textAreaName);
    //console.info("In textAreaLang areaHandle is ", areaHandle);
    language_id = await page.evaluate(el => {
	const s1=el.querySelector('.diva2addtextselectlang').id
	//console.info("id of select is ", s1);
	return s1;
    }, areaHandle);
    console.info(textAreaName, " language_id is ", language_id);
    selector = 'select[id="'+language_id+'"]';
    await page.select(selector, lang);
}

async function addTextArea(page, buttonHandles, textAreaName) {
    // for the case of keywords in two languages: look for the 'Keywords in another language' and click it
    let add_button_id;
    add_button_id=lookup_button(buttonHandles, textAreaName)
    console.info("about to click button with the id=", add_button_id);
    selector = 'input[id="'+add_button_id+'"]';
    const add_another = await page.click(selector, {delay: 1000});
    console.info("just after clicking button with the id=", add_button_id);
}


(async() => {

    const host_name=config.diva.host
    let status;

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
    if (page.url().includes('https://login.kth.se/login')) {
	page.type('#username', config.diva.username);
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
    
    page.waitForNavigation({ waitUntil: 'load' })
    const waitforadd2 = await page.waitFor('div.diva2addtextplusname')
    console.log('FOUND after Continue!', page.url());

    // Lastname field:
    //	<div class="diva2addtextplus5">
    //    <div class="diva2addtextplusname">
    //	    <div class="diva2addtextchoicecolbr">Last name:<span class="iceOutTxt diva2asterisk" id="addForm:authorSerie:0:j_id697">*</span></div>
    //	    <div class="diva2addtextchoicebox">
    //	      <input class="iceInpTxt" id="addForm:authorSerie:0:autFamily" name="addForm:authorSerie:0:autFamily" onblur="setFocus('');" onfocus="setFocus(this.id);" onkeypress="iceSubmit(form,this,event);" onmousedown="this.focus();" size="35" type="text"></div></div>
    await page.waitFor(1000);

    let message1= await page.evaluate(() => {
	const s1=document.querySelector('div.diva2addtextplusname');
	const s2=s1.querySelector('div.diva2addtextchoicecolbr').textContent;
	// should be "Last name:*"
	s1.querySelector('div.diva2addtextchoicebox input.iceInpTxt').value='Maguire';
	return s1;
    });
    console.info("message1 is ", message1);

    // const testAreas_innerHTML = await page.evaluate(() => Array.from(document.querySelectorAll('div.diva2addtextarea'),
    // 								     element => element.querySelector('div.diva2addtextchoice2').textContent));
    // console.info("testAreas_innerHTML is ", testAreas_innerHTML);

    // tas=document.querySelectorAll('div.diva2addtextarea')
    // for(e of tas) {console.info(e.querySelector('div.diva2addtextchoice2').textContent)}


    let textareaHandles;
    let text_arr;
    let textAreaContent;

    textareaHandles = await getTextAreaHandles(page);
    textAreaContent = await getTextAreaContent(page);
    console.info("textAreaContent (in main program) is ", textAreaContent)
    
    buttonHandles=await getTextareabuttonHandles(page)
    console.info("buttonHandles are ", buttonHandles)

    // for the case of 2 authors: look for the 'Another author' and click it
    await addTextArea(page, buttonHandles, 'Another author');
    // add_author_button_id=lookup_button(buttonHandles, 'Another author')
    // console.info("button has the id=", add_author_button_id);
    // document.querySelector('#addForm\\:authorSerie\\:0\\:j_id755')
    // <input class=​"iceCmdBtn diva2addsokbutton diva2backgroundcolor" id=​"addForm:​authorSerie:​0:​j_id755" name=​"addForm:​authorSerie:​0:​j_id755" onblur=​"setFocus('')​;​" onclick=​"iceSubmit(form,this,event)​;​return false;​" onfocus=​"setFocus(this.id)​;​" type=​"submit" value=​"Another author »">​
    // document.querySelector('#addForm\\:authorSerie\\:0\\:j_id755').click()
    // undefined
    // the following is not working:
    // const add_another_author = await page.click('#'+add_author_button_id, {delay: 1000});
    // Similarly the following selector does not work - with ot without escaping
    // let selector = '#'+add_author_button_id;
    //let selector = 'input[id="'+add_author_button_id+'"]';
    //await page.waitForSelector(selector);
    //console.info("about to click button with the id=", add_author_button_id);
    //await page.evaluate((selector) => document.querySelector(selector).click(), selector); 
    // await page.evaluate((sel) => {
    // 	console.info("selector is ", sel);
    // 	const s1=document.querySelector(sel);
    // 	console.info("s1 is ", s1);
    // 	s1.click();
    // }, selector); 
    // const add_another_author = await page.click(selector, {delay: 1000});
    // console.info("just after clicking button with the id=", add_author_button_id);
    await page.waitFor(1000);
    page.waitForNavigation({ waitUntil: 'networkidle0' })

    let message2= await page.evaluate(() => {
	let textAreas=document.querySelectorAll('.diva2addtextarea')
	let textAreas_arr=Array.prototype.slice.call(textAreas);

	let text_arr = [];
	for (let i = 0; i < textAreas_arr.length; i += 1) {
            text_arr.push(textAreas_arr[i].querySelector('div.diva2addtextchoice2').textContent);
	}
	return text_arr;


    });
    console.info("message2 is ", message2);
    // from the output above you will see that the 2nd author's fields have been added
    

    // for the case of 2 supervisors: look for the 'Another supervisor' and click it
    await addTextArea(page, buttonHandles, 'Another supervisor');
    // add_supervisor_button_id=lookup_button(buttonHandles, 'Another supervisor')
    // console.info("about to click button with the id=", add_supervisor_button_id);
    // selector = 'input[id="'+add_supervisor_button_id+'"]';
    // const add_another_supervisor = await page.click(selector, {delay: 1000});
    // console.info("just after clicking button with the id=", add_supervisor_button_id);
    await page.waitFor(1000);
    page.waitForNavigation({ waitUntil: 'networkidle0' })

    let messageSupervisor = getTextAreaContent(page, textareaHandles);
    // let messageSupervisor= await page.evaluate(() => {
    // 	let textAreas=document.querySelectorAll('.diva2addtextarea')
    // 	let textAreas_arr=Array.prototype.slice.call(textAreas);

    // 	let text_arr = [];
    // 	for (let i = 0; i < textAreas_arr.length; i += 1) {
    //         text_arr.push(textAreas_arr[i].querySelector('div.diva2addtextchoice2').textContent);
    // 	}
    // 	return text_arr;


    // });
    console.info("messageSupervisor is ", messageSupervisor);
    // from the output above you will see that the 2nd supervisor's fields have been added


    // for the case of keywords in two languages: look for the 'Keywords in another language' and click it
    await addTextArea(page, buttonHandles, 'Keywords in another language');
    // add_keywords_button_id=lookup_button(buttonHandles, 'Keywords in another language')
    // console.info("about to click button with the id=", add_keywords_button_id);
    // selector = 'input[id="'+add_keywords_button_id+'"]';
    // const add_another_keywords = await page.click(selector, {delay: 1000});
    // console.info("just after clicking button with the id=", add_keywords_button_id);
    await page.waitFor(1000);
    page.waitForNavigation({ waitUntil: 'networkidle0' })

    // for the case of abstracts in two languages: look for the 'Another abstract' and click it
    await addTextArea(page, buttonHandles, 'Another abstract');
    // add_abstract_button_id=lookup_button(buttonHandles, 'Another abstract')
    // console.info("about to click button with the id=", add_abstract_button_id);
    // selector = 'input[id="'+add_abstract_button_id+'"]';
    // const add_another_abstract = await page.click(selector, {delay: 1000});
    // console.info("just after clicking button with the id=", add_abstract_button_id);
    await page.waitFor(1000);
    page.waitForNavigation({ waitUntil: 'networkidle0' })

    // because we have changes the text areas due to the above additions, we need to update the variables
    textareaHandles = await getTextAreaHandles(page);
    textAreaContent = await getTextAreaContent(page);
    //console.info("textAreaContent (in main program) is ", textAreaContent);
    
    buttonHandles=await getTextareabuttonHandles(page);
    //console.info("buttonHandles are ", buttonHandles);
    await page.waitFor(1000);
    page.waitForNavigation({ waitUntil: 'networkidle0' })

    await textAreaLang(page, textareaHandles, textAreaContent, 'Abstract1', 'eng');
    await page.waitFor(100);
    await textAreaLang(page, textareaHandles, textAreaContent, 'Abstract2', 'swe');
    await page.waitFor(100);
    await textAreaLang(page, textareaHandles, textAreaContent, 'Keywords1', 'eng');
    await page.waitFor(100);
    await textAreaLang(page, textareaHandles, textAreaContent, 'Keywords2', 'swe');
    await page.waitFor(100);
    
    let blanks;
    blanks = await getTextAreaBlanks(page)
    // console.info("blanks are ", blanks);

    for (let l = 0; l < blanks.length; l += 1) {
	console.info("blanks[", l, "] are ", blanks[l]); // first author
    }

    // Fill in some fields:
    // await page.type('[id="addForm:j_id1326"]', '2019-07-25 4:31');
    const date_time='2019-07-25 4:31';
    await page.type('[id="addForm:j_id1326"]', date_time, {delay: 10});
    //await page.$eval('[id="addForm:j_id1326"]', (el, value) => el.value = value, date_time);

    // there is a space at the end of the string
    await textAreaLang(page, textareaHandles, textAreaContent, 'Presentation ', 'eng');
    // alternatively is it a select of addForm:j_id1331


    //await page.type('[id="addForm:j_id1337"]', 'Seminar room Grimeton at COM');
    const room= 'Seminar room Grimeton at COM';
    //await page.type('[id="addForm:j_id1337"]', room, {delay: 100});
    await page.click('[id="addForm:j_id1337"]', { clickCount: 1 })
    await page.waitFor(1000);
    await page.keyboard.sendCharacter(room)
    //await page.$eval('[id="addForm:j_id1337"', (el, value) => el.value = value, room);

    await page.waitFor(1000);
    //await page.type('[id="addForm:j_id1342"]', 'Kistagången 16, East, Floor 4, Elevator B');
    const address='Kistagången 16, East, Floor 4, Elevator B';
    //await page.type('[id="addForm:j_id1342"]', address, {delay: 100});
    await page.click('[id="addForm:j_id1342"]')
    await page.waitFor(1000);
    await page.keyboard.sendCharacter(address);
    //await page.$eval('[id="addForm:j_id1342"]', (el, value) => el.value = value, address);

    //await page.type('[id="addForm:j_id1347"]', 'Kista');
    const city='Kista'
    await page.click('[id="addForm:j_id1347"]');
    await page.waitFor(1000);
    await page.keyboard.sendCharacter(city);
    await page.waitFor(1000);
    //await page.$eval('[id="addForm:j_id1347"]', (el, value) => el.value = value, city);

    let last_name;
    let first_name;
    let kthid;
    let research_group;
    let e_mail;
    let academic_title;
    let orcid;
    let otherOrg;

    // Author information
    last_name='Maguire Jr.';
    await page.$eval('[id="addForm:authorSerie:0:autFamily"]', (el, value) => el.value = value, last_name);

    first_name='Gerald Q.';
    await page.$eval('[id="addForm:authorSerie:0:autGiven"]', (el, value) => el.value = value, first_name);

    kthid='u1d13i2c';
    await page.$eval('[id="addForm:authorSerie:0:j_id716"]', (el, value) => el.value = value, kthid);

    research_group='CCS';
    await page.$eval('[id="addForm:authorSerie:0:researchGroup"]', (el, value) => el.value = value, research_group);

    e_mail='maguire@kth.se';
    await page.$eval('[id="addForm:authorSerie:0:autEmail"]', (el, value) => el.value = value, e_mail);

    //org_COS='';
    //await page.$eval('[id="addForm:authorSerie:0:j_id736"]', (el, value) => el.value = value, org_COS);
    // Note that I cannot look for EECS in the test DiVA as it has only the old organization info
    await page.waitFor(2000);
    await page.click('[id="addForm:authorSerie:0:j_id736"]');
    console.info("click to select the department")

    //id="organisationPopupForm:organisationPopup"
    // await page.click('[id="organisationPopupForm:organisationPopup"]');
    await page.waitFor(3000);
    // organisationPopupForm:tree:n-9:j_id202
    await page.click('[id="organisationPopupForm:tree:n-9:j_id202"]'); // ICT
    await page.waitFor(2000);
    console.info("selected the department")

    //----------------------------------------------------------------------
    // Supervisor information (Supervisor1)
    last_name='Västberg';
    await page.$eval('[id="addForm:supervisorSerie:0:supFamily"]', (el, value) => el.value = value, last_name);

    first_name='Anders';
    await page.$eval('[id="addForm:supervisorSerie:0:supGiven"]', (el, value) => el.value = value, first_name);

    academic_title='universitetslektor';
    await page.$eval('[id="addForm:supervisorSerie:0:supTitle"]', (el, value) => el.value = value, academic_title);

    kthid='u1ft3a12';
    await page.$eval('[id="addForm:supervisorSerie:0:j_id1200"]', (el, value) => el.value = value, kthid);

    orcid='0000-0002-4226-9652'
    await page.$eval('[id="addForm:supervisorSerie:0:j_id1205"]', (el, value) => el.value = value, orcid);

    e_mail='vastberg@kth.se';
    await page.$eval('[id="addForm:supervisorSerie:0:supEmail"]', (el, value) => el.value = value, e_mail);

    //org_COS='';
    //await page.$eval('[id="addForm:authorSerie:0:j_id736"]', (el, value) => el.value = value, org_COS);
    // Note that I cannot look for EECS in the test DiVA as it has only the old organization info

    await page.click('[id="addForm:supervisorSerie:0:j_id1214');
    console.info("click to select the department")

    //id="organisationPopupForm:organisationPopup"
    // await page.click('[id="organisationPopupForm:organisationPopup"]');
    await page.waitFor(3000);
    // organisationPopupForm:tree:n-9:j_id202
    await page.click('[id="organisationPopupForm:tree:n-9:j_id202"]'); // ICT
    await page.waitFor(1000);
    console.info("selected the department")

    await page.waitFor(2000);
    //----------------------------------------------------------------------
    // Supervisor information (Supervisor2)
    last_name='Normal';
    await page.$eval('[id="addForm:supervisorSerie:1:supFamily"]', (el, value) => el.value = value, last_name);

    first_name='A. B.';
    await page.$eval('[id="addForm:supervisorSerie:1:supGiven"]', (el, value) => el.value = value, first_name);

    e_mail='ABNormal@example.org';
    await page.$eval('[id="addForm:supervisorSerie:1:supEmail"]', (el, value) => el.value = value, e_mail);

    orcid='xxxx'
    await page.$eval('[id="addForm:supervisorSerie:1:j_id1205"]', (el, value) => el.value = value, orcid);

    otherOrg='Famous Anvils'
    await page.$eval('[id="addForm:supervisorSerie:1:j_id1227"]', (el, value) => el.value = value, otherOrg);

    //----------------------------------------------------------------------
    // Examiner information
    last_name='Maguire Jr.';
    await page.$eval('[id="addForm:examinerSerie:0:examinerFamily"]', (el, value) => el.value = value, last_name);

    first_name='Gerald Q.';
    await page.$eval('[id="addForm:examinerSerie:0:examinerGiven"]', (el, value) => el.value = value, first_name);

    academic_title='professor';
    await page.$eval('[id="addForm:examinerSerie:0:examinerTitle"]', (el, value) => el.value = value, academic_title);

    kthid='u1d13i2c';
    await page.$eval('[id="addForm:examinerSerie:0:j_id1279"]', (el, value) => el.value = value, kthid);

    orcid='0000-0002-6066-746X'
    await page.$eval('[id="addForm:examinerSerie:0:j_id1284"]', (el, value) => el.value = value, orcid);

    e_mail='maguire@kth.se';
    await page.$eval('[id="addForm:authorSerie:0:autEmail"]', (el, value) => el.value = value, e_mail);

    //org_COS='';
    //await page.$eval('[id="addForm:authorSerie:0:j_id736"]', (el, value) => el.value = value, org_COS);
    // Note that I cannot look for EECS in the test DiVA as it has only the old organization info
    await page.waitFor(1000);
    await page.click('[id="addForm:examinerSerie:0:j_id1293"]');
    console.info("click to select the department")

    //id="organisationPopupForm:organisationPopup"
    // await page.click('[id="organisationPopupForm:organisationPopup"]');
    await page.waitFor(3000);
    // organisationPopupForm:tree:n-9:j_id202
    await page.click('[id="organisationPopupForm:tree:n-9:j_id202"]'); // ICT
    await page.waitFor(1000);
    console.info("selected the department")
    //----------------------------------------------------------------------

    let long_eng_title;
    let long_eng_subtitle;
    let long_swe_title;
    let long_swe_subtitle;
    
    long_eng_title="This is a long title in English";
    long_eng_subtitle="This is an even longer subtitle in English";
    //await page.$eval('[id="addForm:j_id803"]', (el, value) => el.value = value, long_eng_title);
    //await page.$eval('[id="addForm:j_id807"]', (el, value) => el.value = value, long_eng_subtitle);
    //    await page.click('[id="addForm:j_id807_ifr"]');
    //await page.waitFor(1000);
    //await page.keyboard.sendCharacter(long_eng_subtitle);
    //await page.waitFor(1000);

    // await page.focus('[id="addForm:j_id803"]');
    // await page.keyboard.press( 'End' );
    // await page.keyboard.type('This is a second text');
    
    // await page.focus('[id="addForm:j_id803"]');
    // await page.keyboard.press( 'End' );
    // await page.keyboard.type('This is a second text');


    //await page.focus('[id=""addForm:j_id686"]');
    //await page.keyboard.press( 'End' );
    //await page.keyboard.type('This is a third text');

    // The following method of entering a title works, but the method using the setMCEbody() provides a wrapper for this
    // const iframeElement = await page.$('[id="addForm:j_id803_ifr"]'); // you have to append '_ifr' to the ID to get the inner iframe
    // const iframe = await iframeElement.contentFrame();
    
    // iframe.evaluate(() => {
    //     document.body.innerHTML = '<span style="color: green;">Title inserted. Done!</span>';
    // });

    await setMCEbody(page, "addForm:j_id803", long_eng_title);
    await setMCEbody(page, "addForm:j_id807", long_eng_subtitle);
    await textAreaLang(page, textareaHandles, textAreaContent, 'Title', 'eng');

    // t1=document.querySelectorAll('[id="addForm:j_id803_ifr"]')

    long_swe_title="Detta är en lång titel på svenska";
    long_swe_subtitle="Detta är en ännu längre undertexter på svenska";
    await setMCEbody(page, "addForm:j_id814:0:j_id831", long_swe_title);
    await setMCEbody(page, "addForm:j_id814:0:j_id835", long_swe_subtitle);
    await textAreaLang(page, textareaHandles, textAreaContent, 'Alternative title', 'swe');


    //    await page.$eval('[id="addForm:j_id814:0:j_id831"]', (el, value) => el.value = value, long_swe_title);
    //    await page.$eval('[id="addForm:j_id814:0:j_id835"]', (el, value) => el.value = value, long_swe_subtitle);

    // abstracts
    
    let long_eng_abstract;
    long_eng_abstract='<p>This is a abstract for an non existant thesis about F<sup>18</sup></p>'
    await setMCEbody(page, "addForm:j_id1122:0:j_id1140", long_eng_abstract);
    long_swe_abstract='<p>Detta är ett abstrakt för en icke-existerande avhandling om F<sup>18</sup></p>'
    await setMCEbody(page, "addForm:j_id1122:1:j_id1140", long_swe_abstract);

    // Keywords
    eng_keyowrds='Fee,Foo,Fum'
    await page.$eval('[id="addForm:keywordList:0:j_id1114"]', (el, value) => el.value = value, eng_keyowrds);
    swe_keyowrds='Fåå,Fää,Fööm'
    await page.$eval('[id="addForm:keywordList:1:j_id1114"]', (el, value) => el.value = value, swe_keyowrds);

    // Other information
    pub_year='2019'
    await page.$eval('[id="addForm:j_id913"]', (el, value) => el.value = value, pub_year);
    page_range='xiii,72'
    await page.$eval('[id="addForm:j_id918"]', (el, value) => el.value = value, page_range);
    await page.waitFor(500);

    // Cooperation
    // if yes, add 
    partner_name='ABBBBA';
    status = await page.$eval('[id="addForm:j_id778:0:j_id780"]', (el, value) => el.value = value, partner_name);
    console.info("status of setting partner_name is ", status);

    await page.waitFor(500);
    let partner_name_check;
    partner_name_check = await page.evaluate(() => {
	const t1=document.querySelector('[id="addForm:j_id778:0:j_id780"]').value
	return t1;
    });
    console.info("partner_name_check is ", partner_name_check);

    // else click no
    //await page.click('[id="addForm:extCoop:_2"]'); // No
    await page.waitFor(1000);

    // Notes
    cautionary_note='<p><span style="color: red;">A completely bogus entry for testing with Puppeteer.</span></p>';
    await setMCEbody(page, "addForm:notes", cautionary_note);

    // Degree
    // Level
    // <option value="H1">Independent thesis Advanced level (degree of Master (One Year))</option>
    // <option value="H2">Independent thesis Advanced level (degree of Master (Two Years))</option>
    // <option value="H3">Independent thesis Advanced level (professional degree)</option>
    // <option value="M2">Independent thesis Basic level (degree of Bachelor)</option>
    // <option value="M3">Independent thesis Basic level (professional degree)</option>
    // <option value="M1">Independent thesis Basic level (university diploma)</option>
    // <option value="L1">Student paper first term</option>
    // <option value="L3">Student paper other</option>
    // <option value="L2">Student paper second term</option>
    degree_level='M2';
    await page.$eval('[id="addForm:j_id841:0:level"]', (el, value) => el.value = value, degree_level);

    // <option value="5">7,5 HE credits</option>
    // <option value="7">10 HE credits</option>
    // <option value="8">12 HE credits</option>
    // <option value="10">15 HE credits</option>
    // <option value="12">18 HE credits</option>
    // <option value="15">22,5 HE credits</option>
    // <option value="16">16 HE credits</option>
    // <option value="17">20 HE credits</option>
    // <option value="20">30 HE credits</option>
    // <option value="25">37,5 HE credits</option>
    // <option value="30">45 HE credits</option>
    // <option value="40">60 HE credits</option>
    // <option value="60">90 HE credits</option>
    // <option value="80">120 HE credits</option>
    // <option value="120">180 HE credits</option>
    // <option value="140">210 HE credits</option>
    // <option value="160">240 HE credits</option>
    // <option value="200">300 HE credits</option>
    // <option value="220">330 HE credits</option></select>    
    degree_credits='10';
    await page.$eval('[id="addForm:j_id841:0:creditsSelectMenu"]', (el, value) => el.value = value, degree_credits);

    // <option value="10522">Bachelor of Science in Engineering</option>
    // <option value="9800">&nbsp;&nbsp;&nbsp;&nbsp;Bachelor of Science in Engineering -  Constructional Engineering and Design</option>
    // <option value="9801">&nbsp;&nbsp;&nbsp;&nbsp;Bachelor of Science in Engineering -  Constructional Engineering and Economics</option>
    // <option value="9880">&nbsp;&nbsp;&nbsp;&nbsp;Bachelor of Science in Engineering - Chemical Engineering</option>
    // <option value="9989">&nbsp;&nbsp;&nbsp;&nbsp;Bachelor of Science in Engineering - Computer Engineering and Economics</option>
    // <option value="9921">&nbsp;&nbsp;&nbsp;&nbsp;Bachelor of Science in Engineering - Computer Engineering</option>
    // <option value="9990">&nbsp;&nbsp;&nbsp;&nbsp;Bachelor of Science in Engineering - Computer Engineering</option>
    // <option value="10751">&nbsp;&nbsp;&nbsp;&nbsp;Bachelor of Science in Engineering - Constructional Engineering and Health</option>
    // <option value="9949">&nbsp;&nbsp;&nbsp;&nbsp;Bachelor of Science in Engineering - Electrical Engineering and Economics</option>
    // <option value="9907">&nbsp;&nbsp;&nbsp;&nbsp;Bachelor of Science in Engineering - Electrical Engineering</option>
    // <option value="9948">&nbsp;&nbsp;&nbsp;&nbsp;Bachelor of Science in Engineering - Electrical Engineering</option>
    // <option value="9922">&nbsp;&nbsp;&nbsp;&nbsp;Bachelor of Science in Engineering - Electronics and Computer Engineering</option>
    // <option value="9992">&nbsp;&nbsp;&nbsp;&nbsp;Bachelor of Science in Engineering - Engineering and Economics</option>
    // <option value="9951">&nbsp;&nbsp;&nbsp;&nbsp;Bachelor of Science in Engineering - Mechanical Engineering and Economics</option>
    // <option value="9950">&nbsp;&nbsp;&nbsp;&nbsp;Bachelor of Science in Engineering - Mechanical Engineering</option>
    // <option value="9991">&nbsp;&nbsp;&nbsp;&nbsp;Bachelor of Science in Engineering - Medical Technology</option>
    // <option value="10523">Bachelor of Science</option>
    // <option value="10950">&nbsp;&nbsp;&nbsp;&nbsp;Bachelor of Science - Architecture</option>
    // <option value="9924">&nbsp;&nbsp;&nbsp;&nbsp;Bachelor of Science - Business Engineering</option>
    // <option value="17650">&nbsp;&nbsp;&nbsp;&nbsp;Bachelor of Science - Energy and Environment</option>
    // <option value="9925">&nbsp;&nbsp;&nbsp;&nbsp;Bachelor of Science - Information and Communication Technology</option>
    // <option value="9994">&nbsp;&nbsp;&nbsp;&nbsp;Bachelor of Science - Medical Informatics</option>
    // <option value="9805">&nbsp;&nbsp;&nbsp;&nbsp;Bachelor of Science - Property Development and Agency</option>
    // <option value="9804">&nbsp;&nbsp;&nbsp;&nbsp;Bachelor of Science - Real Estate and Finance</option>
    // <option value="9892">&nbsp;&nbsp;&nbsp;&nbsp;Bachelor of Science - Simulation Technology and Virtual Design</option>
    // <option value="10524">Degree of Master</option>
    // <option value="9858">&nbsp;&nbsp;&nbsp;&nbsp;Degree of Master - Design and Building</option>
    // <option value="9956">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - Applied Logistics</option>
    // <option value="9999">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - Architectural Lighting Design</option>
    // <option value="9997">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - Computer Networks</option>
    // <option value="9953">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - Entrepreneurship and Innovation Management</option>
    // <option value="9998">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - Ergonomics and Human-Technology-Organisation</option>
    // <option value="9954">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - Product Realisation</option>
    // <option value="9955">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - Project Management and Operational Development</option>
    // <option value="9996">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - Work and Health</option>
    // <option value="14553">&nbsp;&nbsp;&nbsp;&nbsp;Teknologie magisterexamen - Teknik, hälsa och arbetsmiljöutveckling</option>
    // <option value="10525">Degree of Master</option>
    // <option value="9850">&nbsp;&nbsp;&nbsp;&nbsp;Degree of Master -  Architectural Enginering</option>
    // <option value="28050">&nbsp;&nbsp;&nbsp;&nbsp;Degree of Master -  Urbanism Studies</option>
    // <option value="9882">&nbsp;&nbsp;&nbsp;&nbsp;Degree of Master - Chemical Engineering for Energy and Environment</option>
    // <option value="24400">&nbsp;&nbsp;&nbsp;&nbsp;Degree of Master - Civil and Architectural Engineering</option>
    // <option value="9864">&nbsp;&nbsp;&nbsp;&nbsp;Degree of Master - Economics of Innovation and Growth</option>
    // <option value="9863">&nbsp;&nbsp;&nbsp;&nbsp;Degree of Master - Environmental Engineering and Sustainable Infrastructure</option>
    // <option value="9862">&nbsp;&nbsp;&nbsp;&nbsp;Degree of Master - Geodesy and Geoinformatics</option>
    // <option value="9865">&nbsp;&nbsp;&nbsp;&nbsp;Degree of Master - Infrastructure Engineering</option>
    // <option value="9868">&nbsp;&nbsp;&nbsp;&nbsp;Degree of Master - Land Management</option>
    // <option value="9883">&nbsp;&nbsp;&nbsp;&nbsp;Degree of Master - Macromolecular Materials</option>
    // <option value="9885">&nbsp;&nbsp;&nbsp;&nbsp;Degree of Master - Materials and Sensors System for Environmental Technologies</option>
    // <option value="9884">&nbsp;&nbsp;&nbsp;&nbsp;Degree of Master - Molecular Science and Engineering</option>
    // <option value="9861">&nbsp;&nbsp;&nbsp;&nbsp;Degree of Master - Real Estate Development and Financial Services</option>
    // <option value="13400">&nbsp;&nbsp;&nbsp;&nbsp;Degree of Master - Spatial Planning</option>
    // <option value="9552">&nbsp;&nbsp;&nbsp;&nbsp;Degree of Master - Sustainable Urban Planning and Design</option>
    // <option value="9866">&nbsp;&nbsp;&nbsp;&nbsp;Degree of Master - Transport Systems</option>
    // <option value="13401">&nbsp;&nbsp;&nbsp;&nbsp;Degree of Master - Urban Planning and Design</option>
    // <option value="9867">&nbsp;&nbsp;&nbsp;&nbsp;Degree of Master - Water System Technology</option>
    // <option value="9977">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - Aerospace Engineering</option>
    // <option value="23002">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - Applied and Computational Mathematics</option>
    // <option value="10001">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - Architectural Lighting Design and Health</option>
    // <option value="9860">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - Architecture</option>
    // <option value="9894">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - Computational and Systems Biology</option>
    // <option value="9875">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - Computational Chemistry and Computational Physics</option>
    // <option value="9895">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - Computer Science</option>
    // <option value="9901">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - Computer Simulation for Science and Engineering</option>
    // <option value="9930">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - Design and Implementation of ICT Products and Systems</option>
    // <option value="9938">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - Distributed Computing</option>
    // <option value="9910">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - Electric Power Engineering</option>
    // <option value="9909">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - Electrophysics</option>
    // <option value="9928">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - Embedded Systems</option>
    // <option value="9983">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - Engineeering Physics</option>
    // <option value="9935">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - Engineering and Management of Information Systems</option>
    // <option value="9962">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - Engineering Design</option>
    // <option value="9965">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - Engineering Materials Science</option>
    // <option value="9982">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - Engineering Mechanics</option>
    // <option value="9969">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - Environomical Pathways for Sustainable Energy Systems</option>
    // <option value="9899">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - Human-Computer Interaction</option>
    // <option value="9873">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - Industrial and Environmental Biotechnology</option>
    // <option value="9959">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - Industrial Engineering and Management</option>
    // <option value="9929">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - Information and Communication Systems Security</option>
    // <option value="9966">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - Innovative Sustainable Energy Engineering</option>
    // <option value="9963">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - Integrated Product Design</option>
    // <option value="9934">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - Interactive Systems Engineering</option>
    // <option value="13450">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - Internetworking</option>
    // <option value="9896">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - Machine Learning</option>
    // <option value="9968">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - Management and Engineering of Environment and Energy</option>
    // <option value="9984">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - Maritime Engineering</option>
    // <option value="11254">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - Materials Science and Engineering</option>
    // <option value="9981">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - Mathematics</option>
    // <option value="9897">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - Media Management</option>
    // <option value="9898">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - Media Technology</option>
    // <option value="9874">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - Medical Biotechnology</option>
    // <option value="10003">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - Medical Engineering</option>
    // <option value="9931">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - Nanotechnology</option>
    // <option value="9980">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - Naval Architecture</option>
    // <option value="9911">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - Network Services and Systems</option>
    // <option value="9979">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - Nuclear Energy Engineering</option>
    // <option value="9914">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - Nuclear Fusion Science and Engineering Physics</option>
    // <option value="9927">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - Photonics</option>
    // <option value="9961">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - Production Engineering and Management</option>
    // <option value="9859">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - Real Estate Management</option>
    // <option value="9915">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - School of Electrical Engineering (EES) - Master of Science - Research on Information and Communication Technologies</option>
    // <option value="9900">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - Scientific Computing</option>
    // <option value="9932">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - Software Engineering of Distributed Systems</option>
    // <option value="9958">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - Sustainable Energy Engineering</option>
    // <option value="9964">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - Sustainable Technology</option>
    // <option value="9933">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - System-on-Chip Design</option>
    // <option value="9902">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - Systems Biology</option>
    // <option value="9912">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - Systems, Control and Robotics</option>
    // <option value="21652">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - Transport and Geoinformation Technology</option>
    // <option value="9970">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - Turbomachinery Aeromechanic University Training</option>
    // <option value="9978">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - Vehicle Engineering</option>
    // <option value="9913">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science - Wireless Systems</option>
    // <option value="9939">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science -Communication Systems</option>
    // <option value="10002">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science -Medical Imaging</option>
    // <option value="9937">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science -Security and Mobile Computing</option>
    // <option value="10521">Higher Education Diploma</option>
    // <option value="9802">&nbsp;&nbsp;&nbsp;&nbsp;Higher Education Diploma - Construction Management</option>
    // <option value="9803">&nbsp;&nbsp;&nbsp;&nbsp;Higher Education Diploma - Constructional Technology and Real Estate Agency</option>
    // <option value="10520">Master of Architecture</option>
    // <option value="9558">&nbsp;&nbsp;&nbsp;&nbsp;Master of Architecture - Architecture</option>
    // <option value="10500">Master of Science in Engineering</option>
    // <option value="9905">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science in Engineering -  Electrical Engineering</option>
    // <option value="9871">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science in Engineering - Biotechnology</option>
    // <option value="9878">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science in Engineering - Chemical Science and Engineering</option>
    // <option value="9889">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science in Engineering - Computer Science and Technology</option>
    // <option value="9942">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science in Engineering - Design and Product Realisation</option>
    // <option value="9943">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science in Engineering - Energy and Environment</option>
    // <option value="9973">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science in Engineering - Engineering and of Education</option>
    // <option value="9944">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science in Engineering - Industrial Engineering and Management</option>
    // <option value="9918">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science in Engineering - Information and Communication Technology</option>
    // <option value="9946">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science in Engineering - Materials Design and Engineering</option>
    // <option value="9945">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science in Engineering - Mechanical Engineering</option>
    // <option value="9890">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science in Engineering - Media Technology</option>
    // <option value="9987">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science in Engineering - Medical Engineering</option>
    // <option value="9919">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science in Engineering - Microelectronics</option>
    // <option value="10526">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science in Engineering - Urban Management</option>
    // <option value="9974">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science in Engineering - Vehicle Engineering</option>
    // <option value="9975">&nbsp;&nbsp;&nbsp;&nbsp;Master of Science in Engineering -Engineering Physics</option>
    // <option value="9557">Z - School of Architecture and the Built Environment (ABE)</option>
    // <option value="9852">&nbsp;&nbsp;&nbsp;&nbsp;School of Architecture and the Built Environment (ABE)  - Master of Science in Engineering</option></select>
    degree_program='9990'; // Bachelor of Science in Engineering - Computer Engineering
    await page.$eval('[id="addForm:j_id841:0:j_id871"]', (el, value) => el.value = value, degree_program);

    // <option value="10260">Accelerator Technique</option>
    // <option value="10306">Aeronautical Engineering</option>
    // <option value="10261">Analytical Chemistry</option>
    // <option value="10262">Antenna Systems Technology</option>
    // <option value="10423">Applied Information Technology</option>
    // <option value="10424">Applied Logistics</option>
    // <option value="10426">Applied Material Physics</option>
    // <option value="10427">Applied Materials Technology</option>
    // <option value="10425">Applied Mathematical Analysis</option>
    // <option value="28053">Applied Mathematics and Industrial Economics</option>
    // <option value="10422">Applied Physics</option>
    // <option value="10428">Applied Process Metallurgy</option>
    // <option value="10369">Applied Thermodynamics</option>
    // <option value="10429">Applied Thermodynamics</option>
    // <option value="10258">Architectural Lighting Design and Health</option>
    // <option value="10349">Architectural Lighting Design</option>
    // <option value="10264">Architecture</option>
    // <option value="10397">Automatic Control</option>
    // <option value="10269">Biocomposites</option>
    // <option value="10410">Biomechanics</option>
    // <option value="10270">Biomedical Engineering</option>
    // <option value="10253">Biotechnology</option>
    // <option value="10271">Biotechnology</option>
    // <option value="10273">Building and Real Estate Economics</option>
    // <option value="10484">Building Design</option>
    // <option value="10275">Building Materials</option>
    // <option value="10471">Building Services Engineering and Energy</option>
    // <option value="10277">Building Technology</option>
    // <option value="10449">Building Technology</option>
    // <option value="10266">Built Environment Analysis</option>
    // <option value="10485">Built Environment</option>
    // <option value="10371">Casting of Metals</option>
    // <option value="10336">Ceramic Materials</option>
    // <option value="10337">Ceramics</option>
    // <option value="10335">Chemical Engineering</option>
    // <option value="10472">Chemical Science and Engineering</option>
    // <option value="10344">Circuit Electronics</option>
    // <option value="10481">Civil Engineering Management</option>
    // <option value="10338">Communication Networks</option>
    // <option value="10340">Communication Theory</option>
    // <option value="10339">Communications Systems</option>
    // <option value="10420">Computational Thermodynamics</option>
    // <option value="10279">Computer and Systems Sciences</option>
    // <option value="10281">Computer Communication</option>
    // <option value="10452">Computer Engineering with Business Economics</option>
    // <option value="10453">Computer Engineering with Industrial Economy</option>
    // <option value="10460">Computer Networks and Communication</option>
    // <option value="10282">Computer Networks</option>
    // <option value="10459">Computer Networks</option>
    // <option value="10280">Computer Science</option>
    // <option value="10283">Computer Systems</option>
    // <option value="10454">Computer Technology and Graphic Programming</option>
    // <option value="10456">Computer Technology and Real Time Programming</option>
    // <option value="10455">Computer Technology and Software Engineering</option>
    // <option value="10457">Computer Technology, Networks and Security</option>
    // <option value="10458">Computer Technology, Program- and System Development</option>
    // <option value="10268">Concrete Structures</option>
    // <option value="10341">Condensed Matter Physics</option>
    // <option value="10274">Construction Management and Economics</option>
    // <option value="10278">Construction Management</option>
    // <option value="10448">Constructional Design</option>
    // <option value="10450">Constructional Engineering and Design with Business Economics</option>
    // <option value="10451">Constructional Engineering and Design</option>
    // <option value="10342">Corrosion Science</option>
    // <option value="10284">Design and Building</option>
    // <option value="10445">Design and Product Development</option>
    // <option value="10446">Design and Vehicle Engineering</option>
    // <option value="10285">Discrete Mathematics</option>
    // <option value="10257">Economics of Innovation and Growth</option>
    // <option value="10289">Electric Power Systems</option>
    // <option value="10463">Electrical Engineering with Industrial Economy</option>
    // <option value="10295">Electrical Engineering</option>
    // <option value="10290">Electrical Machines and Drives</option>
    // <option value="10291">Electrical Machines and Power Electronic</option>
    // <option value="10287">Electrical Measurements</option>
    // <option value="10288">Electrical Plant Engineering</option>
    // <option value="10292">Electroacoustics</option>
    // <option value="10418">Electromagnetic Theory</option>
    // <option value="10294">Electronic System Design</option>
    // <option value="10293">Electronic- and Computer Systems</option>
    // <option value="10461">Electronics and Communications</option>
    // <option value="10462">Electronics Design</option>
    // <option value="10466">Embedded System Design</option>
    // <option value="10296">Energy and Climate Studies</option>
    // <option value="10297">Energy and Furnace Technology</option>
    // <option value="10298">Energy Processes</option>
    // <option value="10251">Energy Technology</option>
    // <option value="10487">Engineering and Management</option>
    // <option value="10415">Engineering Material Physics</option>
    // <option value="10488">Engineering Physics</option>
    // <option value="10255">Entrepreneurship and Innovation Management</option>
    // <option value="10376">Environmental Assessment</option>
    // <option value="10377">Environmental Strategies</option>
    // <option value="10300">Ergonomics</option>
    // <option value="10447">Facilities for Infrastructure</option>
    // <option value="10304">Fiber Technology</option>
    // <option value="10464">Finance</option>
    // <option value="28052">Financial Mathematics</option>
    // <option value="10402">Fluid Mechanics</option>
    // <option value="10316">Foundry Technology</option>
    // <option value="10309">Fusion Plasma Physics</option>
    // <option value="10314">Geodesy</option>
    // <option value="10315">Geoinformatics</option>
    // <option value="10317">Ground Water Chemistry</option>
    // <option value="10440">Heat Transfer</option>
    // <option value="10435">Heating and Ventilating Technology</option>
    // <option value="10321">High Voltage Engineering</option>
    // <option value="10439">Highway Engineering</option>
    // <option value="10412">History of Technology</option>
    // <option value="10380">Human - Computer Interaction</option>
    // <option value="10437">Hydraulic Engineering</option>
    // <option value="10322">Industrial Biotechnology</option>
    // <option value="10469">Industrial Business Administration and Manufacturing</option>
    // <option value="10327">Industrial Control Systems</option>
    // <option value="10323">Industrial Design</option>
    // <option value="10324">Industrial Ecology</option>
    // <option value="10325">Industrial Economics and Management</option>
    // <option value="10468">Industrial Economy and Entrepreneurship</option>
    // <option value="10467">Industrial IT</option>
    // <option value="10329">Information and Communication Technology</option>
    // <option value="10328">Information and Software Systems</option>
    // <option value="10330">Information Technology</option>
    // <option value="10470">Innovation and Design</option>
    // <option value="10382">Inorganic Chemistry</option>
    // <option value="10331">Integrated Product Development</option>
    // <option value="10313">Internal Combustion Engineering</option>
    // <option value="10354">Land and Water Resources</option>
    // <option value="10254">Land Management</option>
    // <option value="10352">Lightweight Structures</option>
    // <option value="10475">Logistics, Business Administration and Manufacturing</option>
    // <option value="10350">Logistics</option>
    // <option value="10356">Machine Design</option>
    // <option value="10351">Machine Elements</option>
    // <option value="10355">Machine Elements</option>
    // <option value="10363">Material Physics</option>
    // <option value="10360">Materials and Process Design</option>
    // <option value="10444">Materials Design and Engineering</option>
    // <option value="10361">Materials Processing</option>
    // <option value="10478">Materials Science and Engineering</option>
    // <option value="10359">Mathematical Statistics</option>
    // <option value="10358">Mathematics</option>
    // <option value="10473">Mechanical Design</option>
    // <option value="10477">Mechanical Engineering with Industrial Economy</option>
    // <option value="10476">Mechanical Engineering</option>
    // <option value="10368">Mechanical Metallurgy</option>
    // <option value="10367">Mechanics</option>
    // <option value="10479">Mechatronics and Robotics</option>
    // <option value="10370">Mechatronics</option>
    // <option value="10366">Media Technology</option>
    // <option value="10365">Medical Engineering</option>
    // <option value="10364">Medical Imaging</option>
    // <option value="10265">Metal Working</option>
    // <option value="10375">Micro Modelling in Process Science</option>
    // <option value="10373">Microcomputer Systems</option>
    // <option value="10374">Microelectronics and Applied Physics</option>
    // <option value="10480">Mobile Communications Systems</option>
    // <option value="10378">Molecular Biotechnology</option>
    // <option value="10379">Music Acoustics</option>
    // <option value="10353">Naval Systems</option>
    // <option value="10346">Nuclear Chemistry</option>
    // <option value="10395">Nuclear Reactor Engineering</option>
    // <option value="10381">Numerical Analysis</option>
    // <option value="10383">Optics</option>
    // <option value="10384">Optimization and Systems Theory</option>
    // <option value="10385">Organic Chemistry</option>
    // <option value="10386">Paper Technology</option>
    // <option value="10305">Philosophy</option>
    // <option value="10308">Photonics with Microwave Engineering</option>
    // <option value="10312">Physical Chemistry</option>
    // <option value="10311">Physical Electrotechnology</option>
    // <option value="10372">Physical Metallurgy</option>
    // <option value="10310">Physics</option>
    // <option value="10431">Planning of Traffic and Transportation</option>
    // <option value="10387">Plasma Physics</option>
    // <option value="10389">Polymer Technology</option>
    // <option value="10388">Polymeric Materials</option>
    // <option value="10286">Power Electronics</option>
    // <option value="10362">Process Science of Materials</option>
    // <option value="10390">Product Realisation and Management</option>
    // <option value="10326">Production Engineering</option>
    // <option value="10319">Project in Fluid Power</option>
    // <option value="10392">Project Management and Operational Development</option>
    // <option value="10357">Pulp Technology</option>
    // <option value="10394">Radio Communication Systems</option>
    // <option value="10393">Radio Electronics</option>
    // <option value="10333">Railway Operation</option>
    // <option value="10334">Railway Technology</option>
    // <option value="10347">Reactor Safety</option>
    // <option value="10252">Real Estate Development and Land Law</option>
    // <option value="10302">Real Estate Economics</option>
    // <option value="10465">Real Estate Management</option>
    // <option value="10303">Real Estate Planning</option>
    // <option value="10345">Refrigerating Engineering</option>
    // <option value="10396">Regional Planning</option>
    // <option value="10421">Reliability Centred Asset Management for Electrical Power Systems</option>
    // <option value="10398">Risk and Safety</option>
    // <option value="10407">Safety Research</option>
    // <option value="10267">Scientific Computing</option>
    // <option value="10318">Semiconductor Materials</option>
    // <option value="10400">Signal Processing</option>
    // <option value="10483">Software Design</option>
    // <option value="10391">Software Engineering</option>
    // <option value="10482">Software Engineering</option>
    // <option value="10332">Soil and Rock Mechanics</option>
    // <option value="10320">Solid Mechanics</option>
    // <option value="10301">Solid State Electronics</option>
    // <option value="10348">Sound and Image Processing</option>
    // <option value="10443">Space and Plasma Physics</option>
    // <option value="10399">Space Physics</option>
    // <option value="10408">Speech Communication</option>
    // <option value="10409">Speech Communication</option>
    // <option value="10403">Steel Structures</option>
    // <option value="10272">Structural Design and Bridges</option>
    // <option value="10474">Structural Engineering</option>
    // <option value="10276">Structural Mechanics and Engineering</option>
    // <option value="10442">Surface Chemistry</option>
    // <option value="10441">Surface Coating Technology</option>
    // <option value="10414">Surveying</option>
    // <option value="10436">Sustainable Buildings</option>
    // <option value="10750">Sustainable development</option>
    // <option value="10486">System Engineering</option>
    // <option value="10404">System-on-Chip</option>
    // <option value="10405">Systems Analysis and Economics</option>
    // <option value="10406">Systems Engineering</option>
    // <option value="10413">Technical Acoustics</option>
    // <option value="10411">Technology and Learning</option>
    // <option value="10489">Tele and Data Communication</option>
    // <option value="10417">Telecommunication Systems</option>
    // <option value="10416">Teleinformatics</option>
    // <option value="10419">Theoretical Physics</option>
    // <option value="10343">Thermal Engineering</option>
    // <option value="10430">Traffic and Transport Planning</option>
    // <option value="10432">Transport- and Location Analysis</option>
    // <option value="20650">Urban and Regional Planning</option>
    // <option value="10401">Urban Planning and Design</option>
    // <option value="10307">Vehicle Engineering</option>
    // <option value="10438">Water Resources Engineering</option>
    // <option value="10259">Water, Sewage and Waste</option>
    // <option value="10433">Wood Chemistry</option>
    // <option value="10434">Wood Technology and Processing</option>
    // <option value="10263">Work Science</option></select>
    degree_subject='10339'; //Communications Systems
    await page.$eval('[id="addForm:j_id841:0:j_id876"]', (el, value) => el.value = value, degree_subject);

    // Series
    // <option value="129">Arbete och Hälsa (Closed down 2008-09-02)</option>
    // <option value="7001">CESIS Working Paper Series in Economics and Institutions of Innovation</option>
    // <option value="8600">CTL Technical Report</option>
    // <option value="10150">CTS - Working papers in Transport Economics</option>
    // <option value="6700">EES Examensarbete / Master Thesis</option>
    // <option value="5956">Examensarbete Byggnadsteknik</option>
    // <option value="6250">Examensarbete INDEK</option>
    // <option value="7250">Examensarbete Installationsteknik</option>
    // <option value="6500">Examensarbete Jord- och bergmekanik, 1652-599X</option>
    // <option value="157">Fotogrammetriska meddelanden (Closed down 2008-09-02)</option>
    // <option value="139">FOU-rapport (Closed down 2008-09-02)</option>
    // <option value="7951">Kandidatexjobb CSC</option>
    // <option value="212">Klimat och byggnader (Closed down 2008-09-02)</option>
    // <option value="144">Kärnkraftsäkerhet (Closed down 2008-09-02)</option>
    // <option value="253">Meddelande, 0348-9469</option>
    // <option value="194">Meddelande. Inst för Infrastruktur (Closed down 2008-09-02)</option>
    // <option value="198">Meddelande. Inst. för byggnadsteknik, 0346-5918 (Closed down 2008-09-02)</option>
    // <option value="128">Meddelande. Inst. för fastigheter och byggande (Closed down 2008-09-02)</option>
    // <option value="145">Meddelande. Inst. för fastighetsteknik (Closed down 2008-09-02)</option>
    // <option value="180">Meddelande. Installationsteknik (Closed down 2008-09-02)</option>
    // <option value="225">Meddelande. Institutionen för byggvetenskap, 1651-5536</option>
    // <option value="193">Rapport MT (Closed down 2008-09-02)</option>
    // <option value="125">Report series / DSV, 1101-8526</option>
    // <option value="162">Report series. DSV (Closed down 2008-09-02)</option>
    // <option value="196">Report. Department of Aeronautics (Closed down 2008-09-02)</option>
    // <option value="155">Rättsvetenskapliga biblioteket (Closed down 2008-09-02)</option>
    // <option value="136">Skriftserie (Closed down 2008-09-02)</option>
    // <option value="5955">SoM EX</option>
    // <option value="7501">SoM EX KAND</option>
    // <option value="147">Stoftanalys (Closed down 2008-09-02)</option>
    // <option value="5954">TEC-MT</option>
    // <option value="9800">Testserie, 1717-1717</option>
    // <option value="14752">Testserie - ventilbasun</option>
    // <option value="153">Theses in philosophy from RIT (Closed down 2008-09-02)</option>
    // <option value="7450">Theses in philosophy from the Royal Institute of Technology, 1650-8831</option>
    // <option value="111">Theses in Risk and Safety from the Division of Philosophy at the Royal Institute of Technology, 1654-627X</option>
    // <option value="6201">TMT</option>
    // <option value="195">TRITA-AFT (Closed down 2008-09-02)</option>
    // <option value="171">TRITA-ALP (Closed down 2008-09-02)</option>
    // <option value="232">TRITA-ALP, 1103-6613</option>
    // <option value="164">TRITA-AMI. LIC (Closed down 2008-09-02)</option>
    // <option value="158">TRITA-AMI. PDH (Closed down 2008-09-02)</option>
    // <option value="137">TRITA-AMI. PHD (Closed down 2008-09-02)</option>
    // <option value="191">TRITA-ARK (Closed down 2008-09-02)</option>
    // <option value="118">TRITA-ARK. Akademisk avhandling, 1402-7461</option>
    // <option value="100">TRITA-ARK. Forskningspublikationer, 1402-7453</option>
    // <option value="130">TRITA-AVE, 1651-7660</option>
    // <option value="213">TRITA-BFE (Closed down 2008-09-02)</option>
    // <option value="231">TRITA-BFE, 1104-4101</option>
    // <option value="255">TRITA-BIO-Report, 1654-2312</option>
    // <option value="5953">TRITA-BKN-Examensarbete, 1103-4297</option>
    // <option value="113">TRITA-BKN. Bulletin, 1103-4270</option>
    // <option value="200">TRITA-BYMA (Closed down 2008-09-02)</option>
    // <option value="234">TRITA-BYMA, 0349-5752</option>
    // <option value="199">TRITA-BYT (Closed down 2008-02-15)</option>
    // <option value="11001">TRITA-BYTE</option>
    // <option value="254">TRITA-CHE-Report, 1654-1081</option>
    // <option value="245">TRITA-CSC-A, 1653-5723</option>
    // <option value="7950">TRITA-CSC-E, 1653-5715</option>
    // <option value="185">TRITA-DKT (Closed down 2008-09-02)</option>
    // <option value="12300">TRITA-ECE</option>
    // <option value="13900">TRITA-ECE-EX</option>
    // <option value="14700">TRITA-ECS Report</option>
    // <option value="156">TRITA-EDS (Closed down 2008-09-02)</option>
    // <option value="243">TRITA-EE, 1653-5146</option>
    // <option value="165">TRITA-EEA (Closed down 2008-09-02)</option>
    // <option value="219">TRITA-EES (Closed down 2008-09-02)</option>
    // <option value="163">TRITA-EHE (Closed down 2008-09-02)</option>
    // <option value="140">TRITA-EIE (Closed down 2008-09-02)</option>
    // <option value="216">TRITA-EKS (Closed down 2008-09-02)</option>
    // <option value="109">TRITA-EKT, 1650-8599</option>
    // <option value="166">TRITA-ELA (Closed down 2008-09-02)</option>
    // <option value="203">TRITA-EMD (Closed down 2008-09-02)</option>
    // <option value="188">TRITA-EME (Closed down 2008-09-02)</option>
    // <option value="242">TRITA-EME, 1404-8248</option>
    // <option value="202">TRITA-ESD (Closed down 2008-09-02)</option>
    // <option value="112">TRITA-ETS, 1650-674X</option>
    // <option value="204">TRITA-EUV (Closed down 2008-09-02)</option>
    // <option value="169">TRITA-FAT, 0348-9469 (Closed down 2008-09-02)</option>
    // <option value="184">TRITA-FKT (Closed down 2008-09-02)</option>
    // <option value="5550">TRITA-FOB</option>
    // <option value="154">TRITA-FPT (Closed down 2008-09-02)</option>
    // <option value="110">TRITA-FPT-Report, 1652-2443</option>
    // <option value="98">TRITA-FTE, 0284-0545</option>
    // <option value="150">TRITA-FTP (Closed down 2008-09-02)</option>
    // <option value="122">TRITA-FYK</option>
    // <option value="99">TRITA-FYS, 0280-316X</option>
    // <option value="181">TRITA-GEOFOTO (Closed down 2008-09-02)</option>
    // <option value="12100">TRITA-GIT EX</option>
    // <option value="209">TRITA-GRT (Closed down 2008-09-02)</option>
    // <option value="132">TRITA-HFL. Rapport/ Institutionen för hållfasthetslära, KTH, 1654-1472</option>
    // <option value="97">TRITA-HMA, 1404-0379</option>
    // <option value="187">TRITA-HOT (Closed down 2008-09-02)</option>
    // <option value="229">TRITA-HOT, 0349-2842</option>
    // <option value="249">TRITA-HST, 1103-5277</option>
    // <option value="11002">TRITA-HYD</option>
    // <option value="131">TRITA-ICS, 1104-3504</option>
    // <option value="14350">TRITA-ICT</option>
    // <option value="247">TRITA-ICT-COS, 1653-6347 (Closed down 2016-01-01)</option>
    // <option value="250">TRITA-ICT-ECS AVH, 1653-6363</option>
    // <option value="5952">TRITA-ICT-EX</option>
    // <option value="252">TRITA-ICT/MAP</option>
    // <option value="2650">TRITA-ICT/MAP AVH, 1653-7610</option>
    // <option value="201">TRITA-IEO (Closed down 2008-09-02)</option>
    // <option value="228">TRITA-IEO, 1100-7982</option>
    // <option value="11003">TRITA-IES</option>
    // <option value="101">TRITA-IIP, 1650-1888</option>
    // <option value="116">TRITA-ILA, 0281-2878</option>
    // <option value="6200">TRITA-IM, 1402-7615</option>
    // <option value="10453">TRITA-IM-EX</option>
    // <option value="142">TRITA-IMA (Closed down 2008-09-02)</option>
    // <option value="208">TRITA-IMIT-LCN. AVH (Closed down 2008-09-02)</option>
    // <option value="239">TRITA-IMIT-LCN. AVH, 1651-4106</option>
    // <option value="149">TRITA-IMIT-TSLAB. AVH (Closed down 2008-09-02)</option>
    // <option value="222">TRITA-IMIT-TSLAB. AVH</option>
    // <option value="95">TRITA-IMIT. LECS, 1651-4076</option>
    // <option value="175">TRITA-IMIT. TSLAB (Closed down 2008-09-02)</option>
    // <option value="103">TRITA-INFRA, 1651-0216</option>
    // <option value="5000">TRITA-INFRA-FMS, 1652-5442</option>
    // <option value="14753">TRITA-INFRA-FMS-PHD</option>
    // <option value="159">TRITA-INFRA. EX (Closed down 2008-09-02)</option>
    // <option value="105">TRITA-IOK, 1100-7974</option>
    // <option value="148">TRITA-IP (Closed down 2008-09-02)</option>
    // <option value="182">TRITA-IP. FR (Closed down 2008-09-02)</option>
    // <option value="160">TRITA-IT (Closed down 2008-09-02)</option>
    // <option value="141">TRITA-IT-AVH (Closed down 2008-09-02)</option>
    // <option value="152">TRITA-IT-R (Closed down 2008-09-02)</option>
    // <option value="190">TRITA-IT. AVH (Closed down 2008-09-02)</option>
    // <option value="168">TRITA-JOB (Closed down 2008-09-02)</option>
    // <option value="226">TRITA-JOB PHD, 1650-9501</option>
    // <option value="172">TRITA-JOB. LIC (Closed down 2008-09-02)</option>
    // <option value="241">TRITA-JOB. LIC, 1650-951X</option>
    // <option value="146">TRITA-JOB. PHD (Closed down 2008-09-02)</option>
    // <option value="108">TRITA-KET, 1104-3466</option>
    // <option value="215">TRITA-KET-IM (Closed down 2008-09-02)</option>
    // <option value="233">TRITA-KET-IM, 1402-7615</option>
    // <option value="117">TRITA-KKE, 0349-6465</option>
    // <option value="174">TRITA-KRV (Closed down 2008-09-02)</option>
    // <option value="227">TRITA-KRV, 1100-7990</option>
    // <option value="7750">TRITA-KTH-CEFIN-SR, 1653-7335</option>
    // <option value="151">TRITA-KTH. R (Closed down 2008-09-02)</option>
    // <option value="10200">TRITA-LIB, 0346-9042</option>
    // <option value="256">TRITA-LWR Report, 1650-8610</option>
    // <option value="217">TRITA-LWR. LIC (Closed down 2008-09-02)</option>
    // <option value="230">TRITA-LWR. LIC, 1650-8629</option>
    // <option value="104">TRITA-LWR. PHD, 1650-8602</option>
    // <option value="107">TRITA-MAT, 1401-2286</option>
    // <option value="10450">TRITA-MAT-A</option>
    // <option value="8500">TRITA-MAT-E</option>
    // <option value="11601">TRITA-MAT-K</option>
    // <option value="120">TRITA-MAT. MA, 1401-2278</option>
    // <option value="135">TRITA-MAT. MS (Closed down 2008-09-02)</option>
    // <option value="121">TRITA-MAT. OS, 1401-2294</option>
    // <option value="161">TRITA-MB (Closed down 2008-09-02)</option>
    // <option value="133">TRITA-MB. AVH (Closed down 2008-09-02)</option>
    // <option value="183">TRITA-MEB (Closed down 2008-09-02)</option>
    // <option value="134">TRITA-MEK, 0348-467X</option>
    // <option value="197">TRITA-MEL (Closed down 2008-09-02)</option>
    // <option value="186">TRITA-MET (Closed down 2008-09-02)</option>
    // <option value="246">TRITA-MF</option>
    // <option value="106">TRITA-MG, 1104-7127</option>
    // <option value="143">TRITA-MG. AVH (Closed down 2008-09-02)</option>
    // <option value="115">TRITA-MMK, 1400-1179</option>
    // <option value="178">TRITA-MSM (Closed down 2008-09-02)</option>
    // <option value="207">TRITA-MT (Closed down 2008-09-02)</option>
    // <option value="114">TRITA-MVT, 0348-4467</option>
    // <option value="124">TRITA-NA, 0348-2952</option>
    // <option value="205">TRITA-NA-P (Closed down 2008-09-02)</option>
    // <option value="214">TRITA-OOK (Closed down 2008-09-02)</option>
    // <option value="223">TRITA-OOK, 0348-825X</option>
    // <option value="220">TRITA-PM (Closed down 2008-09-02)</option>
    // <option value="176">TRITA-PMT (Closed down 2008-09-02)</option>
    // <option value="119">TRITA-REFR, 1102-0245</option>
    // <option value="173">TRITA-REG (Closed down 2008-09-02)</option>
    // <option value="211">TRITA-REL (Closed down 2008-09-02)</option>
    // <option value="236">TRITA-S3-KT, 1653-3860</option>
    // <option value="237">TRITA-S3-LCN, 1653-0837</option>
    // <option value="210">TRITA-S3-REG (Closed down 2008-09-02)</option>
    // <option value="126">TRITA-S3-REG., 1404-2150</option>
    // <option value="189">TRITA-S3-RST (Closed down 2008-09-02)</option>
    // <option value="224">TRITA-S3-RST, 1400-9137</option>
    // <option value="123">TRITA-S3-SB</option>
    // <option value="102">TRITA-S3-SIP, 1652-4500</option>
    // <option value="221">TRITA-S3. SB, 1103-8039</option>
    // <option value="244">TRITA-SOM, 1653-6126</option>
    // <option value="167">TRITA-ST (Closed down 2008-09-02)</option>
    // <option value="4900">TRITA-STH</option>
    // <option value="238">TRITA-STH : report, 1653-3836</option>
    // <option value="13901">TRITA-STH-PUB</option>
    // <option value="11004">TRITA-STKL</option>
    // <option value="13250">TRITA-SUS, 1654-479X</option>
    // <option value="248">TRITA-TEC-LIC, 1653-445X</option>
    // <option value="251">TRITA-TEC-PHD, 1653-4468</option>
    // <option value="7500">TRITA-TEC-RR, 1653-4484</option>
    // <option value="177">TRITA-TET (Closed down 2008-09-02)</option>
    // <option value="192">TRITA-TMH (Closed down 2008-09-02)</option>
    // <option value="235">TRITA-TMH, 1104-5787</option>
    // <option value="218">TRITA-TPM (Closed down 2008-09-02)</option>
    // <option value="206">TRITA-TRÄ (Closed down 2008-09-02)</option>
    // <option value="8350">TRITA-TSC-LIC, 1653-445X</option>
    // <option value="8550">TRITA-TSC-PHD</option>
    // <option value="10600">TRITA-TSC-RR</option>
    // <option value="170">TRITA-TSM (Closed down 2008-09-02)</option>
    // <option value="138">TRITA-TYK (Closed down 2008-09-02)</option>
    // <option value="6800">TRITA-VBT, 1650-867X</option>
    // <option value="127">TRITA-VNT (Closed down 2008-09-02)</option>
    // <option value="179">TRITA-VT. FR (Closed down 2008-09-02)</option>
    // <option value="240">TRITA-VT. FR, 1650-867X</option>
    // <option value="96">TRITA-YTK, 1650-0490</option>
    // <option value="6701">TRITA/KTH/CEFIN-DT, 1654-9376</option>
    // <option value="14750">TRITA‐INFRA‐FMS‐PHD</option>
    // <option value="14751">TRITA‐INFRA‐FMS‐PHD</option>
    // <option value="8551">TSC-BT</option>
    // <option value="6351">TSC-MT</option></select>
    pub_series='5952'; // TRITA-ICT-EX
    //await page.$eval('[id="addForm:j_id935"]', (el, value) => el.value = value, pub_series);
    //await page.click('[id="addForm:j_id935"]');
    await page.select('[id="addForm:j_id935"]', pub_series);
    await page.waitFor('[id="addForm:j_id937:0:seriesNumber"]');
    trita_number='2019:00';
    await page.$eval('[id="addForm:j_id937:0:seriesNumber"]', (el, value) => el.value = value, trita_number);
    await page.waitFor(1000);

    //blanks[ 11 ] are  [ { nameOfTextField: 'National subject category*',
    //className: 'div#addForm:j_id1037.icePnlGrp',
    //iId: [ 'addForm:j_id1039' ],
    // Kommunikationssystem; Communication Systems (20203)
    //await page.select('[id="addForm:j_id1039"]', 'Kommunikationssystem; Communication Systems');
    //national_category=20203
    //await page.$eval('[id="addForm:j_id883"]', (el, value) => el.value = value, national_category);

    await page.click('[id="addForm:j_id1039"]');
    console.info("click to select the national subject")
    await page.waitFor(1000);
    //
    
    await page.waitFor('[id="nationalCategoryPopupForm:tree:1"]');
    await page.click('[id="nationalCategoryPopupForm:tree:1"]'); // Engineering and Technology
    //    await page.click('[id="nationalCategoryPopupForm:tree:n-1:j_id300"]'); // Engineering and Technology

    await page.waitFor('[id="nationalCategoryPopupForm:tree:1-2"]');
    await page.click('[id="nationalCategoryPopupForm:tree:1-2"]'); // Electrical Engineering, Electronic Engineering, Information Engineering
    
    //    await page.click('[id="nationalCategoryPopupForm:tree:n-1-2:j_id300"]'); // Electrical Engineering, Electronic Engineering, Information Engineering
    //await page.waitFor('[id="nationalCategoryPopupForm:tree:n-1-2-0:j_id299"]');

    // <div class="icePnlGrp" id="nationalCategoryPopupForm:tree:n-1-2-0:j_id310" style="display: inline"><a class="iceCmdLnk" href="javascript:;" id="nationalCategoryPopupForm:tree:n-1-2-0:j_id311" onblur="setFocus('');" onclick="scrollBack();var form=formOf(this);form['nationalCategoryPopupForm:_idcl'].value='nationalCategoryPopupForm:tree:n-1-2-0:j_id311';return iceSubmit(form,this,event);" onfocus="setFocus(this.id);">Communication Systems</a></div>

    await page.waitFor(1000);
    try {
	await page.click('[id^="nationalCategoryPopupForm:tree:n-1-2-0:j_id"]'); // wait for item
    } catch(e) {
	console.info("while waiting for item: catch of ", e);
    }

    try {
	await page.click('[id="nationalCategoryPopupForm:tree:n-1-2-0:j_id310"]'); // Communication Systems
    } catch(e) {
	console.info("while clicking on item: catch of ", e);
    }


    //await page.click('[id="nationalCategoryPopupForm:tree:n-1-2-0:j_id300"]'); // Communication Systems
    console.info("selected the national subject")

    await page.waitFor(1000);

    let message3= await page.evaluate(() => {
	let names=document.querySelectorAll('textarea');
	let names_arr = Array.prototype.slice.call(names);
	let text_arr = [];
	for (let i = 0; i < names_arr.length; i += 1) {
            text_arr.push(names_arr[i].innerHTML);
	}
	return text_arr;
    });

    console.info("message3 is ", message3);
    await page.waitFor(1000);

    let topbuttons;
    topbuttons = await forwardAndBackwardButtons(page);
    console.info("topbuttons is ", topbuttons);
    console.info("topbuttons['heading_ids'][2] is ", topbuttons['heading_ids'][2]);
    let continue_selector;
    continue_selector = '[id="'+topbuttons['heading_ids'][2]+'"]';
    await page.waitFor(5000);
    //status=await page.click(continue_selector); // go to the next page
    //console.info("status of clicking continue is ", status);
    //page.waitForNavigation({ waitUntil: 'load' });
    const [response] = await Promise.all([
	page.waitForNavigation({ waitUntil: 'networkidle0' } ),
	page.click(continue_selector),
    ]);
    console.info("response of clicking continue is ", response);

    
    //// Upload file page
    //choose_file_selector = '[id="myForm:j_id235:uploadFrame"]';

    // find the file upload iframe
    console.info("Try to upload a file");
    const ielementHandle = await page.$('iframe.iceInpFile');
    const iframe = await ielementHandle.contentFrame();
    const fileInput = await iframe.$('#fileUploadForm input[name=upload]');
    status = await fileInput.uploadFile('/home/maguire/Diva/z1.pdf');
    await page.waitFor(1000);
    console.info("status of file upload is ", status);

    /// Uploaded file accept conditions
    await page.waitFor('[id="myForm:j_id139"]');

    const msg_to_diva_admin_selector='The student ageed to publication of the final report in DiVA.';
    await page.type('[id="myForm:j_id175"]', msg_to_diva_admin_selector, {delay: 10});

    //const accept_checkboxHandle = await page.$('[id="myForm:j_id139"]');
    //const accepted = await accept_checkboxHandle.click('[id="myForm:accept"]');

    await page.focus('[id="myForm:accept"]');
    await page.keyboard.press('Enter'); // Enter Key
    await page.click('[id="myForm:accept"]');

    await page.waitFor(3000);
    topbuttons = await forwardAndBackwardButtons(page);
    console.info("topbuttons is ", topbuttons);
    console.info("topbuttons['heading_ids'][2] is ", topbuttons['heading_ids'][2]);
    continue_selector = '[id="'+topbuttons['heading_ids'][2]+'"]';
    await page.waitFor(5000);
    status=await page.click(continue_selector); // go to the next page
    console.info("status of clicking continue is ", status);
    page.waitForNavigation({ waitUntil: 'load' });


    return;
    debugger;


})();
