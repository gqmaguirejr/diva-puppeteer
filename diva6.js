// Puppeteer script for filling in the page for a student thesis
//
// G. Q. Maguire Jr.
// 2019.07.20

// https://kth.test.diva-portal.org/dream/add/add1.jsf

const verboseGQM=false;		//  verbose mode tru give lots of debugging output
const puppeteer = require('puppeteer');
const fs = require('fs');
const config = require('./config.json'); // contains username and password to use
const os = require('os');

const file_name = process.argv[2];
if (!file_name) {
    throw "Please provide a JSON with information about the thesis as the first argument";
}
console.log("file_name is ", file_name);

const thesis_info_string = fs.readFileSync(file_name, 'utf8');
//console.log("thesis_info_string is ", thesis_info_string);
const thesis_info = JSON.parse(thesis_info_string);
if (verboseGQM) {
    console.log("thesis_info is ", thesis_info);
}
    
// for(let key in thesis_info) {
//     let value = thesis_info[key];
//     console.info("thesis_info[", key, "] is ", value);
// }

// Viewport && Window size
const width = 1280
const height = 900

// const delay = ms => new Promise(res => setTimeout(res, ms));


// KTH organisationPopupForm:tree:n-root:j_id198
const kth_org = require('./kth-org-diva-old.json'); // organizattion tree
const nationalSubjectCategory =  require('./National_subject_categories-old.json');
degree_info={
    "Level": {
	// Level field:
	// <option value="H1">Independent thesis Advanced level (degree of Master (One Year))</option>
	// <option value="H2">Independent thesis Advanced level (degree of Master (Two Years))</option>
	// <option value="H3">Independent thesis Advanced level (professional degree)</option>
	// <option value="M2">Independent thesis Basic level (degree of Bachelor)</option>
	// <option value="M3">Independent thesis Basic level (professional degree)</option>
	// <option value="M1">Independent thesis Basic level (university diploma)</option>
	// <option value="L1">Student paper first term</option>
	// <option value="L3">Student paper other</option>
	// <option value="L2">Student paper second term</option>
	'Independent thesis Advanced level (degree of Master (One Year))': 'H1',
	'Independent thesis Advanced level (degree of Master (Two Years))': 'H2',
	'Independent thesis Advanced level (professional degree)': 'H3',
	'Independent thesis Basic level (degree of Bachelor)': 'M2',
	'Independent thesis Basic level (professional degree)': 'M3',
	'Independent thesis Basic level (university diploma)': 'M1',
	'Student paper first term': 'L1',
	'Student paper other': 'L3',
	'Student paper second term': 'L2'
    },
    "University credits": {
	'7,5 HE credits':	'5',
	'10 HE credits':	'7',
	'12 HE credits':	'8',
	'15 HE credits':	'10',
	'18 HE credits':	'12',
	'22,5 HE credits':	'15',
	'16 HE credits':	'16',
	'20 HE credits':	'17',
	'30 HE credits': 	'20',
	'37,5 HE credits':	'25',
	'45 HE credits':	'30',
	'60 HE credits':	'40',
	'90 HE credits':	'60',
	'120 HE credits':	'80',
	'180 HE credits':	'120',
	'210 HE credits':	'140',
	'240 HE credits':	'160',
	'300 HE credits':	'200',
	'330 HE credits':	'220',
    },
    "Educational program": {
	"Bachelor of Science in Engineering": "10522",
	"Bachelor of Science in Engineering -  Constructional Engineering and Design": "9800",
	"Bachelor of Science in Engineering -  Constructional Engineering and Economics": "9801",
	"Bachelor of Science in Engineering - Chemical Engineering": "9880",
	"Bachelor of Science in Engineering - Computer Engineering and Economics": "9989",
	"Bachelor of Science in Engineering - Computer Engineering": "9921",
	"Bachelor of Science in Engineering - Computer Engineering": "9990",
	"Bachelor of Science in Engineering - Constructional Engineering and Health": "10751",
	"Bachelor of Science in Engineering - Electrical Engineering and Economics": "9949",
	"Bachelor of Science in Engineering - Electrical Engineering": "9907",
	"Bachelor of Science in Engineering - Electrical Engineering": "9948",
	"Bachelor of Science in Engineering - Electronics and Computer Engineering": "9922",
	"Bachelor of Science in Engineering - Engineering and Economics": "9992",
	"Bachelor of Science in Engineering - Mechanical Engineering and Economics": "9951",
	"Bachelor of Science in Engineering - Mechanical Engineering": "9950",
	"Bachelor of Science in Engineering - Medical Technology": "9991",
	"Bachelor of Science": "10523",
	"Bachelor of Science - Architecture": "10950",
	"Bachelor of Science - Business Engineering": "9924",
	"Bachelor of Science - Energy and Environment": "17650",
	"Bachelor of Science - Information and Communication Technology": "9925",
	"Bachelor of Science - Medical Informatics": "9994",
	"Bachelor of Science - Property Development and Agency": "9805",
	"Bachelor of Science - Real Estate and Finance": "9804",
	"Bachelor of Science - Simulation Technology and Virtual Design": "9892",
	"Degree of Master": "10524",
	"Degree of Master - Design and Building": "9858",
	"Master of Science - Applied Logistics": "9956",
	"Master of Science - Architectural Lighting Design": "9999",
	"Master of Science - Computer Networks": "9997",
	"Master of Science - Entrepreneurship and Innovation Management": "9953",
	"Master of Science - Ergonomics and Human-Technology-Organisation": "9998",
	"Master of Science - Product Realisation": "9954",
	"Master of Science - Project Management and Operational Development": "9955",
	"Master of Science - Work and Health": "9996",
	"Teknologie magisterexamen - Teknik, hälsa och arbetsmiljöutveckling": "14553",
	"Degree of Master": "10525",
	"Degree of Master -  Architectural Enginering": "9850",
	"Degree of Master -  Urbanism Studies": "28050",
	"Degree of Master - Chemical Engineering for Energy and Environment": "9882",
	"Degree of Master - Civil and Architectural Engineering": "24400",
	"Degree of Master - Economics of Innovation and Growth": "9864",
	"Degree of Master - Environmental Engineering and Sustainable Infrastructure": "9863",
	"Degree of Master - Geodesy and Geoinformatics": "9862",
	"Degree of Master - Infrastructure Engineering": "9865",
	"Degree of Master - Land Management": "9868",
	"Degree of Master - Macromolecular Materials": "9883",
	"Degree of Master - Materials and Sensors System for Environmental Technologies": "9885",
	"Degree of Master - Molecular Science and Engineering": "9884",
	"Degree of Master - Real Estate Development and Financial Services": "9861",
	"Degree of Master - Spatial Planning": "13400",
	"Degree of Master - Sustainable Urban Planning and Design": "9552",
	"Degree of Master - Transport Systems": "9866",
	"Degree of Master - Urban Planning and Design": "13401",
	"Degree of Master - Water System Technology": "9867",
	"Master of Science - Aerospace Engineering": "9977",
	"Master of Science - Applied and Computational Mathematics": "23002",
	"Master of Science - Architectural Lighting Design and Health": "10001",
	"Master of Science - Architecture": "9860",
	"Master of Science - Computational and Systems Biology": "9894",
	"Master of Science - Computational Chemistry and Computational Physics": "9875",
	"Master of Science - Computer Science": "9895",
	"Master of Science - Computer Simulation for Science and Engineering": "9901",
	"Master of Science - Design and Implementation of ICT Products and Systems": "9930",
	"Master of Science - Distributed Computing": "9938",
	"Master of Science - Electric Power Engineering": "9910",
	"Master of Science - Electrophysics": "9909",
	"Master of Science - Embedded Systems": "9928",
	"Master of Science - Engineeering Physics": "9983",
	"Master of Science - Engineering and Management of Information Systems": "9935",
	"Master of Science - Engineering Design": "9962",
	"Master of Science - Engineering Materials Science": "9965",
	"Master of Science - Engineering Mechanics": "9982",
	"Master of Science - Environomical Pathways for Sustainable Energy Systems": "9969",
	"Master of Science - Human-Computer Interaction": "9899",
	"Master of Science - Industrial and Environmental Biotechnology": "9873",
	"Master of Science - Industrial Engineering and Management": "9959",
	"Master of Science - Information and Communication Systems Security": "9929",
	"Master of Science - Innovative Sustainable Energy Engineering": "9966",
	"Master of Science - Integrated Product Design": "9963",
	"Master of Science - Interactive Systems Engineering": "9934",
	"Master of Science - Internetworking": "13450",
	"Master of Science - Machine Learning": "9896",
	"Master of Science - Management and Engineering of Environment and Energy": "9968",
	"Master of Science - Maritime Engineering": "9984",
	"Master of Science - Materials Science and Engineering": "11254",
	"Master of Science - Mathematics": "9981",
	"Master of Science - Media Management": "9897",
	"Master of Science - Media Technology": "9898",
	"Master of Science - Medical Biotechnology": "9874",
	"Master of Science - Medical Engineering": "10003",
	"Master of Science - Nanotechnology": "9931",
	"Master of Science - Naval Architecture": "9980",
	"Master of Science - Network Services and Systems": "9911",
	"Master of Science - Nuclear Energy Engineering": "9979",
	"Master of Science - Nuclear Fusion Science and Engineering Physics": "9914",
	"Master of Science - Photonics": "9927",
	"Master of Science - Production Engineering and Management": "9961",
	"Master of Science - Real Estate Management": "9859",
	"Master of Science - School of Electrical Engineering (EES) - Master of Science - Research on Information and Communication Technologies": "9915",
	"Master of Science - Scientific Computing": "9900",
	"Master of Science - Software Engineering of Distributed Systems": "9932",
	"Master of Science - Sustainable Energy Engineering": "9958",
	"Master of Science - Sustainable Technology": "9964",
	"Master of Science - System-on-Chip Design": "9933",
	"Master of Science - Systems Biology": "9902",
	"Master of Science - Systems, Control and Robotics": "9912",
	"Master of Science - Transport and Geoinformation Technology": "21652",
	"Master of Science - Turbomachinery Aeromechanic University Training": "9970",
	"Master of Science - Vehicle Engineering": "9978",
	"Master of Science - Wireless Systems": "9913",
	"Master of Science -Communication Systems": "9939",
	"Master of Science -Medical Imaging": "10002",
	"Master of Science -Security and Mobile Computing": "9937",
	"Higher Education Diploma": "10521",
	"Higher Education Diploma - Construction Management": "9802",
	"Higher Education Diploma - Constructional Technology and Real Estate Agency": "9803",
	"Master of Architecture": "10520",
	"Master of Architecture - Architecture": "9558",
	"Master of Science in Engineering": "10500",
	"Master of Science in Engineering -  Electrical Engineering": "9905",
	"Master of Science in Engineering - Biotechnology": "9871",
	"Master of Science in Engineering - Chemical Science and Engineering": "9878",
	"Master of Science in Engineering - Computer Science and Technology": "9889",
	"Master of Science in Engineering - Design and Product Realisation": "9942",
	"Master of Science in Engineering - Energy and Environment": "9943",
	"Master of Science in Engineering - Engineering and of Education": "9973",
	"Master of Science in Engineering - Industrial Engineering and Management": "9944",
	"Master of Science in Engineering - Information and Communication Technology": "9918",
	"Master of Science in Engineering - Materials Design and Engineering": "9946",
	"Master of Science in Engineering - Mechanical Engineering": "9945",
	"Master of Science in Engineering - Media Technology": "9890",
	"Master of Science in Engineering - Medical Engineering": "9987",
	"Master of Science in Engineering - Microelectronics": "9919",
	"Master of Science in Engineering - Urban Management": "10526",
	"Master of Science in Engineering - Vehicle Engineering": "9974",
	"Master of Science in Engineering -Engineering Physics": "9975",
	"Z - School of Architecture and the Built Environment (ABE)": "9557",
	"School of Architecture and the Built Environment (ABE)  - Master of Science in Engineering": "9852",

    },
    "Subject_course": {
	'Accelerator Technique': '10260',
	'Aeronautical Engineering': '10306',
	'Analytical Chemistry': '10261',
	'Antenna Systems Technology': '10262',
	'Applied Information Technology': '10423',
	'Applied Logistics': '10424',
	'Applied Material Physics': '10426',
	'Applied Materials Technology': '10427',
	'Applied Mathematical Analysis': '10425',
	'Applied Mathematics and Industrial Economics': '28053',
	'Applied Physics': '10422',
	'Applied Process Metallurgy': '10428',
	'Applied Thermodynamics': '10369',
	'Applied Thermodynamics': '10429',
	'Architectural Lighting Design and Health': '10258',
	'Architectural Lighting Design': '10349',
	'Architecture': '10264',
	'Automatic Control': '10397',
	'Biocomposites': '10269',
	'Biomechanics': '10410',
	'Biomedical Engineering': '10270',
	'Biotechnology': '10253',
	'Biotechnology': '10271',
	'Building and Real Estate Economics': '10273',
	'Building Design': '10484',
	'Building Materials': '10275',
	'Building Services Engineering and Energy': '10471',
	'Building Technology': '10277',
	'Building Technology': '10449',
	'Built Environment Analysis': '10266',
	'Built Environment': '10485',
	'Casting of Metals': '10371',
	'Ceramic Materials': '10336',
	'Ceramics': '10337',
	'Chemical Engineering': '10335',
	'Chemical Science and Engineering': '10472',
	'Circuit Electronics': '10344',
	'Civil Engineering Management': '10481',
	'Communication Networks': '10338',
	'Communication Theory': '10340',
	'Communications Systems': '10339',
	'Computational Thermodynamics': '10420',
	'Computer and Systems Sciences': '10279',
	'Computer Communication': '10281',
	'Computer Engineering with Business Economics': '10452',
	'Computer Engineering with Industrial Economy': '10453',
	'Computer Networks and Communication': '10460',
	'Computer Networks': '10282',
	'Computer Networks': '10459',
	'Computer Science': '10280',
	'Computer Systems': '10283',
	'Computer Technology and Graphic Programming': '10454',
	'Computer Technology and Real Time Programming': '10456',
	'Computer Technology and Software Engineering': '10455',
	'Computer Technology, Networks and Security': '10457',
	'Computer Technology, Program- and System Development': '10458',
	'Concrete Structures': '10268',
	'Condensed Matter Physics': '10341',
	'Construction Management and Economics': '10274',
	'Construction Management': '10278',
	'Constructional Design': '10448',
	'Constructional Engineering and Design with Business Economics': '10450',
	'Constructional Engineering and Design': '10451',
	'Corrosion Science': '10342',
	'Design and Building': '10284',
	'Design and Product Development': '10445',
	'Design and Vehicle Engineering': '10446',
	'Discrete Mathematics': '10285',
	'Economics of Innovation and Growth': '10257',
	'Electric Power Systems': '10289',
	'Electrical Engineering with Industrial Economy': '10463',
	'Electrical Engineering': '10295',
	'Electrical Machines and Drives': '10290',
	'Electrical Machines and Power Electronic': '10291',
	'Electrical Measurements': '10287',
	'Electrical Plant Engineering': '10288',
	'Electroacoustics': '10292',
	'Electromagnetic Theory': '10418',
	'Electronic System Design': '10294',
	'Electronic- and Computer Systems': '10293',
	'Electronics and Communications': '10461',
	'Electronics Design': '10462',
	'Embedded System Design': '10466',
	'Energy and Climate Studies': '10296',
	'Energy and Furnace Technology': '10297',
	'Energy Processes': '10298',
	'Energy Technology': '10251',
	'Engineering and Management': '10487',
	'Engineering Material Physics': '10415',
	'Engineering Physics': '10488',
	'Entrepreneurship and Innovation Management': '10255',
	'Environmental Assessment': '10376',
	'Environmental Strategies': '10377',
	'Ergonomics': '10300',
	'Facilities for Infrastructure': '10447',
	'Fiber Technology': '10304',
	'Finance': '10464',
	'Financial Mathematics': '28052',
	'Fluid Mechanics': '10402',
	'Foundry Technology': '10316',
	'Fusion Plasma Physics': '10309',
	'Geodesy': '10314',
	'Geoinformatics': '10315',
	'Ground Water Chemistry': '10317',
	'Heat Transfer': '10440',
	'Heating and Ventilating Technology': '10435',
	'High Voltage Engineering': '10321',
	'Highway Engineering': '10439',
	'History of Technology': '10412',
	'Human - Computer Interaction': '10380',
	'Hydraulic Engineering': '10437',
	'Industrial Biotechnology': '10322',
	'Industrial Business Administration and Manufacturing': '10469',
	'Industrial Control Systems': '10327',
	'Industrial Design': '10323',
	'Industrial Ecology': '10324',
	'Industrial Economics and Management': '10325',
	'Industrial Economy and Entrepreneurship': '10468',
	'Industrial IT': '10467',
	'Information and Communication Technology': '10329',
	'Information and Software Systems': '10328',
	'Information Technology': '10330',
	'Innovation and Design': '10470',
	'Inorganic Chemistry': '10382',
	'Integrated Product Development': '10331',
	'Internal Combustion Engineering': '10313',
	'Land and Water Resources': '10354',
	'Land Management': '10254',
	'Lightweight Structures': '10352',
	'Logistics, Business Administration and Manufacturing': '10475',
	'Logistics': '10350',
	'Machine Design': '10356',
	'Machine Elements': '10351',
	'Machine Elements': '10355',
	'Material Physics': '10363',
	'Materials and Process Design': '10360',
	'Materials Design and Engineering': '10444',
	'Materials Processing': '10361',
	'Materials Science and Engineering': '10478',
	'Mathematical Statistics': '10359',
	'Mathematics': '10358',
	'Mechanical Design': '10473',
	'Mechanical Engineering with Industrial Economy': '10477',
	'Mechanical Engineering': '10476',
	'Mechanical Metallurgy': '10368',
	'Mechanics': '10367',
	'Mechatronics and Robotics': '10479',
	'Mechatronics': '10370',
	'Media Technology': '10366',
	'Medical Engineering': '10365',
	'Medical Imaging': '10364',
	'Metal Working': '10265',
	'Micro Modelling in Process Science': '10375',
	'Microcomputer Systems': '10373',
	'Microelectronics and Applied Physics': '10374',
	'Mobile Communications Systems': '10480',
	'Molecular Biotechnology': '10378',
	'Music Acoustics': '10379',
	'Naval Systems': '10353',
	'Nuclear Chemistry': '10346',
	'Nuclear Reactor Engineering': '10395',
	'Numerical Analysis': '10381',
	'Optics': '10383',
	'Optimization and Systems Theory': '10384',
	'Organic Chemistry': '10385',
	'Paper Technology': '10386',
	'Philosophy': '10305',
	'Photonics with Microwave Engineering': '10308',
	'Physical Chemistry': '10312',
	'Physical Electrotechnology': '10311',
	'Physical Metallurgy': '10372',
	'Physics': '10310',
	'Planning of Traffic and Transportation': '10431',
	'Plasma Physics': '10387',
	'Polymer Technology': '10389',
	'Polymeric Materials': '10388',
	'Power Electronics': '10286',
	'Process Science of Materials': '10362',
	'Product Realisation and Management': '10390',
	'Production Engineering': '10326',
	'Project in Fluid Power': '10319',
	'Project Management and Operational Development': '10392',
	'Pulp Technology': '10357',
	'Radio Communication Systems':  '10394',
	'Radio Electronics':  '10393',
	'Railway Operation':  '10333',
	'Railway Technology':  '10334',
	'Reactor Safety':  '10347',
	'Real Estate Development and Land Law':  '10252',
	'Real Estate Economics':  '10302',
	'Real Estate Management':  '10465',
	'Real Estate Planning':  '10303',
	'Refrigerating Engineering':  '10345',
	'Regional Planning':  '10396',
	'Reliability Centred Asset Management for Electrical Power Systems':  '10421',
	'Risk and Safety':  '10398',
	'Safety Research':  '10407',
	'Scientific Computing':  '10267',
	'Semiconductor Materials':  '10318',
	'Signal Processing':  '10400',
	'Software Design':  '10483',
	'Software Engineering':  '10391',
	'Software Engineering':  '10482',
	'Soil and Rock Mechanics':  '10332',
	'Solid Mechanics':  '10320',
	'Solid State Electronics':  '10301',
	'Sound and Image Processing':  '10348',
	'Space and Plasma Physics':  '10443',
	'Space Physics':  '10399',
	'Speech Communication':  '10408',
	'Speech Communication':  '10409',
	'Steel Structures':  '10403',
	'Structural Design and Bridges':  '10272',
	'Structural Engineering':  '10474',
	'Structural Mechanics and Engineering':  '10276',
	'Surface Chemistry':  '10442',
	'Surface Coating Technology':  '10441',
	'Surveying':  '10414',
	'Sustainable Buildings':  '10436',
	'Sustainable development':  '10750',
	'System Engineering':  '10486',
	'System-on-Chip':  '10404',
	'Systems Analysis and Economics':  '10405',
	'Systems Engineering':  '10406',
	'Technical Acoustics':  '10413',
	'Technology and Learning':  '10411',
	'Tele and Data Communication':  '10489',
	'Telecommunication Systems':  '10417',
	'Teleinformatics':  '10416',
	'Theoretical Physics':  '10419',
	'Thermal Engineering':  '10343',
	'Traffic and Transport Planning':  '10430',
	'Transport- and Location Analysis':  '10432',
	'Urban and Regional Planning':  '20650',
	'Urban Planning and Design':  '10401',
	'Vehicle Engineering':  '10307',
	'Water Resources Engineering':  '10438',
	'Water, Sewage and Waste':  '10259',
	'Wood Chemistry':  '10433',
	'Wood Technology and Processing':  '10434',
	'Work Science':  '10263'
    }
};
const series_info={
    "Arbete och Hälsa": "129",	//  (Closed down 2008-09-02)
    "CESIS Working Paper Series in Economics and Institutions of Innovation": "7001",
    "CTL Technical Report": "8600",
    "CTS - Working papers in Transport Economics": "10150",
    "EES Examensarbete / Master Thesis": "6700",
    "Examensarbete Byggnadsteknik": "5956",
    "Examensarbete INDEK": "6250",
    "Examensarbete Installationsteknik": "7250",
    "Examensarbete Jord- och bergmekanik, 1652-599X": "6500",
    "Fotogrammetriska meddelanden": "157", //  (Closed down 2008-09-02)
    "FOU-rapport": "139",		   //  (Closed down 2008-09-02)
    "Kandidatexjobb CSC": "7951",
    "Klimat och byggnader": "212", //  (Closed down 2008-09-02)
    "Kärnkraftsäkerhet": "144",	   //  (Closed down 2008-09-02)
    "Meddelande, 0348-9469": "253",
    "Meddelande. Inst för Infrastruktur": "194", //  (Closed down 2008-09-02)
    "Meddelande. Inst. för byggnadsteknik, 0346-5918": "198", //  (Closed down 2008-09-02)
    "Meddelande. Inst. för fastigheter och byggande": "128",  //  (Closed down 2008-09-02)
    "Meddelande. Inst. för fastighetsteknik": "145",	      //  (Closed down 2008-09-02)
    "Meddelande. Installationsteknik": "180",		      //  (Closed down 2008-09-02)
    "Meddelande. Institutionen för byggvetenskap, 1651-5536": "225",
    "Rapport MT": "193",	//  (Closed down 2008-09-02)
    "Report series / DSV, 1101-8526": "125",
    "Report series. DSV": "162", //  (Closed down 2008-09-02)
    "Report. Department of Aeronautics": "196", //  (Closed down 2008-09-02)
    "Rättsvetenskapliga biblioteket": "155",	//  (Closed down 2008-09-02)
    "Skriftserie": "136",			//  (Closed down 2008-09-02)
    "SoM EX": "5955",
    "SoM EX KAND": "7501",
    "Stoftanalys": "147",	//  (Closed down 2008-09-02)
    "TEC-MT": "5954",
    "Testserie, 1717-1717": "9800",
    "Testserie - ventilbasun": "14752",
    "Theses in philosophy from RIT": "153", //  (Closed down 2008-09-02)
    "Theses in philosophy from the Royal Institute of Technology, 1650-8831": "7450",
    "Theses in Risk and Safety from the Division of Philosophy at the Royal Institute of Technology, 1654-627X": "111",
    "TMT": "6201",
    "TRITA-AFT": "195",		//  (Closed down 2008-09-02)
    "TRITA-ALP": "171",		//  (Closed down 2008-09-02)
    "TRITA-ALP, 1103-6613": "232",
    "TRITA-AMI. LIC": "164",	//  (Closed down 2008-09-02)
    "TRITA-AMI. PDH": "158",	//  (Closed down 2008-09-02)
    "TRITA-AMI. PHD": "137",	//  (Closed down 2008-09-02)
    "TRITA-ARK": "191",		//  (Closed down 2008-09-02)
    "TRITA-ARK. Akademisk avhandling, 1402-7461": "118",
    "TRITA-ARK. Forskningspublikationer, 1402-7453": "100",
    "TRITA-AVE, 1651-7660": "130",
    "TRITA-BFE": "213",		//  (Closed down 2008-09-02)
    "TRITA-BFE, 1104-4101": "231",
    "TRITA-BIO-Report, 1654-2312": "255",
    "TRITA-BKN-Examensarbete, 1103-4297": "5953",
    "TRITA-BKN. Bulletin, 1103-4270": "113",
    "TRITA-BYMA": "200",	//  (Closed down 2008-09-02)
    "TRITA-BYMA, 0349-5752": "234",
    "TRITA-BYT": "199",		//  (Closed down 2008-02-15)
    "TRITA-BYTE": "11001",
    "TRITA-CHE-Report, 1654-1081": "254",
    "TRITA-CSC-A, 1653-5723": "245",
    "TRITA-CSC-E, 1653-5715": "7950",
    "TRITA-DKT": "185",		//  (Closed down 2008-09-02)
    "TRITA-ECE": "12300",
    "TRITA-ECE-EX": "13900",
    "TRITA-ECS Report": "14700",
    "TRITA-EDS": "156",		//  (Closed down 2008-09-02)
    "TRITA-EE, 1653-5146": "243",
    "TRITA-EEA": "165",		//  (Closed down 2008-09-02)
    "TRITA-EES": "219",		//  (Closed down 2008-09-02)
    "TRITA-EHE": "163",		//  (Closed down 2008-09-02)
    "TRITA-EIE": "140",		//  (Closed down 2008-09-02)
    "TRITA-EKS": "216",		//  (Closed down 2008-09-02)
    "TRITA-EKT, 1650-8599": "109",
    "TRITA-ELA": "166",		//  (Closed down 2008-09-02)
    "TRITA-EMD": "203",		//  (Closed down 2008-09-02)
    "TRITA-EME": "188",		//  (Closed down 2008-09-02)
    "TRITA-EME, 1404-8248": "242",
    "TRITA-ESD": "202",		//  (Closed down 2008-09-02)
    "TRITA-ETS, 1650-674X": "112",
    "TRITA-EUV": "204",		//  (Closed down 2008-09-02)
    "TRITA-FAT, 0348-9469": "169", //  (Closed down 2008-09-02)
    "TRITA-FKT": "184",		   //  (Closed down 2008-09-02)
    "TRITA-FOB": "5550",
    "TRITA-FPT": "154",		//  (Closed down 2008-09-02)
    "TRITA-FPT-Report, 1652-2443": "110",
    "TRITA-FTE, 0284-0545": "98",
    "TRITA-FTP": "150",		//  (Closed down 2008-09-02)
    "TRITA-FYK": "122",
    "TRITA-FYS, 0280-316X": "99",
    "TRITA-GEOFOTO": "181",	//  (Closed down 2008-09-02)
    "TRITA-GIT EX": "12100",
    "TRITA-GRT": "209",		//  (Closed down 2008-09-02)
    "TRITA-HFL. Rapport/ Institutionen för hållfasthetslära, KTH, 1654-1472": "132",
    "TRITA-HMA, 1404-0379": "97",
    "TRITA-HOT": "187",		//  (Closed down 2008-09-02)
    "TRITA-HOT, 0349-2842": "229",
    "TRITA-HST, 1103-5277": "249",
    "TRITA-HYD": "11002",
    "TRITA-ICS, 1104-3504": "131",
    "TRITA-ICT": "14350",
    "TRITA-ICT-COS, 1653-6347": "247", //  (Closed down 2016-01-01)
    "TRITA-ICT-ECS AVH, 1653-6363": "250",
    "TRITA-ICT-EX": "5952",
    "TRITA-ICT/MAP": "252",
    "TRITA-ICT/MAP AVH, 1653-7610": "2650",
    "TRITA-IEO": "201",		//  (Closed down 2008-09-02)
    "TRITA-IEO, 1100-7982": "228",
    "TRITA-IES": "11003",
    "TRITA-IIP, 1650-1888": "101",
    "TRITA-ILA, 0281-2878": "116",
    "TRITA-IM, 1402-7615": "6200",
    "TRITA-IM-EX": "10453",
    "TRITA-IMA": "142",		//  (Closed down 2008-09-02)
    "TRITA-IMIT-LCN. AVH": "208", //  (Closed down 2008-09-02)
    "TRITA-IMIT-LCN. AVH, 1651-4106": "239",
    "TRITA-IMIT-TSLAB. AVH": "149", //  (Closed down 2008-09-02)
    "TRITA-IMIT-TSLAB. AVH": "222",
    "TRITA-IMIT. LECS, 1651-4076": "95",
    "TRITA-IMIT. TSLAB": "175",	//  (Closed down 2008-09-02)
    "TRITA-INFRA, 1651-0216": "103",
    "TRITA-INFRA-FMS, 1652-5442": "5000",
    "TRITA-INFRA-FMS-PHD": "14753",
    "TRITA-INFRA. EX": "159",	//  (Closed down 2008-09-02)
    "TRITA-IOK, 1100-7974": "105",
    "TRITA-IP": "148",		//  (Closed down 2008-09-02)
    "TRITA-IP. FR": "182",	//  (Closed down 2008-09-02)
    "TRITA-IT": "160",		//  (Closed down 2008-09-02)
    "TRITA-IT-AVH": "141",	//  (Closed down 2008-09-02)
    "TRITA-IT-R": "152",	//  (Closed down 2008-09-02)
    "TRITA-IT. AVH": "190",	//  (Closed down 2008-09-02)
    "TRITA-JOB": "168",		//  (Closed down 2008-09-02)
    "TRITA-JOB PHD, 1650-9501": "226",
    "TRITA-JOB. LIC": "172",	//  (Closed down 2008-09-02)
    "TRITA-JOB. LIC, 1650-951X": "241",
    "TRITA-JOB. PHD": "146",	//  (Closed down 2008-09-02)
    "TRITA-KET, 1104-3466": "108",
    "TRITA-KET-IM": "215",	//  (Closed down 2008-09-02)
    "TRITA-KET-IM, 1402-7615": "233",
    "TRITA-KKE, 0349-6465": "117",
    "TRITA-KRV": "174",		//  (Closed down 2008-09-02)
    "TRITA-KRV, 1100-7990": "227",
    "TRITA-KTH-CEFIN-SR, 1653-7335": "7750",
    "TRITA-KTH. R": "151",	//  (Closed down 2008-09-02)
    "TRITA-LIB, 0346-9042": "10200",
    "TRITA-LWR Report, 1650-8610": "256",
    "TRITA-LWR. LIC": "217",	//  (Closed down 2008-09-02)
    "TRITA-LWR. LIC, 1650-8629": "230",
    "TRITA-LWR. PHD, 1650-8602": "104",
    "TRITA-MAT, 1401-2286": "107",
    "TRITA-MAT-A": "10450",
    "TRITA-MAT-E": "8500",
    "TRITA-MAT-K": "11601",
    "TRITA-MAT. MA, 1401-2278": "120",
    "TRITA-MAT. MS": "135",	//  (Closed down 2008-09-02)
    "TRITA-MAT. OS, 1401-2294": "121",
    "TRITA-MB": "161",		//  (Closed down 2008-09-02)
    "TRITA-MB. AVH": "133",	//  (Closed down 2008-09-02)
    "TRITA-MEB": "183",		//  (Closed down 2008-09-02)
    "TRITA-MEK, 0348-467X": "134",
    "TRITA-MEL": "197",		//  (Closed down 2008-09-02)
    "TRITA-MET": "186",		//  (Closed down 2008-09-02)
    "TRITA-MF": "246",
    "TRITA-MG, 1104-7127": "106",
    "TRITA-MG. AVH": "143",	//  (Closed down 2008-09-02)
    "TRITA-MMK, 1400-1179": "115",
    "TRITA-MSM": "178",		//  (Closed down 2008-09-02)
    "TRITA-MT": "207",		//  (Closed down 2008-09-02)
    "TRITA-MVT, 0348-4467": "114",
    "TRITA-NA, 0348-2952": "124",
    "TRITA-NA-P": "205",	//  (Closed down 2008-09-02)
    "TRITA-OOK": "214",		//  (Closed down 2008-09-02)
    "TRITA-OOK, 0348-825X": "223",
    "TRITA-PM": "220",		//  (Closed down 2008-09-02)
    "TRITA-PMT": "176",		//  (Closed down 2008-09-02)
    "TRITA-REFR, 1102-0245": "119",
    "TRITA-REG": "173",		//  (Closed down 2008-09-02)
    "TRITA-REL": "211",		//  (Closed down 2008-09-02)
    "TRITA-S3-KT, 1653-3860": "236",
    "TRITA-S3-LCN, 1653-0837": "237",
    "TRITA-S3-REG": "210",	//  (Closed down 2008-09-02)
    "TRITA-S3-REG., 1404-2150": "126",
    "TRITA-S3-RST": "189",	//  (Closed down 2008-09-02)
    "TRITA-S3-RST, 1400-9137": "224",
    "TRITA-S3-SB": "123",
    "TRITA-S3-SIP, 1652-4500": "102",
    "TRITA-S3. SB, 1103-8039": "221",
    "TRITA-SOM, 1653-6126": "244",
    "TRITA-ST": "167",		//  (Closed down 2008-09-02)
    "TRITA-STH": "4900",
    "TRITA-STH : report, 1653-3836": "238",
    "TRITA-STH-PUB": "13901",
    "TRITA-STKL": "11004",
    "TRITA-SUS, 1654-479X": "13250",
    "TRITA-TEC-LIC, 1653-445X": "248",
    "TRITA-TEC-PHD, 1653-4468": "251",
    "TRITA-TEC-RR, 1653-4484": "7500",
    "TRITA-TET": "177",		//  (Closed down 2008-09-02)
    "TRITA-TMH": "192",		//  (Closed down 2008-09-02)
    "TRITA-TMH, 1104-5787": "235",
    "TRITA-TPM": "218",		//  (Closed down 2008-09-02)
    "TRITA-TRÄ": "206",		//  (Closed down 2008-09-02)
    "TRITA-TSC-LIC, 1653-445X": "8350",
    "TRITA-TSC-PHD": "8550",
    "TRITA-TSC-RR": "10600",
    "TRITA-TSM": "170",		//  (Closed down 2008-09-02)
    "TRITA-TYK": "138",		//  (Closed down 2008-09-02)
    "TRITA-VBT, 1650-867X": "6800",
    "TRITA-VNT": "127",		//  (Closed down 2008-09-02)
    "TRITA-VT. FR": "179",	//  (Closed down 2008-09-02)
    "TRITA-VT. FR, 1650-867X": "240",
    "TRITA-YTK, 1650-0490": "96",
    "TRITA/KTH/CEFIN-DT, 1654-9376": "6701",
    "TRITA‐INFRA‐FMS‐PHD": "14750",
    "TRITA‐INFRA‐FMS‐PHD": "14751",
    "TSC-BT": "8551",
    "TSC-MT": "6351",
};


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

async function getTextAreaBlanksAuthor(nameOfTextField, textareaHandle, page) {
    let field_arr;
    let nameOfNextField;
    let fields;			// this will be a dict of the field names and a dict of their IDs and types
    
    field_arr = [];
    fields={};
    
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
	if (verboseGQM) {
	    console.info("iteration ", i);
	}
	className = await divs[i]._remoteObject.description;
	console.info("className is ", className);

	// case for an Author
	if (i == 0 && className === 'div.diva2addtextchoicebr') {
	    // scalar version:
	    //   dText = await page.evaluate(element => element.textContent, divs[i]);
	    // vector version:
	    textDiv = await divs[i].$$eval('div.diva2addtextchoice2', nodes => nodes.map(n => n.textContent));
	    if (verboseGQM) {
		console.info("textDiv is ", textDiv, " and should be the same as the area name:", nameOfTextField);
	    }

	    // This area has three buttons: 'Connect authority record »', 'Get saved personal data »', and 'Save personal data »'
	    iId = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
	    iType = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
	    iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));

	    if (verboseGQM) {
		console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
	    }
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

	    if (verboseGQM) {
		console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
	    }
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

	    if (verboseGQM) {
		console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
	    }
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

	    if (verboseGQM) {
		console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
	    }
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

	    if (verboseGQM) {
		console.info("about to push nameOfNextField", nameOfNextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
	    }
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

	    if (verboseGQM) {
		console.info("about to push nameOfNextField", nameOfNextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
	    }
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

	    if (verboseGQM) {
		console.info("about to push nameOfNextField", nameOfNextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
	    }
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

	    if (verboseGQM) {
		console.info("about to push nameOfNextField", nameOfNextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
	    }
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

async function getTextAreaBlanksCooperation(nameOfTextField, textareaHandle, page) {
    let fields;			// this will be a dict of the field names and a dict of their IDs and types
    fields={};

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
	if (verboseGQM) {
	    console.info("iteration ", i);
	}

	className = await divs[i]._remoteObject.description;
	console.info("className is ", className);

	if (i == 0 && className === 'div.diva2addtextchoice2') {
	    // nothing to do here
	}
	if (i == 1 && className === 'div.diva2addtextplus5') {
	    textDiv = await divs[i].$$eval('.diva2addtextchoicecolbr', nodes => nodes.map(i => i.textContent));
	    console.info("textDiv is ", textDiv);

	    iId    = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
	    iType  = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
	    iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));

	    if (verboseGQM) {
		console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
	    }
	    field_arr.push({nameOfTextField, className, textDiv, iId, iType, iValue})
	    fields[clean_name(iValue[0])]={ID: iId[0], Type: iType[0]};
	    fields[clean_name(iValue[1])]={ID: iId[1], Type: iType[1]};
	    fields['Partner_name']={ID: iId[2], Type: iType[2]};
	}
	if (i == 2 && className.endsWith('icePnlGrp.diva2addtextchoiceboxbr')) { // 
	    console.info("Do nothing, this is the Add Partner button we already found ");
	}
    }
    console.info("in ", nameOfTextField, "fields are:", fields );
    return fields;
}


async function getTextAreaBlanksTitle(nameOfTextField, textareaHandle, page) {
    let fields;			// this will be a dict of the field names and a dict of their IDs and types
    fields={};

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
	if (verboseGQM) {
	    console.info("iteration ", i);
	}

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
	    //console.info("dText is ", dText);
	    iId = await divs[i].$$eval('textarea', nodes => nodes.map(n => n.getAttribute('id')));
	    if (verboseGQM) {
		console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " nameOfNextField: ", nameOfNextField, "iId: ", iId);
	    }
	    field_arr.push({nameOfTextField, nameOfNextField, className, textDiv, iId})
	    for (let m = 0; m < iId.length; m++) {
		fields[clean_name(nameOfNextField)]={ID: iId[m], Type: 'textarea'};
	    }
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
	    if (verboseGQM) {
		console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " nameOfNextField: ", nameOfNextField, "iId: ", iId);
	    }
	    field_arr.push({nameOfTextField, nameOfNextField, className, textDiv, iId})
	    for (let m = 0; m < iId.length; m++) {
		fields[clean_name(nameOfNextField)]={ID: iId[m], Type: 'textarea'};
	    }
	}
    } 
    console.info("in ", nameOfTextField, "fields are:", fields );
    return fields;
}

async function getTextAreaBlanksAlternativeTitle(nameOfTextField, textareaHandle, page) {
    let fields;			// this will be a dict of the field names and a dict of their IDs and types
    fields={};

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
	if (verboseGQM) {
	    console.info("iteration ", i);
	}

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
	    if (verboseGQM) {
		console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " nameOfNextField: ", nameOfNextField, "iD ", iId);
	    }
	    field_arr.push({nameOfTextField, nameOfNextField, className, textDiv, iId})
	    for (let m = 0; m < iId.length; m++) {
		fields[clean_name(nameOfNextField)]={ID: iId[m], Type: 'textarea'};
	    }
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
	    if (verboseGQM) {
		console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " nameOfNextField: ", nameOfNextField, "iD ", iId);
	    }
	    field_arr.push({nameOfTextField, nameOfNextField, className, textDiv, iId})
	    for (let m = 0; m < iId.length; m++) {
		fields[clean_name(nameOfNextField)]={ID: iId[m], Type: 'textarea'};
	    }
	}
	// The following have already been taken care of
	// i = 4 is div.diva2addtextchoicecol for "Language"
	// i = 5 is div.diva2addtextchoicebox
    } 
    console.info("in ", nameOfTextField, "fields are:", fields );
    return fields;
}

async function getTextAreaBlanksDegree(nameOfTextField, textareaHandle, page) {
    let fields;			// this will be a dict of the field names and a dict of their IDs and types
    fields={};

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
	if (verboseGQM) {
	    console.info("iteration ", i);
	}

	className = await divs[i]._remoteObject.description;
	console.info("className is ", className);

	if (i == 0 && className === 'div.diva2addtextchoicebr') {
	    // nothing to do here - it is simply "Degree"
	    dText = await page.evaluate(element => element.textContent, divs[i]);
	    if (verboseGQM) {
		console.info("dText should simply say Degree - is ", dText);
	    }
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
	    if (verboseGQM) {
		console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " nameOfNextField: ", nameOfNextField, "iD ", iId);
	    }
	    field_arr.push({nameOfTextField, nameOfNextField, className, textDiv, iId})
	    for (let m = 0; m < iId.length; m++) {
		fields[clean_name(nameOfNextField)]={ID: iId[m], Type: 'level_table'};
	    }
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
	    if (verboseGQM) {
		console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " nameOfNextField: ", nameOfNextField, "iD ", iId);
	    }
	    field_arr.push({nameOfTextField, nameOfNextField, className, textDiv, iId})
	    for (let m = 0; m < iId.length; m++) {
		fields[clean_name(nameOfNextField)]={ID: iId[m], Type: 'credits_table'};
	    }
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
	    if (verboseGQM) {
		console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " nameOfNextField: ", nameOfNextField, "iD ", iId);
	    }
	    field_arr.push({nameOfTextField, nameOfNextField, className, textDiv, iId})
	    for (let m = 0; m < iId.length; m++) {
		fields[clean_name(nameOfNextField)]={ID: iId[m], Type: 'program_table'};
	    }
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
	    if (verboseGQM) {
		console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " nameOfNextField: ", nameOfNextField, "iD ", iId);
	    }
	    field_arr.push({nameOfTextField, nameOfNextField, className, textDiv, iId})
	    for (let m = 0; m < iId.length; m++) {
		fields[clean_name(nameOfNextField)]={ID: iId[m], Type: 'subject_table'};
	    }
	}

	if (i == 9 && className === 'div.diva2addtextchoiceboxbr') {
	    // noting to do here - the "Another degree" was already found
	}
    }
    console.info("in ", nameOfTextField, "fields are:", fields );
    return fields;
}

async function getTextAreaBlanksContentCategory(nameOfTextField, textareaHandle, page) {
    let fields;			// this will be a dict of the field names and a dict of their IDs and types
    fields={};

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
	if (verboseGQM) {
	    console.info("iteration ", i);
	}

	className = await divs[i]._remoteObject.description;
	console.info("className is ", className);

	// <div class="diva2addtextchoiceboxart">
	//    <input class="iceSelBoolChkbx" id="addForm:j_id739" name="addForm:j_id739" onblur="setFocus('');" onclick="iceSubmitPartial(form, this, event);" onfocus="setFocus(this.id);" onkeypress="Ice.util.radioCheckboxEnter(form,this,event);" type="checkbox"><label class="iceOutLbl" for="addForm:slctArtisticWork" id="addForm:j_id740">Artistic work</label></div>

	if (i == 0 && className === 'div.diva2addtextchoicebr') {
	    // nothing to do here - it is simply "Degree"
	    dText = await page.evaluate(element => element.textContent, divs[i]);
	    if (verboseGQM) {
		console.info("dText should simply say Degree - is ", dText);
	    }
	    nameOfNextField='Artistic work';
	}
	if (1 == 1 && className === 'div.diva2addtextplus5') {
	    iId = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
	    iType = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
	    nameOfNextField='Artistic work';
	    if (verboseGQM) {
		console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, "iD ", iId, 'iType:', iType);
	    }
	    field_arr.push({nameOfTextField, className, iId})
	    fields[clean_name(nameOfNextField)]={ID: iId[0], Type: iType[0]};
	}

    }
    console.info("in ", nameOfTextField, "fields are:", fields );
    return fields;
}


async function getTextAreaBlanksOtherInformation(nameOfTextField, textareaHandle, page) {
    let fields;			// this will be a dict of the field names and a dict of their IDs and types
    fields={};

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
	if (verboseGQM) {
	    console.info("iteration ", i);
	}

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
	    if (verboseGQM) {
		console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, "iType:", iType);
	    }
	    field_arr.push({nameOfTextField, className, textDiv, iId})
	    for (let m = 0; m < iId.length; m++) {
		fields[clean_name(textDiv[m])]={ID: iId[m], Type: iType[m]};
	    }

	}
    }
    console.info("in ", nameOfTextField, "fields are:", fields );
    return fields;
}

async function getTextAreaBlanksSeries(nameOfTextField, textareaHandle, page) {
    let fields;			// this will be a dict of the field names and a dict of their IDs and types
    fields={};

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
	if (verboseGQM) {
	    console.info("iteration ", i);
	}

	className = await divs[i]._remoteObject.description;
	console.info("className is ", className);

	if (i == 0 && className === 'div.diva2addtextchoicebr') {
	    // nothing to do here - it is simply "Series"
	    dText = await page.evaluate(element => element.textContent, divs[i]);
	    if (verboseGQM) {
		console.info("dText should simply say Series - is ", dText);
	    }
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
	    iType = await divs[i].$$eval('select', nodes => nodes.map(n => n.getAttribute('type')));
	    if (verboseGQM) {
		console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " nameOfNextField: ", nameOfNextField, "iD ", iId);
	    }
	    field_arr.push({nameOfTextField, nameOfNextField, className, textDiv, iId})
	    fields[clean_name(nameOfNextField)]={ID: iId[0], Type: 'select'};
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
	    if (verboseGQM) {
		console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, " iType:", iType);
	    }
	    field_arr.push({nameOfTextField, className, textDiv, iId, iType})
	    fields['No. in series']={ID: iId[0], Type: iType[0]};
	}

	// if (i == 4 && className === 'div.diva2addtextchoicecol') { // "No. in series:"
	//     dText = await page.evaluate(element => element.textContent, divs[i]);
	//     console.info("dText is ", dText);

	//     if (dText.includes('No. in series')) {
	// 	nameOfNextField='No. in series'; // remember this name since it will be needed later
	// 	console.info("nameOfNextField is ", nameOfNextField);
	//     }
	// }

	// if (i == 5 && className === 'div.diva2addtextchoiceboxseries') {
	//     iId = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
	//     iType = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
	//     //iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));
	//     console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " nameOfNextField: ", nameOfNextField, "iD ", iId, iType, iValue);
	//     field_arr.push({nameOfTextField, nameOfNextField, className, iId, iType, iValue})
	// }
    }
    console.info("in ", nameOfTextField, "fields are:", fields );
    return fields;

}		    

async function getTextAreaBlanksOtherSeries(nameOfTextField, textareaHandle, page) {
    let fields;			// this will be a dict of the field names and a dict of their IDs and types
    fields={};

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
	if (verboseGQM) {
	    console.info("iteration ", i);
	}

	className = await divs[i]._remoteObject.description;
	console.info("className is ", className);

	if (i == 0 && className === 'div.diva2addtextchoicebr') {
	    // nothing to do here - it is simply "Series"
	    dText = await page.evaluate(element => element.textContent, divs[i]);
	    if (verboseGQM) {
		console.info("dText should simply say Series - is ", dText);
	    }
	}

	if (i == 1 && className === 'div.diva2addtextplus5') { // "Title of series/ISSN:"
	    dText = await page.evaluate(element => element.textContent, divs[i]);
	    console.info("dText is ", dText);

	    if (dText.includes('Title of series')) {
		nameOfNextField='Title of series'; // remember this name since it will be needed later
		console.info("nameOfNextField is ", nameOfNextField);
	    }
	}

	if (i == 2 && className === 'div.diva2addtextchoicebox') {
	    iId = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
	    iType = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
	    iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));
	    if (verboseGQM) {
		console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " nameOfNextField: ", nameOfNextField, "iD ", iId, iType, iValue);
	    }
	    field_arr.push({nameOfTextField, nameOfNextField, className, iId, iType, iValue})
	    for (let m = 0; m < iId.length; m++) {
		fields[clean_name(nameOfNextField)]={ID: iId[m], Type: iType[m]};
	    }
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
	    if (verboseGQM) {
		console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " nameOfNextField: ", nameOfNextField, "iD ", iId, iType, iValue);
	    }
	    field_arr.push({nameOfTextField, nameOfNextField, className, iId, iType, iValue})
	    for (let m = 0; m < iId.length; m++) {
		fields[clean_name(nameOfNextField)]={ID: iId[m], Type: iType[m]};
	    }
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
	    if (verboseGQM) {
		console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " nameOfNextField: ", nameOfNextField, "iD ", iId, iType, iValue);
	    }
	    field_arr.push({nameOfTextField, nameOfNextField, className, iId, iType, iValue})
	    for (let m = 0; m < iId.length; m++) {
		fields[clean_name(nameOfNextField)]={ID: iId[m], Type: iType[m]};
	    }
	}

	if (i == 7 && className === 'div.diva2addtextchoicecol') { // "No. in series:"
	    dText = await page.evaluate(element => element.textContent, divs[i]);
	    console.info("dText is ", dText);

	    if (dText.includes('No.')) {
		nameOfNextField='No. in series'; // remember this name since it will be needed later
		console.info("nameOfNextField is ", nameOfNextField);
	    }
	}

	if (i == 8 && className === 'div.diva2addtextchoicebox') { // a select box for the series string
	    iId = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
	    iType = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
	    iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));
	    if (verboseGQM) {
		console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " nameOfNextField: ", nameOfNextField, "iD ", iId, iType, iValue);
	    }
	    field_arr.push({nameOfTextField, nameOfNextField, className, iId, iType, iValue})
	    for (let m = 0; m < iId.length; m++) {
		fields[clean_name(nameOfNextField)]={ID: iId[m], Type: iType[m]};
	    }
	}

    }
    console.info("in ", nameOfTextField, "fields are:", fields );
    return fields;
}

async function getTextAreaBlanksIdentifiers(nameOfTextField, textareaHandle, page) {
    let fields;			// this will be a dict of the field names and a dict of their IDs and types
    fields={};

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
	if (verboseGQM) {
	    console.info("iteration ", i);
	}

	className = await divs[i]._remoteObject.description;
	console.info("className is ", className);

	if (i == 0 && className === 'div.diva2addtextchoicebr') {
	    // nothing to do here - it is simply "Identifiers"
	    dText = await page.evaluate(element => element.textContent, divs[i]);
	    if (verboseGQM) {
		console.info("dText should simply say Identifiers - is ", dText);
	    }
	}

	if (i == 1 && className === 'div.diva2addtextplus5') { // "URI:" will be the URI generated by DiVA
	    dText = await page.evaluate(element => element.textContent, divs[i]);
	    console.info("dText is ", dText);

	    if (dText.includes('URI')) {
		nameOfNextField='URI'; // remember this name since it will be needed later
		console.info("nameOfNextField is ", nameOfNextField);
		if (verboseGQM) {
		    console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " nameOfNextField: ", nameOfNextField, "dText ", dText);
		}
		field_arr.push({nameOfTextField, nameOfNextField, className, dText})
		fields[clean_name(nameOfNextField)]={Type: 'URI', Value: dText};
	    }
	}

	if (i == 2 && className.includes('diva2addtextplus5')) { // DiVA-ID: ---- this is not displayed!
	    dText = await page.evaluate(element => element.textContent, divs[i]);
	    console.info("dText is ", dText);
	}

	// i = 3 is "Clearer"
	if (i == 4 && className === 'div.diva2addtextplus5') { // "ISRN:"
	    dText = await page.evaluate(element => element.textContent, divs[i]);
	    console.info("dText is ", dText);

	    if (dText.includes('ISRN')) {
		nameOfNextField='ISRN'; // remember this name since it will be needed later
		console.info("nameOfNextField is ", nameOfNextField);
	    }

	    iId = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
	    iType = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
	    iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));
	    if (verboseGQM) {
		console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " nameOfNextField: ", nameOfNextField, "iD ", iId, iType, iValue);
	    }
	    field_arr.push({nameOfTextField, nameOfNextField, className, iId, iType, iValue});
	    fields[clean_name(nameOfNextField)]={ID: iId[0], Type: iType[0]};
	}


	if (i == 5 && className === 'div.diva2addtextplus5') {
	    dText = await page.evaluate(element => element.textContent, divs[i]);
	    console.info("dText is ", dText);

	}
	if (i == 6 && className === 'div.diva2addtextplus5') {
	    dText = await page.evaluate(element => element.textContent, divs[i]);
	    console.info("dText is ", dText);

	}

	if (i == 7 && className === 'div.diva2addtextplus4') { // "DOI:"
	    dText = await page.evaluate(element => element.textContent, divs[i]);
	    console.info("dText is ", dText);

	    if (dText.includes('DOI')) {
		nameOfNextField='DOI'; // remember this name since it will be needed later
		console.info("nameOfNextField is ", nameOfNextField);
	    }

	    iId = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
	    iType = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
	    iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));
	    if (verboseGQM) {
		console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " nameOfNextField: ", nameOfNextField, "iD ", iId, iType, iValue);
	    }
	    field_arr.push({nameOfTextField, nameOfNextField, className, iId, iType, iValue})
	    fields[clean_name(nameOfNextField)]={ID: iId[0], Type: iType[0]};
	    fields[clean_name(nameOfNextField)+'_Free_full_text']={ID: iId[1], Type: iType[1]};
	}

	if (i == 8 && className.includes('icePnlSrs')) { // "URL:" & "URL label:"
	    textDiv = await divs[i].$$eval('div.diva2addtextchoicecol', nodes => nodes.map(n => n.textContent));
	    iId = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
	    iType = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
	    //iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));
	    if (verboseGQM) {
		console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, " iType:", iType);
	    }
	    field_arr.push({nameOfTextField, className, textDiv, iId, iType})
	    fields[clean_name(textDiv[0])]={ID: iId[0], Type: iType[0]};
	    fields[clean_name(textDiv[1])]={ID: iId[1], Type: iType[1]};
	    fields[clean_name(textDiv[0])+'_Free_full_text']={ID: iId[2], Type: iType[2]};
	}

	// i = 7 Add URL already taken care of
    }
    console.info("in ", nameOfTextField, "fields are:", fields );
    return fields;
}

async function getTextAreaBlanksNationalSubjectCategory(nameOfTextField, textareaHandle, page) {
    let fields;			// this will be a dict of the field names and a dict of their IDs and types
    fields={};

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
	    if (verboseGQM) {
		console.info("dText should simply say National subject category - is ", dText);
	    }
	}

	if (i == 1 && className.includes('icePnlGrp')) { // 
	    textDiv = await divs[i].$$eval('div.diva2addtextchoicecol', nodes => nodes.map(n => n.textContent));
	    iId = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
	    iType = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
	    iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));
	    if (verboseGQM) {
		console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, " iType:", iType);
	    }
	    field_arr.push({nameOfTextField, className, textDiv, iId, iType})
	    fields[clean_name(iValue[0])]={ID: iId[0], Type: iType[0]};
	}

	// i = 6 is icePnlSrs - Unknown
    }
    console.info("in ", nameOfTextField, "fields are:", fields );
    return fields;
}


async function getTextAreaBlanksPartOfProject(nameOfTextField, textareaHandle, page) {
    let fields;			// this will be a dict of the field names and a dict of their IDs and types
    fields={};

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
	    if (verboseGQM) {
		console.info("dText should simply say Part of project - is ", dText);
	    }
	}

	// The rest is taken care of by the add "Another project" button
    }
    console.info("in ", nameOfTextField, "fields are:", fields );
    return fields;

}

async function getTextAreaBlanksPartOfOtherProject(nameOfTextField, textareaHandle, page) {
    let fields;			// this will be a dict of the field names and a dict of their IDs and types
    fields={};

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
	    if (verboseGQM) {
		console.info("dText should simply say Part of other project - is ", dText);
	    }
	}

	if (i == 1 && className.includes('icePnlSrs')) { // 
	    iId = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
	    iType = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
	    if (verboseGQM) {
		console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, "iD ", iId, " iType:", iType);
	    }
	    field_arr.push({nameOfTextField, className, iId, iType})
	    fields['Project_name']={ID: iId[1], Type: iType[1]};
	}

	// i = 2 Another project button
    }
    console.info("in ", nameOfTextField, "fields are:", fields );
    return fields;

}


async function getTextAreaBlanksKeywords(nameOfTextField, textareaHandle, page) {
    let fields;			// this will be a dict of the field names and a dict of their IDs and types
    fields={};

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
	    if (verboseGQM) {
		console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, " iType:", iType);
	    }
	    field_arr.push({nameOfTextField, className, textDiv, iId, iType})
	    fields['Keywords']={ID: iId[0], Type: iType[0]};

	    iId = await divs[i].$$eval('select', nodes => nodes.map(n => n.getAttribute('id')));
	    iType = await divs[i].$$eval('select', nodes => nodes.map(n => n.getAttribute('type')));
	    fields['Language']={ID: iId[0], Type: iType[0]};
	}

	// i = 2 Another keywords button
	if (i == 2 && className === 'div.diva2addtextchoiceboxbr') { // 
	    iId = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
	    iType = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
	    iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));
	    if (verboseGQM) {
		console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, " iType:", iType, " iValue", iValue);
	    }
	    field_arr.push({nameOfTextField, className, textDiv, iId, iType})
	    fields[clean_name(iValue[0])]={ID: iId[0], Type: iType[0]};
	}
    }
    console.info("in ", nameOfTextField, "fields are:", fields );
    return fields;
}

async function getTextAreaBlanksAbstract(nameOfTextField, textareaHandle, page) {
    let fields;			// this will be a dict of the field names and a dict of their IDs and types
    fields={};

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
	    if (verboseGQM) {
		console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " nameOfNextField: ", nameOfNextField, "iId: ", iId);
	    }
	    field_arr.push({nameOfTextField, nameOfNextField, className, textDiv, iId})
	    fields['Abstract']={ID: iId[0], Type: 'textarea'};
	}

	// i = 2 Another project button
    }
    console.info("in ", nameOfTextField, "fields are:", fields );
    return fields;
}


async function getTextAreaBlanksSupervisor(nameOfTextField, textareaHandle, page) {
    let fields;			// this will be a dict of the field names and a dict of their IDs and types
    fields={};

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

	    if (verboseGQM) {
		console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
	    }
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

	    if (verboseGQM) {
		console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
	    }
	    field_arr.push({nameOfTextField, className, textDiv, iId, iType, iValue})
	    for (let m = 0; m < iId.length; m++) {
		fields[clean_name(textDiv[m])]={ID: iId[m], Type: iType[m]};
	    }
	}
	if (i == 2 && className === 'div.diva2addtextplusname') { // 'First name'
	    textDiv = await divs[i].$$eval('.diva2addtextchoicecol', nodes => nodes.map(i => i.textContent));
	    console.info("textDiv is ", textDiv);

	    iId    = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
	    iType  = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
	    iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));

	    if (verboseGQM) {
		console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
	    }
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

	    if (verboseGQM) {
		console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
	    }
	    field_arr.push({nameOfTextField, className, textDiv, iId, iType, iValue})
	    for (let m = 0; m < iId.length; m++) {
		fields[clean_name(textDiv[m])]={ID: iId[m], Type: iType[m]};
	    }
	}

	if (i == 4 && className === 'div.diva2addtextplusid') { // 'ORCiD:'
	    textDiv = await divs[i].$$eval('div.diva2addtextchoicecolbr', nodes => nodes.map(i => i.textContent));
	    console.info("textDiv is ", textDiv);

	    iId    = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
	    iType  = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
	    iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));

	    if (verboseGQM) {
		console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
	    }
	    field_arr.push({nameOfTextField, className, textDiv, iId, iType, iValue})
	    for (let m = 0; m < iId.length; m++) {
		fields[clean_name(textDiv[m])]={ID: iId[m], Type: iType[m]};
	    }
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

	    if (verboseGQM) {
		console.info("about to push nameOfNextField", nameOfNextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
	    }
	    field_arr.push({nameOfNextField, className, textDiv, iId, iType, iValue})
	    // note that a click on this field invokes: moveOrganisationPopupIntoView();iceSubmit(form,this,event)
	    for (let m = 0; m < iId.length; m++) {
		fields[clean_name(iValue[m])]={ID: iId[m], Type: iType[m]};
	    }
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

	    if (verboseGQM) {
		console.info("about to push nameOfNextField", nameOfNextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
	    }
	    field_arr.push({nameOfNextField, className, textDiv, iId, iType, iValue})
	    for (let m = 0; m < iId.length; m++) {
		fields[clean_name(nameOfNextField)]={ID: iId[m], Type: iType[m]};
	    }
	}

	if (i == 10 && className === 'div.diva2addtextchoicecol') { // 'Other organisationl'
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

	    if (verboseGQM) {
		console.info("about to push nameOfNextField", nameOfNextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
	    }
	    field_arr.push({nameOfNextField, className, textDiv, iId, iType, iValue})
	    for (let m = 0; m < iId.length; m++) {
		fields[clean_name(nameOfNextField)]={ID: iId[m], Type: iType[m]};
	    }

	    nameOfNextField=''; // no longer valid
	}
	// Ignore the remaining fields
    }
    console.info("in ", nameOfTextField, "fields are:", fields );
    return fields;
}

async function getTextAreaBlanksExaminer(nameOfTextField, textareaHandle, page) {
    let fields;			// this will be a dict of the field names and a dict of their IDs and types
    fields={};

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

	    if (verboseGQM) {
		console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
	    }
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

	    if (verboseGQM) {
		console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
	    }
	    field_arr.push({nameOfTextField, className, textDiv, iId, iType, iValue})
	    for (let m = 0; m < iId.length; m++) {
		fields[clean_name(textDiv[m])]={ID: iId[m], Type: iType[m]};
	    }
	}
	if (i == 2 && className === 'div.diva2addtextplusname') { // 'First name'
	    textDiv = await divs[i].$$eval('.diva2addtextchoicecol', nodes => nodes.map(i => i.textContent));
	    console.info("textDiv is ", textDiv);

	    iId    = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
	    iType  = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
	    iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));

	    if (verboseGQM) {
		console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
	    }
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

	    if (verboseGQM) {
		console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
	    }
	    field_arr.push({nameOfTextField, className, textDiv, iId, iType, iValue})
	    for (let m = 0; m < iId.length; m++) {
		fields[clean_name(textDiv[m])]={ID: iId[m], Type: iType[m]};
	    }
	}

	if (i == 4 && className === 'div.diva2addtextplusid') { // 'ORCiD:'
	    textDiv = await divs[i].$$eval('div.diva2addtextchoicecolbr', nodes => nodes.map(i => i.textContent));
	    console.info("textDiv is ", textDiv);

	    iId    = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
	    iType  = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
	    iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));

	    if (verboseGQM) {
		console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
	    }
	    field_arr.push({nameOfTextField, className, textDiv, iId, iType, iValue})
	    for (let m = 0; m < iId.length; m++) {
		fields[clean_name(textDiv[m])]={ID: iId[m], Type: iType[m]};
	    }
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

	    if (verboseGQM) {
		console.info("about to push nameOfNextField", nameOfNextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
	    }
	    field_arr.push({nameOfNextField, className, textDiv, iId, iType, iValue})
	    // note that a click on this field invokes: moveOrganisationPopupIntoView();iceSubmit(form,this,event)
	    for (let m = 0; m < iId.length; m++) {
		fields[clean_name(iValue[m])]={ID: iId[m], Type: iType[m]};
	    }
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

	    if (verboseGQM) {
		console.info("about to push nameOfNextField", nameOfNextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
	    }
	    field_arr.push({nameOfNextField, className, textDiv, iId, iType, iValue})
	    for (let m = 0; m < iId.length; m++) {
		fields[clean_name(nameOfNextField)]={ID: iId[m], Type: iType[m]};
	    }
	}

	if (i == 10 && className === 'div.diva2addtextchoicecol') { // 'Other organisationl'
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

	    if (verboseGQM) {
		console.info("about to push nameOfNextField", nameOfNextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
	    }
	    field_arr.push({nameOfNextField, className, textDiv, iId, iType, iValue})
	    for (let m = 0; m < iId.length; m++) {
		fields[clean_name(nameOfNextField)]={ID: iId[m], Type: iType[m]};
	    }

	    nameOfNextField=''; // no longer valid
	}
	// Ignore the remaining fields
    }
    console.info("in ", nameOfTextField, "fields are:", fields );
    return fields;

}


async function getTextAreaBlanksPresentation(nameOfTextField, textareaHandle, page) {
    let fields;			// this will be a dict of the field names and a dict of their IDs and types
    fields={};

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

	    if (verboseGQM) {
		console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
	    }
	    field_arr.push({nameOfTextField, className, textDiv, iId, iType, iValue})
	    fields[clean_name(textDiv[0])]={ID: iId[0], Type: iType[0]};


	    iId    = await divs[i].$$eval('select', nodes => nodes.map(n => n.getAttribute('id')));
	    iType  = await divs[i].$$eval('select', nodes => nodes.map(n => n.getAttribute('type')));
	    iValue = await divs[i].$$eval('select', nodes => nodes.map(n => n.getAttribute('value')));

	    if (verboseGQM) {
		console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " Language: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
	    }
	    field_arr.push({nameOfTextField, className, textDiv, iId, iType, iValue})
	    fields[clean_name(textDiv[1])]={ID: iId[0], Type: iType[0]};

	}
	if (i == 2 && className === 'div.diva2addtextplus') { // 'Room:'
	    textDiv = await divs[i].$$eval('.diva2addtextchoicecol', nodes => nodes.map(i => i.textContent));
	    console.info("textDiv is ", textDiv);

	    iId    = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
	    iType  = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
	    iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));

	    if (verboseGQM) {
		console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
	    }
	    field_arr.push({nameOfTextField, className, textDiv, iId, iType, iValue})
	    fields[clean_name(textDiv[0])]={ID: iId[0], Type: iType[0]};
	}

	if (i == 3 && className === 'div.diva2addtextplus') { // 'Address:'
	    textDiv = await divs[i].$$eval('div.diva2addtextchoicecol', nodes => nodes.map(i => i.textContent));
	    console.info("textDiv is ", textDiv);

	    iId    = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
	    iType  = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
	    iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));

	    if (verboseGQM) {
		console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
	    }
	    field_arr.push({nameOfTextField, className, textDiv, iId, iType, iValue})
	    fields[clean_name(textDiv[0])]={ID: iId[0], Type: iType[0]};
	}

	if (i == 4 && className === 'div.diva2addtextplus') { // 'City:'
	    textDiv = await divs[i].$$eval('div.diva2addtextchoicecol', nodes => nodes.map(i => i.textContent));
	    console.info("textDiv is ", textDiv);

	    iId    = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('id')));
	    iType  = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('type')));
	    iValue = await divs[i].$$eval('input', nodes => nodes.map(n => n.getAttribute('value')));

	    if (verboseGQM) {
		console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " textDiv: ", textDiv, "iD ", iId, "iType ", iType, "iValue", iValue);
	    }
	    field_arr.push({nameOfTextField, className, textDiv, iId, iType, iValue})
	    fields[clean_name(textDiv[0])]={ID: iId[0], Type: iType[0]};
	}
	// Ignore the remaining fields
    }
    console.info("in ", nameOfTextField, "fields are:", fields );
    return fields;

}

async function getTextAreaBlanksNote(nameOfTextField, textareaHandle, page) {
    let fields;			// this will be a dict of the field names and a dict of their IDs and types
    fields={};

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
	    if (verboseGQM) {
		console.info("about to push nameOfTextField", nameOfTextField, "className: ", className, " nameOfNextField: ", nameOfNextField, "iId: ", iId);
	    }
	    field_arr.push({nameOfTextField, nameOfNextField, className, textDiv, iId})
	    fields[clean_name(nameOfTextField)]={ID: iId[0], Type: 'textarea'};
	}

	// i = 2 Another project button
    }
    console.info("in ", nameOfTextField, "fields are:", fields );
    return fields;

}


async function getTextAreaBlanks(page) {
    let textareaHandles;
    textareaHandles = await page.$$('div.diva2addtextarea');
    //console.info("in getTextAreaContent handles are ", textareaHandles)

    let all_fields;			// this will be a dict of the field names and a dict of their IDs and types
    all_fields={};

    let text_arr;
    let j=0;
    // loop thru all handles
    text_arr = [];
    for(const textareaHandle of textareaHandles){
	let nameOfTextArea='';
	let nameOfTextField=await page.evaluate(el => el.querySelector('div.diva2addtextchoice2').textContent, textareaHandle);
	//let field_arr=[];
	let field_arr;
	
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
	//text_arr.push(field_arr);
	all_fields[clean_name(nameOfTextField.trim())]=field_arr; // remove the trailing space from "Presentation "
	console.info("nameOfTextField is ", nameOfTextField, "field_arr is ", field_arr );


	// to short circuit testing
	//if (j >= 21) {
	//return text_arr;
	//}

	j=j+1;
    }
    return all_fields;
}

// get a single area's blanks
async function getATextAreaBlanks(page, specificArea) {
    let textareaHandles;
    textareaHandles = await page.$$('div.diva2addtextarea');
    //console.info("in getTextAreaContent handles are ", textareaHandles)

    let areas_fields;			// this will be a dict of the field names and a dict of their IDs and types

    // loop thru all handles
    for(const textareaHandle of textareaHandles){
	let nameOfTextArea='';
	let nameOfTextField=await page.evaluate(el => el.querySelector('div.diva2addtextchoice2').textContent, textareaHandle);
	
	nameOfTextField=nameOfTextField.trim()
	if (specificArea == nameOfTextField) {
	    if (nameOfTextField.startsWith('Author')) {
		areas_fields = await getTextAreaBlanksAuthor(nameOfTextField, textareaHandle, page);
	    } else if (nameOfTextField.startsWith('Cooperation'))  {
		areas_fields = await getTextAreaBlanksCooperation(nameOfTextField, textareaHandle, page);
	    } else if (nameOfTextField === 'Title')  {
		areas_fields = await getTextAreaBlanksTitle(nameOfTextField, textareaHandle, page);
	    } else if (nameOfTextField.startsWith('Alternative title'))  {
		areas_fields = await getTextAreaBlanksAlternativeTitle(nameOfTextField, textareaHandle, page);
	    } else if (nameOfTextField.startsWith('Degree'))  {
		areas_fields = await getTextAreaBlanksDegree(nameOfTextField, textareaHandle, page);
	    } else if (nameOfTextField.startsWith('Content category'))  {
		areas_fields = await getTextAreaBlanksContentCategory(nameOfTextField, textareaHandle, page);
	    } else if (nameOfTextField === 'Other information')  {
		areas_fields = await getTextAreaBlanksOtherInformation(nameOfTextField, textareaHandle, page);
	    } else if (nameOfTextField.startsWith('Series'))  {
		areas_fields = await getTextAreaBlanksSeries(nameOfTextField, textareaHandle, page);
	    } else if (nameOfTextField === 'Other series')  {
		areas_fields = await getTextAreaBlanksOtherSeries(nameOfTextField, textareaHandle, page);
	    } else if (nameOfTextField.startsWith('Identifiers'))  {
		areas_fields = await getTextAreaBlanksIdentifiers(nameOfTextField, textareaHandle, page);
	    } else if (nameOfTextField.startsWith('National subject category'))  {
		areas_fields = await getTextAreaBlanksNationalSubjectCategory(nameOfTextField, textareaHandle, page);
	    } else if (nameOfTextField.startsWith('Part of project'))  {
		areas_fields = await getTextAreaBlanksPartOfProject(nameOfTextField, textareaHandle, page);
	    } else if (nameOfTextField.startsWith('Part of other project'))  {
		areas_fields = await getTextAreaBlanksPartOfOtherProject(nameOfTextField, textareaHandle, page);
	    } else if (nameOfTextField.startsWith('Keywords'))  {
		areas_fields = await  getTextAreaBlanksKeywords(nameOfTextField, textareaHandle, page);
	    } else if (nameOfTextField.startsWith('Abstract'))  {
		areas_fields = await  getTextAreaBlanksAbstract(nameOfTextField, textareaHandle, page);
	    } else if (nameOfTextField.startsWith('Supervisor'))  {
		areas_fields = await  getTextAreaBlanksSupervisor(nameOfTextField, textareaHandle, page);
	    } else if (nameOfTextField.startsWith('Examiner'))  {
		areas_fields = await  getTextAreaBlanksExaminer(nameOfTextField, textareaHandle, page);
	    } else if (nameOfTextField.startsWith('Presentation'))  {
		areas_fields = await  getTextAreaBlanksPresentation(nameOfTextField, textareaHandle, page);
	    } else if (nameOfTextField.includes('Note'))  {
		areas_fields = await  getTextAreaBlanksNote(nameOfTextField, textareaHandle, page);
	    } else {
		console.info("in getATextAreaBlanks - I do not know what to do for ", specificArea);
		return null;
	    }
	    console.info("nameOfTextField is ", nameOfTextField, "areas_fields is ", areas_fields );
	    return areas_fields;
	}
    }
}

// this function will return an object of the form:  { 'Change type': 'addForm:j_id658', 'Another author': 'addForm:authorSerie:0:j_id755', 'Add partner': 'addForm:j_id785', ... }
async function getTextareabuttonHandles(page) {
    let textareabuttonHandles;
    textareabuttonHandles = await page.$$('input.iceCmdBtn.diva2addsokbutton');
    // loop thru all handles
    let buttons;
    let clean_button_name;

    buttons={};
    
    for(const textareaHandle of textareabuttonHandles){
	// pass the single handle below
	const singleButton_id = await page.evaluate(el => el.id, textareaHandle); //  the id will be of the form: 'addForm:j_id785'
	// console.log("button id", singleButton_id) 
	const singleButton_value = await page.evaluate(el => el.value, textareaHandle);
	// the value will be in the form: 'Another author »', hence remove the Right-pointing double angle quotation mark; and the trailing space
	clean_button_name=singleButton_value.replace(/»/g,'').trim();
	buttons[clean_button_name]=singleButton_id;
	// console.log("button value", singleButton_value) 
    }
    return buttons;
}

// set the language field of a given textAreaName
async function setTextAreaLang(page, textareaHandles, areaNames, textAreaName, lang) {
    console.info("In setTextAreaLang  textAreaName is ", textAreaName);
    let areaHandle;
    let language_id;
    areaHandle=lookup_textAreaHandle(textareaHandles, areaNames, textAreaName);
    if (areaHandle == null) {
	console.error("In setTextAreaLang areaHandle is undefined for ", textAreaName);
    } else {
	//console.info("In setTextAreaLang areaHandle is ", areaHandle);
	language_id = await page.evaluate(el => {
	    const s1=el.querySelector('.diva2addtextselectlang').id
	    //console.info("id of select is ", s1);
	    return s1;
	}, areaHandle);
	//console.info(textAreaName, " language_id is ", language_id);
	selector = 'select[id="'+language_id+'"]';
	await page.select(selector, lang);
    }
}

// To add an additional textarea - click on the corresponding button, for example 'Another author'
async function addTextArea(page, buttonHandles, textAreaName) {
    // for the case of keywords in two languages: look for the 'Keywords in another language' and click it
    let add_button_id;
    let selector;
    
    //add_button_id=lookup_button(buttonHandles, textAreaName)
    add_button_id=buttonHandles[textAreaName];
    if (verboseGQM) {
	console.info("about to click ", textAreaName, " button with the id=", add_button_id);
    }
    selector = 'input[id="'+add_button_id+'"]';
    await page.waitFor(1000);
    const add_another = await page.click(selector);
    if (verboseGQM) {
	console.info("just after clicking  ", textAreaName, " button with the id=", add_button_id);
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
    let popupSelector;
    let pageSelector;

    popupSelector=make_selector_from_id(blanks[textAreaName]['Choose organisation »'].ID);
    //
    // wait for the form to the popup to appear
    //selector=make_prefix_selector_from_id('organisationPopupForm:tree:n-root');
    pageSelector=make_prefix_selector_from_id('organisationPopupForm:tree-d-root');
    //await page.waitFor(3000);
    await Promise.all([
	await page.click(popupSelector),
	await page.waitFor(pageSelector)
    ]);


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

   
    // for L1 and L2
    // 'organisationPopupForm:tree-d-root-c' has a list of the Schools
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


async function makeNationalSubjectCategorySelection(page, blanks, textAreaName) {
    //
    // The nationalCategoryPopupForm:tree is dynamically loaded and only the part that you have visible
    // can be selected from.
    // Accessing selectors of the form '[id="nationalCategoryPopupForm:tree-d-1"] a'
    // access the "+" GIF and make this part of the tree visible. [Note the "d" in the name.]
    // To access the actual category entry, use a selector that has ":n" in it rather than a "d".
    //

    selector=make_selector_from_id(blanks[textAreaName]['Choose national subject category »'].ID);
    await page.click(selector);
    // wait for the form to the popup to appear
    selector=make_prefix_selector_from_id('nationalCategoryPopupForm:tree:n-root');
    await page.waitFor(3000);
    await page.waitFor(selector);


    // look for National Subkect Caterogy in the thesis_info strucuture
    // Consider the case:
    // "National subject category":{
    // 	"L1": "Engineering and Technology",
    // 	"L2": "Electrical Engineering, Electronic Engineering, Information Engineering",
    // 	"L3": "Communication Systems",
    // },

    let tmp;			// the base of the ID to be used

    // the subject information from the National Subject Category structure
    let tmp1;			// for L1
    let tmp2;			// for L2
    let tmp3;			// for L3
    if (thesis_info[textAreaName].hasOwnProperty('L1')) {
	tmp1=thesis_info[textAreaName]['L1'];
	tmp=nationalSubjectCategory[tmp1]['ID'];
	//console.info("tmp1 is ", tmp1, "tmp is", tmp);

	selector=make_selector_from_id('nationalCategoryPopupForm:tree-d-'+tmp)+' a';
	console.info("first level selector is ", selector);
	await page.waitFor(selector); // wait for the selector to be available
	await page.click(selector);
	//await page.waitFor(1500);

	if (thesis_info[textAreaName].hasOwnProperty('L2')) {
	    tmp2=thesis_info[textAreaName]['L2'];
	    tmp=nationalSubjectCategory[tmp1][tmp2]['ID'];
	    //console.info("tmp2 is ", tmp2, "tmp is", tmp);
	    selector=make_selector_from_id('nationalCategoryPopupForm:tree-d-'+tmp)+' a';
	    console.info("second level selector is ", selector);
	    await page.waitFor(selector); // wait for the selector to be available
	    await page.click(selector);
	    //await page.waitFor(1500);

	    if (thesis_info[textAreaName].hasOwnProperty('L3')) {
		tmp3=thesis_info[textAreaName]['L3'];
		tmp=nationalSubjectCategory[tmp1][tmp2][tmp3]['ID'];
		//console.info("tmp3 is ", tmp3, "tmp is", tmp);
		selector=make_selector_from_id('nationalCategoryPopupForm:tree-d-'+tmp)+' a';
		console.info("third level selector is ", selector);
		await page.waitFor(selector); // wait for the selector to be available
		await page.click(selector);
		//await page.waitFor(1500);
	    } else {
		// nationalCategoryPopupForm:tree:n-9-1
		// note that "tmp" comes from before the "if"
		selector=make_prefix_selector_from_id('nationalCategoryPopupForm:tree:n-'+tmp)+' a';
		console.info("second level selector is ", selector);
		await page.waitFor(selector); // wait for the selector to be available
		await page.click(selector);
		//await page.waitFor(1500);
	    }

	} else {
	    // nationalCategoryPopupForm:tree:n-9-1
	    selector=make_prefix_selector_from_id('nationalCategoryPopupForm:tree:n-'+tmp)+' a';
	    console.info("first level selector is ", selector);
	    await page.waitFor(selector); // wait for the selector to be available
	    await page.click(selector);
	    await page.waitFor(1500);
	}
    } else {
	console.info("No address has been specified", selector);
	selector=make_prefix_selector_from_id('nationalCategoryPopupForm:tree:n-root'+tmp)+' a';
	console.info("root level selector is ", selector);
	await page.waitFor(selector); // wait for the selector to be available
	await page.click(selector);
	await page.waitFor(1500);
    }
    console.info("selected the National Subject Category")
}

//////////////////////////////////////////////////////////////////////
// routines to divide up the main actions
async function gotoTargePage(page, partialURL) {
    const maximuAttempts=10;
    const host_name=config.diva.host;
    for (let attemptNumber=0; attemptNumber < maximuAttempts; attemptNumber++) {
	let pageFound;
	const target_diva_url='https://'+host_name+partialURL
	console.log("target_diva_url is ", target_diva_url);
	await page.goto(target_diva_url, {waitUntil: 'load'});
	pageFound=page.url();
	console.log('FOUND!', pageFound);
	if (pageFound == target_diva_url) {
	    //This will produce: FOUND! https://kth.test.diva-portal.org/dream/add/add1.jsf
	    // since the user is now logged in
	    return true;
	}
	if (pageFound.startsWith('https://login.kth.se/login')) {
	    await page.focus('#username');
	    await page.type('#username', config.diva.username);
	    await page.focus('#password');
	}
	await page.waitForNavigation();
    }
    console.error("In gotoTargePage: failed to reach target ", partialURL, " after ", maximuAttempts, "tries");
}

//////////////////////////////////////////////////////////////////////


async function main() {

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

    const page = await browser.newPage(); // creates a browser window and loads the URL "about:blank"
    await page.setViewport({
	width: 1280,
	height: 800,
	deviceScaleFactor: 1,
    });
    
    // the following line makes it possible to see the console in the running browser
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    // execute a commands in the browser - will generate "PAGE LOG: url is about:blank"
    await page.evaluate(() => console.log(`url is ${location.href}`));

    if (verboseGQM) {
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
    };
    // show the responses so that one can understand when AJAX is working
	page.on("response", response => {
	    const request = response.request();
	    const url = request.url();
	    const status = response.status();
	    console.log("response url:", url, "status:", status);
	});


    // //diva1_url='http://'+host_name+'/dream/info.jsf'
    // diva1_url='https://'+host_name+'/dream/add/add1.jsf'
    // console.log("diva1_url is ", diva1_url);
    // await page.goto(diva1_url, {waitUntil: 'load'});
    // console.log('FOUND!', page.url());
    // // This will produce: FOUND! https://saml-5.sys.kth.se/idp/profile/SAML2/Redirect/SSO?execution=e1s1
    // // since the user is not yet logged in
    
    // await page.waitForNavigation();

    // diva2_url='https://'+host_name+'/dream/add/add1.jsf'
    // console.log("diva2_url is ", diva2_url);
    // await page.goto(diva2_url, {waitUntil: 'load'});
    // console.log('FOUND!', page.url());
    // // This will produce: https://login.kth.se/login?service=https%3A%2F%2Fsaml-5.sys.kth.se%2Fidp%2FAuthn%2FExtCas%3Fconversation%3De2s1&entityId=https%3A%2F%2Fwww.diva-portal.org%2Fshibboleth
    // if (await page.url().includes('https://login.kth.se/login')) {
    // 	await page.focus('#username');
    // 	await page.type('#username', config.diva.username);
    // 	await page.focus('#password');
    // }
    // await page.waitForNavigation();

    // // 2nd try
    // //diva1_url='http://'+host_name+'/dream/info.jsf'
    // diva1_url='https://'+host_name+'/dream/add/add1.jsf'
    // console.log("diva1_url is ", diva1_url);
    // await page.goto(diva1_url, {waitUntil: 'load'});
    // console.log('FOUND!', page.url());
    // // This will produce something line: FOUND! https://saml-5.sys.kth.se/idp/profile/SAML2/Redirect/SSO?SAMLRequest=xxxxxxx
    
    // await page.waitForNavigation();

    // // go to the page to add a publication
    // diva_add_url='https://'+host_name+'/dream/add/add1.jsf'
    // console.log("diva_add_url is ", diva_add_url);
    // await page.goto(diva_add_url, {waitUntil: 'load'});
    // console.log('FOUND!', page.url());
    await gotoTargePage(page, '/dream/add/add1.jsf');

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

    // use brute force to fill in the Lastname field for the author - just to show something can be filled in.

    // let message1= await page.evaluate(() => {
    // 	const s1=document.querySelector('div.diva2addtextplusname');
    // 	const s2=s1.querySelector('div.diva2addtextchoicecolbr').textContent;
    // 	// should be "Last name:*"
    // 	s1.querySelector('div.diva2addtextchoicebox input.iceInpTxt').value='Maguire';
    // 	return s1;
    // });
    // console.info("message1 is ", message1); // note that this will simply return "{}".

    // const testAreas_innerHTML = await page.evaluate(() => Array.from(document.querySelectorAll('div.diva2addtextarea'),
    // 								     element => element.querySelector('div.diva2addtextchoice2').textContent));
    // console.info("testAreas_innerHTML is ", testAreas_innerHTML);

    // tas=document.querySelectorAll('div.diva2addtextarea')
    // for(e of tas) {console.info(e.querySelector('div.diva2addtextchoice2').textContent)}


    let textareaHandles;
    let text_arr;
    let areaNames;
    let buttonHandles;

    textareaHandles = await getTextAreaHandles(page);
    areaNames = await getTextAreaContent(page);
    console.info("areaNames are ", areaNames);
    // areaNames are  [ 'Author1', 'Cooperation', 'Title', 'Alternative title', 'Degree', 'Content category', 'Other information', 'Series', 'Other series',
    // 'Identifiers', 'National subject category*', 'Part of project', 'Part of other project', 'Keywords1', 'Abstract1', 'Supervisor1', 'Examiner1', 'Presentation ', 'Note' ]
    
    buttonHandles=await getTextareabuttonHandles(page)
    console.info("buttonHandles are ", buttonHandles)
    // This will return
    // buttonHandles are  { 'Change type': 'addForm:j_id658',  'Another author': 'addForm:authorSerie:0:j_id755',  'Add partner': 'addForm:j_id785',  'Another URL': 'addForm:j_id1023',
    //                      'Another other project': 'addForm:j_id1087:0:j_id1095',  'Keywords in another language': 'addForm:keywordList:0:j_id1121',  'Another abstract': 'addForm:j_id1122:0:j_id1148',
    //                      'Save personal data': 'addForm:examinerSerie:0:j_id1261',  'Another supervisor': 'addForm:supervisorSerie:0:j_id1229',  'Another examiner': 'addForm:examinerSerie:0:j_id1308' }


    if (thesis_info.hasOwnProperty('Author2')) {
	console.info("Need to create a second author area");
	// for the case of 2 authors: look for the 'Another author' button and click it
	await addTextArea(page, buttonHandles, 'Another author');
    }

    if (thesis_info.hasOwnProperty('Supervisor2')) {
	console.info("Need to create a second supervisor area");
	// for the case of 2 supervisors: look for the 'Another supervisor' button and click it
	await addTextArea(page, buttonHandles, 'Another supervisor');
    }

    if (thesis_info.hasOwnProperty('Keywords2')) {
	console.info("Need to create a second keywords area");
	// for the case of keywords in two languages: look for the 'Keywords in another language' button and click it
	await addTextArea(page, buttonHandles, 'Keywords in another language');
    }



    if (thesis_info.hasOwnProperty('Abstract2')) {
	console.info("Need to create a second abstract area");
	// for the case of abstracts in two languages: look for the 'Another abstract' button and click it
	await addTextArea(page, buttonHandles, 'Another abstract');
    }

    // potentially one could wait for the Abstract2 to appear via id 'addForm:j_id1122:1:j_id1129'
    // However, as of 2019.07.27 this does NOT work.
    //const abstract2_selector = 'span[id="addForm:j_id1122:1:j_id1129"]';
    //await page.waitForSelector('abstract2_selector');
    //console.log("timestamp after asking to create another abstract", gitMetrics.Timestamp) 
    // Since the above did not work, simply wait 2 seconds
    await page.waitFor(2000);	// this seems to require an extra long wait for the abstract field to be added

    // because we have changed the text areas due to the above additions, we need to update the variables: textareaHandles, areaNames, and buttonHandles
    textareaHandles = await getTextAreaHandles(page);
    areaNames = await getTextAreaContent(page);
    console.info("areaNames are ", areaNames);
    // There should be new textareas  'Author2', 'Keywords2', 'Abstract2', and 'Supervisor2'

    buttonHandles=await getTextareabuttonHandles(page);
    //console.info("buttonHandles are ", buttonHandles);
    await page.waitFor(1000);

   
    let blanks;
    blanks = await getTextAreaBlanks(page)
    // console.info("blanks are ", blanks);

    //for (let l = 0; l < blanks.length; l += 1) {
    //console.info("blanks[", l, "] are ", blanks[l]);
    //}
    for(var key in blanks) {
	var value = blanks[key];
	console.info("blanks[", key, "] is ", value);
    }

    console.info("Fill in some fields");
    // Fill in some fields:
    if (thesis_info.hasOwnProperty('Presentation')) {
	console.info("Filling in presentation information")

	const date_time=thesis_info['Presentation']['Date'];
	selector=make_selector_from_id(blanks['Presentation']['Date'].ID);
	await page.type(selector, date_time, {delay: 10});

	let lang=thesis_info['Presentation']['Language'];
	await setTextAreaLang(page, textareaHandles, areaNames, 'Presentation ', lang);

	const room=thesis_info['Presentation']['Room'];
	selector=make_selector_from_id(blanks['Presentation']['Room'].ID);
	//await page.type(selector, room);
	await page.click(selector, { clickCount: 1 })
	await page.waitFor(1000);
	await page.keyboard.sendCharacter(room);

	await page.waitFor(1000);
	const address=thesis_info['Presentation']['Address'];
	selector=make_selector_from_id(blanks['Presentation']['Address'].ID);
	//await page.type(selector, address);
	await page.click(selector);
	await page.waitFor(1000);
	await page.keyboard.sendCharacter(address);

	const city=thesis_info['Presentation']['City'];
	selector=make_selector_from_id(blanks['Presentation']['City'].ID);
	//await page.type(selector, city);
	await page.click(selector);
	await page.waitFor(1000);
	await page.keyboard.sendCharacter(city);
	await page.waitFor(2000);

    }


    // Fill in some fields:
    if (thesis_info.hasOwnProperty('Author1')) {
	let last_name;
	let first_name;
	let kthid;
	let research_group;
	let e_mail;
	let academic_title;
	let orcid;
	let otherOrg;

	// Author information
	last_name=thesis_info['Author1']['Last name'];
	selector=make_selector_from_id(blanks['Author1']['Last name'].ID);
	await page.$eval(selector, (el, value) => el.value = value, last_name);

	first_name=thesis_info['Author1']['First name'];
	selector=make_selector_from_id(blanks['Author1']['First name'].ID);
	await page.$eval(selector, (el, value) => el.value = value, first_name);

	if (thesis_info['Author1'].hasOwnProperty('Local User Id')) {
	    kthid=thesis_info['Author1']['Local User Id'];
	    selector=make_selector_from_id(blanks['Author1']['Local User Id'].ID);
	    await page.$eval(selector, (el, value) => el.value = value, kthid);
	}
	if (thesis_info['Author1'].hasOwnProperty('Research group')) {
	    research_group=thesis_info['Author1']['Research group'];
	    selector=make_selector_from_id(blanks['Author1']['Research group'].ID);
	    await page.$eval(selector, (el, value) => el.value = value, research_group);
	}

	if (thesis_info['Author1'].hasOwnProperty('E-mail')) {
	    e_mail=thesis_info['Author1']['E-mail'];
	    selector=make_selector_from_id(blanks['Author1']['E-mail'].ID);
	    await page.$eval(selector, (el, value) => el.value = value, e_mail);
	}

	if (thesis_info['Author1'].hasOwnProperty('organisation')) {
	    await makeOrganizationSelection(page, blanks, 'Author1');
	}
	if (thesis_info['Author1'].hasOwnProperty('Other organisation')) {
	    otherOrg=thesis_info['Author1']['Other organisation'];
	    selector=make_selector_from_id(blanks['Author1']['Other organisation'].ID);
	    await page.$eval(selector, (el, value) => el.value = value, otherOrg);
	}

    }

    // Fill in some fields:
    if (thesis_info.hasOwnProperty('Author2')) {
	let last_name;
	let first_name;
	let kthid;
	let research_group;
	let e_mail;
	let academic_title;
	let orcid;
	let otherOrg;

	// Author information
	last_name=thesis_info['Author2']['Last name'];
	selector=make_selector_from_id(blanks['Author2']['Last name'].ID);
	await page.$eval(selector, (el, value) => el.value = value, last_name);

	first_name=thesis_info['Author2']['First name'];
	selector=make_selector_from_id(blanks['Author2']['First name'].ID);
	await page.$eval(selector, (el, value) => el.value = value, first_name);

	if (thesis_info['Author2'].hasOwnProperty('Local User Id')) {
	    kthid=thesis_info['Author2']['Local User Id'];
	    selector=make_selector_from_id(blanks['Author2']['Local User Id'].ID);
	    await page.$eval(selector, (el, value) => el.value = value, kthid);
	}
	if (thesis_info['Author2'].hasOwnProperty('Research group')) {
	    research_group=thesis_info['Author2']['Research group'];
	    selector=make_selector_from_id(blanks['Author2']['Research group'].ID);
	    await page.$eval(selector, (el, value) => el.value = value, research_group);
	}

	if (thesis_info['Author2'].hasOwnProperty('E-mail')) {
	    e_mail=thesis_info['Author2']['E-mail'];
	    selector=make_selector_from_id(blanks['Author2']['E-mail'].ID);
	    await page.$eval(selector, (el, value) => el.value = value, e_mail);
	}

	if (thesis_info['Author2'].hasOwnProperty('organisation')) {
	    // //org_COS='';
	    // //await page.$eval('[id="addForm:authorSerie:0:j_id736"]', (el, value) => el.value = value, org_COS);
	    // // Note that I cannot look for EECS in the test DiVA as it has only the old organization info
	    // await page.waitFor(2000);

	    // selector=make_selector_from_id(blanks['Author2']['Choose organisation »'].ID);
	    // await page.click(selector);
	    // console.info("click to select the department")

	    // //id="organisationPopupForm:organisationPopup"
	    // // await page.click('[id="organisationPopupForm:organisationPopup"]');
	    // await page.waitFor(3000);
	    // // organisationPopupForm:tree:n-9:j_id202
	    // await page.click('[id="organisationPopupForm:tree:n-9:j_id202"]'); // ICT
	    // await page.waitFor(2000);
	    // console.info("selected the department")
	    await makeOrganizationSelection(page, blanks, 'Author2');
	}
	if (thesis_info['Author2'].hasOwnProperty('Other organisation')) {
	    otherOrg=thesis_info['Author2']['Other organisation'];
	    selector=make_selector_from_id(blanks['Author2']['Other organisation'].ID);
	    await page.$eval(selector, (el, value) => el.value = value, otherOrg);
	}

    }

    //----------------------------------------------------------------------
    // Supervisor information (Supervisor1)
    if (thesis_info.hasOwnProperty('Supervisor1')) {
	let last_name;
	let first_name;
	let kthid;
	let research_group;
	let e_mail;
	let academic_title;
	let orcid;
	let otherOrg;

	last_name=thesis_info['Supervisor1']['Last name'];
	selector=make_selector_from_id(blanks['Supervisor1']['Last name'].ID);
	await page.$eval(selector, (el, value) => el.value = value, last_name);

	first_name=thesis_info['Supervisor1']['First name'];
	selector=make_selector_from_id(blanks['Supervisor1']['First name'].ID);
	await page.$eval(selector, (el, value) => el.value = value, first_name);

	if (thesis_info['Supervisor1'].hasOwnProperty('Academic title')) {
	    academic_title=thesis_info['Supervisor1']['Academic title'];
	    selector=make_selector_from_id(blanks['Supervisor1']['Academic title'].ID);
	    await page.$eval(selector, (el, value) => el.value = value, academic_title);
	}

	if (thesis_info['Supervisor1'].hasOwnProperty('Local User Id')) {
	    kthid=thesis_info['Supervisor1']['Local User Id'];
	    selector=make_selector_from_id(blanks['Supervisor1']['Local User Id'].ID);
	    await page.$eval(selector, (el, value) => el.value = value, kthid);
	}
	
	if (thesis_info['Supervisor1'].hasOwnProperty('ORCiD')) {
	    orcid=thesis_info['Supervisor1']['ORCiD'];
	    selector=make_selector_from_id(blanks['Supervisor1']['ORCiD'].ID);
	    await page.$eval(selector, (el, value) => el.value = value, orcid);
	}

	if (thesis_info['Supervisor1'].hasOwnProperty('E-mail')) {
	    e_mail=thesis_info['Supervisor1']['E-mail'];
	    selector=make_selector_from_id(blanks['Supervisor1']['E-mail'].ID);
	    await page.$eval(selector, (el, value) => el.value = value, e_mail);
	}


	if (thesis_info['Supervisor1'].hasOwnProperty('organisation')) {
	    // selector=make_selector_from_id(blanks['Supervisor1']['Choose organisation »'].ID);
	    // //org_COS='';
	    // // Note that I cannot look for EECS in the test DiVA as it has only the old organization info
	    // selector=make_selector_from_id(blanks['Supervisor1']['Choose organisation »'].ID);
	    // await page.click(selector);
	    // console.info("click to select the department")

	    // //id="organisationPopupForm:organisationPopup"
	    // // await page.click('[id="organisationPopupForm:organisationPopup"]');
	    // await page.waitFor(3000);
	    // // organisationPopupForm:tree:n-9:j_id202
	    // await page.click('[id="organisationPopupForm:tree:n-9:j_id202"]'); // ICT
	    // await page.waitFor(1000);
	    // console.info("selected the department")
	    // await page.waitFor(2000);
	    await makeOrganizationSelection(page, blanks, 'Supervisor1');
	}

	if (thesis_info['Supervisor1'].hasOwnProperty('Other organisation')) {
	    otherOrg=thesis_info['Supervisor1']['Other organisation'];
	    selector=make_selector_from_id(blanks['Supervisor1']['Other organisation'].ID);
	    await page.$eval(selector, (el, value) => el.value = value, otherOrg);
	}

    }
    //----------------------------------------------------------------------
    // Supervisor information (Supervisor2)
    if (thesis_info.hasOwnProperty('Supervisor2')) {
	let last_name;
	let first_name;
	let kthid;
	let research_group;
	let e_mail;
	let academic_title;
	let orcid;
	let otherOrg;

	last_name=thesis_info['Supervisor2']['Last name'];
	selector=make_selector_from_id(blanks['Supervisor2']['Last name'].ID);
	await page.$eval(selector, (el, value) => el.value = value, last_name);

	first_name=thesis_info['Supervisor2']['First name'];
	selector=make_selector_from_id(blanks['Supervisor2']['First name'].ID);
	await page.$eval(selector, (el, value) => el.value = value, first_name);

	if (thesis_info['Supervisor2'].hasOwnProperty('Academic title')) {
	    academic_title=thesis_info['Supervisor2']['Academic title'];
	    selector=make_selector_from_id(blanks['Supervisor2']['Academic title'].ID);
	    await page.$eval(selector, (el, value) => el.value = value, academic_title);
	}

	if (thesis_info['Supervisor2'].hasOwnProperty('Local User Id')) {
	    kthid=thesis_info['Supervisor2']['Local User Id'];
	    selector=make_selector_from_id(blanks['Supervisor2']['Local User Id'].ID);
	    await page.$eval(selector, (el, value) => el.value = value, kthid);
	}
	
	if (thesis_info['Supervisor2'].hasOwnProperty('ORCiD')) {
	    orcid=thesis_info['Supervisor2']['ORCiD'];
	    selector=make_selector_from_id(blanks['Supervisor2']['ORCiD'].ID);
	    await page.$eval(selector, (el, value) => el.value = value, orcid);
	}

	if (thesis_info['Supervisor2'].hasOwnProperty('E-mail')) {
	    e_mail=thesis_info['Supervisor2']['E-mail'];
	    selector=make_selector_from_id(blanks['Supervisor2']['E-mail'].ID);
	    await page.$eval(selector, (el, value) => el.value = value, e_mail);
	}


	if (thesis_info['Supervisor2'].hasOwnProperty('organisation')) {
	    await makeOrganizationSelection(page, blanks, 'Supervisor2');
	}

	if (thesis_info['Supervisor2'].hasOwnProperty('Other organisation')) {
	    otherOrg=thesis_info['Supervisor2']['Other organisation'];
	    selector=make_selector_from_id(blanks['Supervisor2']['Other organisation'].ID);
	    await page.$eval(selector, (el, value) => el.value = value, otherOrg);
	}
    }
    //----------------------------------------------------------------------
    // Supervisor information (Supervisor2)
    //----------------------------------------------------------------------
    // Examiner information
    if (thesis_info.hasOwnProperty('Examiner1')) {
	let last_name;
	let first_name;
	let kthid;
	let research_group;
	let e_mail;
	let academic_title;
	let orcid;
	let otherOrg;

	last_name=thesis_info['Examiner1']['Last name'];
	selector=make_selector_from_id(blanks['Examiner1']['Last name'].ID);
	await page.$eval(selector, (el, value) => el.value = value, last_name);

	first_name=thesis_info['Examiner1']['First name'];
	selector=make_selector_from_id(blanks['Examiner1']['First name'].ID);
	await page.$eval(selector, (el, value) => el.value = value, first_name);

	if (thesis_info['Examiner1'].hasOwnProperty('Academic title')) {
	    academic_title=thesis_info['Examiner1']['Academic title'];
	    selector=make_selector_from_id(blanks['Examiner1']['Academic title'].ID);
	    await page.$eval(selector, (el, value) => el.value = value, academic_title);
	}

	if (thesis_info['Examiner1'].hasOwnProperty('Local User Id')) {
	    kthid=thesis_info['Examiner1']['Local User Id'];
	    selector=make_selector_from_id(blanks['Examiner1']['Local User Id'].ID);
	    await page.$eval(selector, (el, value) => el.value = value, kthid);
	}
	
	if (thesis_info['Examiner1'].hasOwnProperty('ORCiD')) {
	    orcid=thesis_info['Examiner1']['ORCiD'];
	    selector=make_selector_from_id(blanks['Examiner1']['ORCiD'].ID);
	    await page.$eval(selector, (el, value) => el.value = value, orcid);
	}

	if (thesis_info['Examiner1'].hasOwnProperty('E-mail')) {
	    e_mail=thesis_info['Examiner1']['E-mail'];
	    selector=make_selector_from_id(blanks['Examiner1']['E-mail'].ID);
	    await page.$eval(selector, (el, value) => el.value = value, e_mail);
	}


	if (thesis_info['Examiner1'].hasOwnProperty('organisation')) {
	    await makeOrganizationSelection(page, blanks, 'Examiner1');
	}

	if (thesis_info['Examiner1'].hasOwnProperty('Other organisation')) {
	    otherOrg=thesis_info['Examiner1']['Other organisation'];
	    selector=make_selector_from_id(blanks['Examiner1']['Other organisation'].ID);
	    await page.$eval(selector, (el, value) => el.value = value, otherOrg);
	}

    }
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

    //selector="addForm:j_id803";
    let title_text;
    let lang_text;
    if (thesis_info.hasOwnProperty('Title')) {
	if (thesis_info['Title'].hasOwnProperty('Main title')) {
	    title_text=thesis_info['Title']['Main title'];
	    selector=blanks['Title']['Main title'].ID; // note that we do not do make_selector_from_id() - as this occurs inside setMCEbody()
	    await setMCEbody(page, selector, title_text);
	}
	if (thesis_info['Title'].hasOwnProperty('Subtitle')) {
	    title_text=thesis_info['Title']['Subtitle'];
	    selector=blanks['Title']['Subtitle'].ID;
	    await setMCEbody(page, selector, title_text);
	}
	if (thesis_info['Title'].hasOwnProperty('Language')) {
	    lang_text=thesis_info['Title']['Language'];
	    if (lang_text.length > 0) {
		await setTextAreaLang(page, textareaHandles, areaNames, 'Title', lang_text);
	    }
	}
	await page.waitFor(1000);
    }
    
    if (thesis_info.hasOwnProperty('Alternative title')) {
	if (thesis_info['Alternative title'].hasOwnProperty('Main title')) {
	    title_text=thesis_info['Alternative title']['Main title'];
	    selector=blanks['Alternative title']['Main title'].ID; // note that we do not do make_selector_from_id() - as this occurs inside setMCEbody()
	    await setMCEbody(page, selector, title_text);
	}
	if (thesis_info['Alternative title'].hasOwnProperty('Subtitle')) {
	    title_text=thesis_info['Alternative title']['Subtitle'];
	    selector=blanks['Alternative title']['Subtitle'].ID;
	    await setMCEbody(page, selector, title_text);
	}
	if (thesis_info['Alternative title'].hasOwnProperty('Language')) {
	    lang_text=thesis_info['Alternative title']['Language'];
	    if (lang_text.length > 0) {
		await setTextAreaLang(page, textareaHandles, areaNames, 'Alternative title', lang_text);
	    }
	}
	await page.waitFor(1000);
    }


    // //selector="addForm:j_id807";
    // selector=blanks['Title']['Subtitle'].ID;
    // await setMCEbody(page, selector, long_eng_subtitle);
    // await setTextAreaLang(page, textareaHandles, areaNames, 'Title', 'eng');

    // // t1=document.querySelectorAll('[id="addForm:j_id803_ifr"]')

    // long_swe_title="Detta är en lång titel på svenska";
    // long_swe_subtitle="Detta är en ännu längre undertexter på svenska";
    // //selector="addForm:j_id814:0:j_id831"
    // selector=blanks['Alternative title']['Main title'].ID;
    // await setMCEbody(page, selector, long_swe_title);

    // //selector="addForm:j_id814:0:j_id835";
    // selector=blanks['Alternative title']['Subtitle'].ID;
    // await setMCEbody(page, selector, long_swe_subtitle);
    // await setTextAreaLang(page, textareaHandles, areaNames, 'Alternative title', 'swe');


    //    await page.$eval('[id="addForm:j_id814:0:j_id831"]', (el, value) => el.value = value, long_swe_title);
    //    await page.$eval('[id="addForm:j_id814:0:j_id835"]', (el, value) => el.value = value, long_swe_subtitle);

    // abstracts
    
    //let long_eng_abstract;
    //long_eng_abstract='<p>This is a abstract for an non existant thesis about F<sup>18</sup></p>'
    //selector="addForm:j_id1122:0:j_id1140"
    //selector="addForm:j_id1122:1:j_id1140";
    //selector=blanks['Abstract2']['Abstract'].ID;
    //long_swe_abstract='<p>Detta är ett abstrakt för en icke-existerande avhandling om F<sup>18</sup></p>'
    //await setMCEbody(page, selector, long_swe_abstract);
    //await setTextAreaLang(page, textareaHandles, areaNames, 'Abstract2', 'swe');

    let abstract_text;
    if (thesis_info.hasOwnProperty('Abstract1')) {
	if (thesis_info['Abstract1'].hasOwnProperty('Abstract')) {
	    abstract_text=thesis_info['Abstract1']['Abstract'];
	    selector=blanks['Abstract1']['Abstract'].ID;
	    await setMCEbody(page, selector, abstract_text);
	}
	if (thesis_info['Abstract1'].hasOwnProperty('Language')) {
	    lang_text=thesis_info['Abstract1']['Language'];
	    if (lang_text.length > 0) {
		await setTextAreaLang(page, textareaHandles, areaNames, 'Abstract1', lang_text);
	    }
	}
	await page.waitFor(1000);
    }
    
    if (thesis_info.hasOwnProperty('Abstract2')) {
	if (thesis_info['Abstract2'].hasOwnProperty('Abstract')) {
	    abstract_text=thesis_info['Abstract2']['Abstract'];
	    selector=blanks['Abstract2']['Abstract'].ID;
	    await setMCEbody(page, selector, abstract_text);
	}
	if (thesis_info['Abstract2'].hasOwnProperty('Language')) {
	    lang_text=thesis_info['Abstract2']['Language'];
	    if (lang_text.length > 0) {
		await setTextAreaLang(page, textareaHandles, areaNames, 'Abstract2', lang_text);
	    }
	}
	await page.waitFor(1000);
    }

    // Keywords
    //eng_keyowrds='Fee,Foo,Fum'
    let keywords_text;
    if (thesis_info.hasOwnProperty('Keywords1')) {
	if (thesis_info['Keywords1'].hasOwnProperty('Keywords')) {
	    keywords_text=thesis_info['Keywords1']['Keywords'];
	    //selector='[id="addForm:keywordList:0:j_id1114"]';
	    selector=make_selector_from_id(blanks['Keywords1']['Keywords'].ID);
	    await page.$eval(selector, (el, value) => el.value = value, keywords_text);
	}
	if (thesis_info['Keywords1'].hasOwnProperty('Language')) {
	    lang_text=thesis_info['Keywords1']['Language'];
	    if (lang_text.length > 0) {
		await setTextAreaLang(page, textareaHandles, areaNames, 'Keywords1', lang_text);
	    }
	}
    }
    
    //swe_keyowrds='Fåå,Fää,Fööm'
    //selector='[id="addForm:keywordList:1:j_id1114"]';
    //selector=make_selector_from_id(blanks['Keywords2']['Keywords'].ID);
    //await page.$eval(selector, (el, value) => el.value = value, swe_keyowrds);
    //await setTextAreaLang(page, textareaHandles, areaNames, 'Keywords2', 'swe');
    if (thesis_info.hasOwnProperty('Keywords2')) {
	if (thesis_info['Keywords2'].hasOwnProperty('Keywords')) {
	    keywords_text=thesis_info['Keywords2']['Keywords'];
	    //selector='[id="addForm:keywordList:0:j_id1114"]';
	    selector=make_selector_from_id(blanks['Keywords2']['Keywords'].ID);
	    await page.$eval(selector, (el, value) => el.value = value, keywords_text);
	}
	if (thesis_info['Keywords2'].hasOwnProperty('Language')) {
	    lang_text=thesis_info['Keywords2']['Language'];
	    if (lang_text.length > 0) {
		await setTextAreaLang(page, textareaHandles, areaNames, 'Keywords2', lang_text);
	    }
	}
    }

    
    // Other information
    if (thesis_info.hasOwnProperty('Other information')) {
	if (thesis_info['Other information'].hasOwnProperty('Year')) {
	    pub_year=thesis_info['Other information']['Year'];
	    //selector='[id="addForm:j_id913"]';
	    selector=make_selector_from_id(blanks['Other information']['Year'].ID);
	    await page.$eval(selector, (el, value) => el.value = value, pub_year);
	}

	//page_range='xiii,72'
	if (thesis_info['Other information'].hasOwnProperty('Number of pages')) {
	    page_range=thesis_info['Other information']['Number of pages'];
	    //selector='[id="addForm:j_id918"]';
	    selector=make_selector_from_id(blanks['Other information']['Number of pages'].ID);
	    //await page.$eval(selector, (el, value) => el.value = value, page_range);
	    //await page.waitFor(1500);
	    await page.click(selector);
	    await page.waitFor(1000);
	    await page.keyboard.sendCharacter(page_range);
	}
    }

    // Cooperation
    // if yes, add 
    //partner_name='ABBBBA';
    let partner_name;
    if (thesis_info.hasOwnProperty('Cooperation')) {
	if (thesis_info['Cooperation'].hasOwnProperty('Partner_name')) {
	    partner_name=thesis_info['Cooperation']['Partner_name'];
	    //selector='[id="addForm:j_id778:0:j_id780"]';
	    selector=make_selector_from_id(blanks['Cooperation']['Partner_name'].ID);
	    if (partner_name.length > 0) {
		//status=await page.$eval(selector, (el, value) => el.value = value, partner_name);
		//console.info("status of setting partner_name is ", status, "selector was ", selector);
		await page.click(selector);
		await page.waitFor(500);
		await page.keyboard.sendCharacter(partner_name);
	    }
	    let partner_name_check;
	    // partner_name_check = await page.evaluate(() => {
	    // 	const t1=document.querySelector('[id="addForm:j_id778:0:j_id780"]').value
	    // 	return t1;
	    // });
	    partner_name_check = await page.$eval(selector, el => el.value);
	    console.info("partner_name_check is ", partner_name_check);
	}
    } else {
	// else click no
	//await page.click('[id="addForm:extCoop:_2"]'); // No
	//selector='[id="addForm:extCoop:_2"]';
	selector=make_selector_from_id(blanks['Cooperation']['false'].ID);
	await page.click(selector); // No
	await page.waitFor(1000);
    }

    // Notes
    //  cautionary_note='<p><span style="color: red;">A completely bogus entry for testing with Puppeteer.</span></p>';
    let note_text;
    if (thesis_info.hasOwnProperty('Note')) {
	if (thesis_info['Note'].hasOwnProperty('Note')) {
	    note_text=thesis_info['Note']['Note'];

	    //selector="addForm:notes";
	    selector=blanks['Note']['Note'].ID;
	    await setMCEbody(page, selector, note_text);
	}
    }
    
    // Degree
    if (thesis_info.hasOwnProperty('Degree')) {

	if (thesis_info['Degree'].hasOwnProperty('Level')) {
	    // Level
	    //degree_level='M2';
	    let degree_level_text;
	    degree_level_text=thesis_info['Degree']['Level'];
	    degree_level=degree_info['Level'][degree_level_text];
	    //selector='[id="addForm:j_id841:0:level"]';
	    selector=make_selector_from_id(blanks['Degree']['Level'].ID);
	    await page.$eval(selector, (el, value) => el.value = value, degree_level);
	}
	if (thesis_info['Degree'].hasOwnProperty('University credits')) {
	    // University credits
	    //degree_credits='10';
	    let degree_credits_text;
	    degree_credits_text=thesis_info['Degree']['University credits'];
	    degree_credits=degree_info['University credits'][degree_credits_text];

	    //selector='[id="addForm:j_id841:0:creditsSelectMenu"]';
	    selector=make_selector_from_id(blanks['Degree']['University credits'].ID);
	    await page.$eval(selector, (el, value) => el.value = value, degree_credits);
	}

	if (thesis_info['Degree'].hasOwnProperty('Educational program')) {
	    //
	    // degree_program='9990'; // Bachelor of Science in Engineering - Computer Engineering
	    let degree_program_text;
	    degree_program_text=thesis_info['Degree']['Educational program'];
	    degree_program=degree_info['Educational program'][degree_program_text];

	    //selector='[id="addForm:j_id841:0:j_id871"]';
	    selector=make_selector_from_id(blanks['Degree']['Educational program'].ID);
	    await page.$eval(selector, (el, value) => el.value = value, degree_program);
	}
	if (thesis_info['Degree'].hasOwnProperty('Subject_course')) {
	    // degree_subject='10339'; //Communications Systems
	    let degree_subject_text;
	    degree_subject_text=thesis_info['Degree']['Subject_course'];
	    degree_subject=degree_info['Subject_course'][degree_subject_text];

	    //selector='[id="addForm:j_id841:0:j_id876"]';
	    selector=make_selector_from_id(blanks['Degree']['Subject_course'].ID);
	    await page.$eval(selector, (el, value) => el.value = value, degree_subject);
	}
    }
    
    // Series

    if (thesis_info.hasOwnProperty('Series')) {
	if (thesis_info['Series'].hasOwnProperty('Title of series')) {
	    let pub_series_text;
	    pub_series_text=thesis_info['Series']['Title of series'];
	    pub_series=series_info[pub_series_text];

	    if (pub_series) {	//  only do this is the series is found
		//pub_series='5952'; // TRITA-ICT-EX
		//await page.$eval('[id="addForm:j_id935"]', (el, value) => el.value = value, pub_series);
		//await page.click('[id="addForm:j_id935"]');
		//selector='[id="addForm:j_id935"]';
		selector=make_selector_from_id(blanks['Series']['Title of series'].ID);
		await page.select(selector, pub_series);
		// the action above will change the form - creating a new field for the series number

		// blanks['Series'] = await getATextAreaBlanks(page, 'Series')
		// //selector='[id="addForm:j_id937:0:seriesNumber"]'
		// selector=make_selector_from_id(blanks['Series']['No. in series'].ID);
		// if (selector === undefined) { // if the scan of the form did not find it - cheat and use the manually found value
		//     selector='[id="addForm:j_id937:0:seriesNumber"]';
		//     console.warn("the selector for No. in series was not automatically found");
		// }

		if (thesis_info['Series'].hasOwnProperty('No. in series')) {
		    let trita_number;
		    trita_number=thesis_info['Series']['No. in series'];

		    //await page.waitFor(1000);
		    try {
			selector=('div.diva2addtextchoiceboxseries input')
			await page.waitFor(selector);
			//    trita_number='2019:00';
			//await page.$eval(selector, (el, value) => el.value = value, trita_number);
			await page.click(selector);
			await page.waitFor(1000);
			await page.keyboard.sendCharacter(trita_number);
		    } catch (error) {
			console.info("did not get the No. in series entered")
		    }
		}
	    }
	}
    }
    //blanks[ 11 ] are  [ { nameOfTextField: 'National subject category*',
    //className: 'div#addForm:j_id1037.icePnlGrp',
    //iId: [ 'addForm:j_id1039' ],
    // Kommunikationssystem; Communication Systems (20203)
    //await page.select('[id="addForm:j_id1039"]', 'Kommunikationssystem; Communication Systems');
    //national_category=20203
    //await page.$eval('[id="addForm:j_id883"]', (el, value) => el.value = value, national_category);

    // //selector='[id="addForm:j_id1039"]';
    // selector=make_selector_from_id(blanks['National subject category']['Choose national subject category »'].ID);
    // await page.click(selector);
    // console.info("click to select the national subject")
    // await page.waitFor(2000);
    // //
    
    // await page.waitFor('[id="nationalCategoryPopupForm:tree:1"]');
    // await page.click('[id="nationalCategoryPopupForm:tree:1"]'); // Engineering and Technology
    // //    await page.click('[id="nationalCategoryPopupForm:tree:n-1:j_id300"]'); // Engineering and Technology

    // await page.waitFor(500);
    // await page.waitFor('[id="nationalCategoryPopupForm:tree:1-2"]');
    // await page.click('[id="nationalCategoryPopupForm:tree:1-2"]'); // Electrical Engineering, Electronic Engineering, Information Engineering
    
    // //    await page.click('[id="nationalCategoryPopupForm:tree:n-1-2:j_id300"]'); // Electrical Engineering, Electronic Engineering, Information Engineering
    // //await page.waitFor('[id="nationalCategoryPopupForm:tree:n-1-2-0:j_id299"]');

    // // <div class="icePnlGrp" id="nationalCategoryPopupForm:tree:n-1-2-0:j_id310" style="display: inline"><a class="iceCmdLnk" href="javascript:;" id="nationalCategoryPopupForm:tree:n-1-2-0:j_id311" onblur="setFocus('');" onclick="scrollBack();var form=formOf(this);form['nationalCategoryPopupForm:_idcl'].value='nationalCategoryPopupForm:tree:n-1-2-0:j_id311';return iceSubmit(form,this,event);" onfocus="setFocus(this.id);">Communication Systems</a></div>

    // await page.waitFor(1000);
    // try {
    // 	await page.click('[id^="nationalCategoryPopupForm:tree:n-1-2-0:j_id"]'); // wait for item
    // } catch(e) {
    // 	console.info("while waiting for item: catch of ", e);
    // }

    // try {
    // 	await page.click('[id="nationalCategoryPopupForm:tree:n-1-2-0:j_id310"]'); // Communication Systems
    // } catch(e) {
    // 	console.info("while clicking on item: catch of ", e);
    // }


    // //await page.click('[id="nationalCategoryPopupForm:tree:n-1-2-0:j_id300"]'); // Communication Systems
    await makeNationalSubjectCategorySelection(page, blanks, 'National subject category');
    console.info("selected the national subject")

    await page.waitFor(2000);

    let topbuttons;
    topbuttons = await forwardAndBackwardButtons(page);
    console.info("topbuttons is ", topbuttons);
    console.info("topbuttons['heading_ids'][2] is ", topbuttons['heading_ids'][2]);
    let continue_selector;
    continue_selector = '[id="'+topbuttons['heading_ids'][2]+'"]';
    //await page.waitFor(5000);
    //status=await page.click(continue_selector); // go to the next page
    //console.info("status of clicking continue is ", status);
    //page.waitForNavigation({ waitUntil: 'load' });
    // const [response] = await Promise.all([
    // 	page.waitForNavigation({ waitUntil: 'networkidle0' } ),
    // 	page.click(continue_selector),
    // ]);
    // console.info("response of clicking continue is ", response);
    //await page.click(continue_selector),

    
    //// Upload file page
    // <fieldset class="diva2addborder">
    //   <div class="containerAddFile">
    //     <div class="diva2addfilefile">
    //       <div class="diva2addfilehead">Upload file
    //       </div>
    //       <a class="info" href="#">?
    // 	<span><p><b>Upload file</b></p>
    // 	  <p>Upload one or more of the files for your publication.</p>
    // 	  <p><strong>Title:</strong> Displays the title of the post.</p>
    // 	  <p><strong>When should the fulltext be made freely available:
    // 	    </strong> Choose when the file should be made freely available. The field 'Date' is only active if the alternative 'Make freely available later' is chosen. If the alternative 'Only for archiving' is chosen, the file will not be made visible nor will it be possible to download it.
    // 	  </p>
    // 	  <p>The alternative 'Print-on-demand' is only visible for administrators. If this checkbox is checked, the file will not be displayed in the search interface but will be downloadable by an administrator.</p>
    // 	  <p><strong>Type:</strong>  Select the file type according to content. Usually it is fulltext, i.e. a file including your publication in its entirety. Then select the format of your uploaded file. The most common for texts is 
    // 	    <i>application/pdf</i>.
    // 	  </p>
    // 	  <p><strong>Name file:</strong> Give the uploaded file a name. If this field is left blank, the file will be named according to its type, for example 'fulltext'.</p>
// 	  <p><strong>Browse:</strong> Click on Browse and locate the file on your computer. Then click on Upload to select the marked file.</p>
    // 	</span>
    //       </a>
    //       <div class="diva2addfilelist">
    // 	<div class="diva2addfilelistheading">Title:</div>
    // 	<div class="diva2addfilelisttitle">
    // 	  <span id="myForm:title">xxxx</span><span id="myForm:subTitle"></span>
    // 	</div>
    //       </div>
    //     </div>

    //     <div class="clear">
    //     </div>
    //   </div>

    //   <div class="containerAddFile">
    //     <div class="diva2addfileheading">When should the file be made freely available?
    //       <span class="diva2asterisk" id="myForm:j_id205">*</span>
    //     </div>
    //     <div class="diva2addfilelistinfo">
    //       <fieldset class="iceSelOneRb" id="myForm:availableFromChoice" onclick=";setFocus('');iceSubmitPartial(form, this, event);">
    // 	<table border="0" cellpadding="0" cellspacing="0" class="iceSelOneRb">
    // 	  <tbody>
    // 	    <tr>
    // 	      <td>
    // 		<input checked="checked" id="myForm:availableFromChoice:_1" name="myForm:availableFromChoice" onkeypress="Ice.util.radioCheckboxEnter(form,this,event);" type="radio" value="now">
    // 		<label class="iceSelOneRb" for="myForm:availableFromChoice:_1">Make freely available now (open access)
    // 		</label>
    // 	      </td>
    // 	    </tr>
    // 	    <tr>
    // 	      <td>
    // 		<input id="myForm:availableFromChoice:_2" name="myForm:availableFromChoice" onkeypress="Ice.util.radioCheckboxEnter(form,this,event);" type="radio" value="later">
    // 		<label class="iceSelOneRb" for="myForm:availableFromChoice:_2">Make freely available later
    // 		</label>
    // 	      </td>
    // 	    </tr>
    // 	    <tr>
    // 	      <td>
    // 		<input id="myForm:availableFromChoice:_3" name="myForm:availableFromChoice" onkeypress="Ice.util.radioCheckboxEnter(form,this,event);" type="radio" value="never">
    // 		<label class="iceSelOneRb" for="myForm:availableFromChoice:_3">Only for archiving
    // 		</label>
    // 	      </td>
    // 	    </tr>
    // 	  </tbody>
    // 	</table>
    //       </fieldset>
    //     </div>

    //     <div class="diva2addfiledate">Date:
    //       <div class="iceSelInpDatePopup-dis" id="myForm:availableFromDate_rd">
    // 	<input class="iceSelInpDateInput-dis" disabled="disabled" id="myForm:availableFromDate" name="myForm:availableFromDate" onblur="setFocus('');iceSubmitPartial(form, this, event);" onfocus="setFocus('');" onkeypress="iceSubmit(form,this,event);" type="text" value="">
    // 	<input alt="Open popup calendar" class="iceSelInpDateOpenPopup-dis" disabled="disabled" id="myForm:availableFromDate_cb" name="myForm:availableFromDate_cb" onclick="document.forms['myForm']['myForm:_idcl'].value='myForm:availableFromDate_cb';document.forms['myForm']['myForm:_idmyForm:availableFromDatesp'].value='toggle';iceSubmitPartial( document.forms['myForm'], this,event);Ice.Calendar.addCloseListener('myForm:availableFromDate','myForm','myForm:_idcl','myForm:_idmyForm:availableFromDatesp');return false;" onfocus="setFocus('');" src="/dream/xmlhttp/css/xp/css-images/spacer.gif" title="Open popup calendar" type="image">
    //       </div>
    //     </div>

    //     <div class="diva2addfileheading">If the file should be hidden in the future, add when:
    //     </div>

    //     <div class="diva2addfiledate">Date:
    //       <div class="iceSelInpDatePopup" id="myForm:availableUntilDate_rd">
    // 	<input class="iceSelInpDateInput" id="myForm:availableUntilDate" name="myForm:availableUntilDate" onblur="setFocus('');iceSubmitPartial(form, this, event);" onfocus="setFocus('');" onkeypress="iceSubmit(form,this,event);" type="text" value="">
    // 	<input alt="Open popup calendar" class="iceSelInpDateOpenPopup" id="myForm:availableUntilDate_cb" name="myForm:availableUntilDate_cb" onclick="document.forms['myForm']['myForm:_idcl'].value='myForm:availableUntilDate_cb';document.forms['myForm']['myForm:_idmyForm:availableUntilDatesp'].value='toggle';iceSubmitPartial( document.forms['myForm'], this,event);Ice.Calendar.addCloseListener('myForm:availableUntilDate','myForm','myForm:_idcl','myForm:_idmyForm:availableUntilDatesp');return false;" onfocus="setFocus('');" src="/dream/xmlhttp/css/xp/css-images/spacer.gif" title="Open popup calendar" type="image">
    //       </div>
    //     </div>

    //     <div class="clear">
    //     </div>
    //   </div>

    //   <div class="containerAddFile">
    //     <div class="diva2addfileheading">Type:
    //       <span class="iceOutTxt diva2asterisk" id="myForm:j_id220">*</span>
    //     </div>

    //     <div class="diva2addfilelist">
    //       <div class="diva2addfilelistinfo">
    // 	<select class="iceSelOneMnu" id="myForm:info" name="myForm:info" onblur="setFocus('');" onchange="setFocus('');iceSubmitPartial(form, this, event);" onfocus="setFocus(this.id);" size="1">
    // 	  <option selected="selected" value="fulltext">fulltext</option>
    // 	  <option value="attachment">attachment</option>
    // 	  <option value="audio">audio</option>
    // 	  <option value="cover">cover</option>
    // 	  <option value="dataset">data set</option>
    // 	  <option value="errata">errata</option>
    // 	  <option value="image">image</option>
    // 	  <option value="inside">inside</option>
    // 	  <option value="movie">movie</option>
    // 	  <option value="popularsummary">popular summary</option>
    // 	  <option value="preview">preview image</option>
    // 	  <option value="references">references</option>
    // 	  <option value="software">software</option>
    // 	  <option value="spikblad">spikblad</option>
    // 	  <option value="summary">summary</option>
    // 	  <option value="toc">table of contents</option>
    // 	</select>
    //       </div>

    //       <span class="diva2addfilelistinfo" id="myForm:j_id223">
    // 	<select class="iceSelOneMnu" id="myForm:fileType" name="myForm:fileType" onblur="setFocus('');" onchange="setFocus('');iceSubmitPartial(form, this, event);" onfocus="setFocus(this.id);" size="1">
    // 	  <option value="68">avi (video/avi)</option>
    // 	  <option value="72">csv (text/csv)</option>
    // 	  <option value="67">epub (application/epub+zip)</option>
    // 	  <option value="64">flv (video/x-flv)</option>
    // 	  <option value="63">gz (application/x-gzip)</option>
    // 	  <option value="56">jp2 (image/jp2)</option>
    // 	  <option value="57">jpg (image/jpeg)</option>
    // 	  <option value="65">kml (application/vnd.google-earth.kml+xml)</option>
    // 	  <option value="66">kmz (application/vnd.google-earth.kmz)</option>
    // 	  <option value="61">mov (video/quicktime)</option>
    // 	  <option value="58">mp3 (audio/mpeg)</option>
    // 	  <option value="71">mp4 (video/3gpp)</option>
    // 	  <option value="70">mp4 (video/mp4)</option>
    // 	  <option value="60">mpeg (video/mpeg)</option>
    // 	  <option value="69">msvideo (video/x-msvideo)</option>
    // 	  <option selected="selected" value="50">pdf (application/pdf)</option>
    // 	  <option value="55">png (image/png)</option>
    // 	  <option value="51">ps (application/postscript)</option>
    // 	  <option value="76">tar.gz (application/x-compressed-tar)</option>
    // 	  <option value="54">tiff (image/tiff)</option>
    // 	  <option value="53">txt (text/plain)</option>
    // 	  <option value="59">wav (audio/x-wav)</option>
    // 	  <option value="75">wmv (video/x-ms-wmv)</option>
    // 	  <option value="52">xml (text/xml)</option>
    // 	  <option value="62">zip (application/zip)</option>
    // 	</select>
    //       </span>
    //     </div>

    //     <div class="diva2addfileheading">
    //       <span class="iceOutTxt" id="myForm:j_id229">Give the file a name (optional):</span>
    //     </div>

    //     <div class="diva2addfilelist">
    //       <input class="iceInpTxt" id="myForm:j_id231" name="myForm:j_id231" onblur="setFocus('');iceSubmitPartial(form, this, event);" onfocus="setFocus(this.id);" onkeypress="iceSubmit(form,this,event);" onmousedown="this.focus();" type="text">
    //     </div>

    //     <div class="clear">
    //     </div>
    //   </div>

    //   <div class="containerAddFile">
    //     <div class="diva2addfilelistdown">
    //       <iframe allowtransparency="true" class="iceInpFile" frameborder="0" height="30px" id="myForm:j_id235:uploadFrame" marginheight="0" marginwidth="0" name="myForm:j_id235:uploadFrame" scrolling="no" src="/dream/block/resource/MTM2ODIwMzM0NQ==/" style="border-collapse:collapse; border-spacing:0px; padding:0px;" title="Input File Frame" width="500px">
    //       </iframe>

    //       <span id="myForm:j_id236"></span>
    //     </div>

    //     <div class="diva2addfilelist">
    //       <table border="0" cellpadding="0" cellspacing="0" class="iceOutProg iceOutProgFile" id="myForm:j_id238">
    // 	<tbody>
    // 	  <tr>
    // 	    <td>
    // 	      <div class="iceOutProgBg iceOutProgFileBg" style="position:relative;">
    // 		<div class="iceOutProgFill iceOutProgFileFill" id="myForm:j_id238bar" style="position:absolute;width:0%;">
    // 		</div>

    // 		<div class="iceOutProgTxt iceOutProgFileTxt" style="text-align:center;position:relative;background-color:transparent;width:100%;z-index:1;">0 %
    // 		</div>
    // 	      </div>
    // 	    </td>
    // 	  </tr>
    // 	</tbody>
    //       </table>
    //     </div>

    //     <span id="myForm:j_id239"></span>
    //     <div class="clear">
    //     </div>
    //   </div>

    //   <div class="containerAddFile">
    //     <div class="diva2addfilelist">
    //       <span class="iceOutTxt" id="myForm:j_id243">Upload file from URL if the file is larger than 1 GB (Max 16 GB)</span>
    //     </div>

    //     <div class="diva2addfilelist">
    //       <input class="iceInpTxt" id="myForm:j_id245" name="myForm:j_id245" onblur="setFocus('');iceSubmitPartial(form, this, event);" onfocus="setFocus(this.id);" onkeypress="iceSubmit(form,this,event);" onmousedown="this.focus();" size="60" type="text" value="">
    //     </div>
    //     <input class="iceCmdBtn diva2addsokbutton diva2backgroundcolor" id="myForm:j_id246" name="myForm:j_id246" onblur="setFocus('');" onclick="iceSubmit(form,this,event);return false;" onfocus="setFocus(this.id);" type="submit" value="Upload">
    //   </div>
    // </fieldset>

    try {
	await Promise.all([
	    await page.click(continue_selector),
	    await page.waitFor('[id="myForm:availableFromChoice:_1"]') // wait for the form to appear
	]);
    } catch (error) {
	console.info("did not successfully click to go to the next page")
    }

    if (thesis_info['File']['Accept full text']) {
	if (thesis_info['File']['Available Date']) {
	    let dateTime=thesis_info['File']['Available Date']
	    if (!dateTime.includes(':')) {
		dateTime=dateTime+' 01:00'; // add a time in hours and minutes
	    }
	    console.info("make available later on ", thesis_info['File']['Available Date']);
	    await page.click('[id="myForm:availableFromChoice:_2"]'); // later
	    await page.waitFor('[id="myForm:availableFromDate"]'); // wait for the field to become available
	    await page.waitFor(1000);

	    await page.$eval('[id="myForm:availableFromDate"]', (el, value) => el.value = value, dateTime);
	    await page.focus('[id="myForm:availableFromDate"]');
	    await page.keyboard.press('End'); // End Key
	    await page.keyboard.press('Enter'); // Enter Key
	    await page.waitFor(1000);
	} else {
	    await page.click('[id="myForm:availableFromChoice:_1"]'); // now
	}
    } else {
	    await page.click('[id="myForm:availableFromChoice:_3"]'); // Archive only
    }


    //choose_file_selector = '[id="myForm:j_id235:uploadFrame"]';
    // find the file upload iframe
    console.info("Try to upload a file");
    const ielementHandle = await page.$('iframe.iceInpFile');
    const iframe = await ielementHandle.contentFrame();


    const fileInput = await iframe.$('#fileUploadForm input[name=upload]');
    status = await fileInput.uploadFile(thesis_info['File']['Filename']);
    await page.waitFor(1000);
    console.info("status of file upload is ", status);

    // <div class="containerAddFile">
    //   <div class="diva2addfilelistdown">
    //     <iframe allowtransparency="true" class="iceInpFile" frameborder="0" height="30px" id="myForm:j_id235:uploadFrame" marginheight="0" marginwidth="0" name="myForm:j_id235:uploadFrame" scrolling="no" src="/dream/block/resource/MTM2ODIwMzM0NQ==/" style="border-collapse:collapse; border-spacing:0px; padding:0px;" title="Input File Frame" width="500px"></iframe>
    //     <span id="myForm:j_id236"></span></div>
    //   <div class="diva2addfilelist">
    //     <table border="0" cellpadding="0" cellspacing="0" class="iceOutProg iceOutProgFile" id="myForm:j_id238">
    //       <tbody>
    // 	<tr>
    // 	  <td>
    // 	    <div class="iceOutProgBg iceOutProgFileBg" style="position:relative;">
    // 	      <div class="iceOutProgFill iceOutProgFileFill" id="myForm:j_id238bar" style="position:absolute;width:100%;">&nbsp;</div>
    // 	      <div class="iceOutProgTxt iceOutProgFileTxt" style="text-align:center;position:relative;background-color:transparent;width:100%;z-index:1;">100 %</div>
    //   </div></td></tr></tbody></table></div>
    //   <span id="myForm:j_id239"></span>
    //   <div class="clear"></div></div>

    /// Uploaded file accept conditions
    await page.waitFor('[id="myForm:j_id139"]');
    //const accept_checkboxHandle = await page.$('[id="myForm:j_id139"]');
    //const accepted = await accept_checkboxHandle.click('[id="myForm:accept"]');

    if (thesis_info['File']['Accept full text']) {
	const msg_to_diva_admin_selector='The student agreed to publication of the final report in DiVA.';
	await page.type('[id="myForm:j_id175"]', msg_to_diva_admin_selector, {delay: 10});
    }
    // accept publication conditions
    await page.focus('[id="myForm:accept"]');
    await page.keyboard.press('Enter'); // Enter Key
    await page.click('[id="myForm:accept"]');

    await page.waitFor(3000);
    topbuttons = await forwardAndBackwardButtons(page);
    console.info("topbuttons is ", topbuttons);
    console.info("topbuttons['heading_ids'][2] is ", topbuttons['heading_ids'][2]);
    continue_selector = '[id="'+topbuttons['heading_ids'][2]+'"]';
    //await page.waitFor(2000);
    try {
	await Promise.all([
	    await page.click(continue_selector),
	    await page.waitForNavigation({ waitUntil: 'load' })
	]);
    } catch (error) {
	console.info("did not successfully click to go to the next page")
    }


    // The final page has the following information on it:
  // <div class="diva2addtextarea">
  // <fieldset class="diva2addborder">
  //   <div class="diva2addpubchoice">Author:</div>
  //   <div class="diva2addpubchoice2">
  //     <div class="icePnlSrs" id="j_id15:authorSerie">Maguire Jr., Gerald Q. (KTH, School of Information and Communication Technology (ICT), Communication Systems, CoS) (CCS), u1d13i2c, maguire@kth.se<br><br>Noz, Marilyn E. (NYU), men@bogus.org<br><br></div></div>
  //   <div class="icePnlSrs" id="j_id15:extCoopSeries"><span class="diva2addpubchoice" id="j_id15:extCoopSeries:0:j_id106">External cooperation:</span>
  //     <span class="diva2addpubchoice2" id="j_id15:extCoopSeries:0:j_id108">ABBBBA</span></div>
  //   <div class="diva2addpubchoice">Title:</div>
  //   <div class="diva2addpubchoice2"><span id="j_id15:title">This is a long title in English</span>
  //     <span id="j_id15:subTitle">: This is an even longer subtitle in English</span></div>
  //   <div class="icePnlSrs" id="j_id15:j_id113"><div class="diva2addpubchoice">Alternative title(sv):</div>
  //     <div class="diva2addpubchoice2"><span id="j_id15:j_id113:0:title">Detta är en lång titel på svenska</span>
  // 	<span id="j_id15:j_id113:0:subTitle">: Detta är en ännu längre undertexter på svenska</span></div></div>
  //   <div class="diva2addpubchoice">Publication type:</div>
  //   <div class="diva2addpubchoice2">Student thesis<span class="iceOutTxt" id="j_id15:publicationSubtype">, </span></div>
  //   <div class="diva2addpubchoice">Language:</div>
  //   <div class="diva2addpubchoice2"><span id="j_id15:title">English</span></div>
  //   <div class="icePnlSrs" id="j_id15:j_id124"><div class="icePnlGrp" id="j_id15:j_id124:0:j_id125"><div class="diva2addpubchoice">Level:</div>
  // 	<div class="diva2addpubchoice2"><span id="j_id15:j_id124:0:levelRev">Independent thesis Basic level (degree of Bachelor)</span></div></div>
  //     <div class="icePnlGrp" id="j_id15:j_id124:0:j_id129"><div class="diva2addpubchoice">University points:</div>
  // 	<div class="diva2addpubchoice2">10 credits / 15 HE credits</div></div>
  //     <div class="icePnlGrp" id="j_id15:j_id124:0:j_id136"><div class="diva2addpubchoice">Educational program:</div>
  // 	<div class="diva2addpubchoice2">Bachelor of Science in Engineering - Computer Engineering</div></div>
  //     <div class="icePnlGrp" id="j_id15:j_id124:0:j_id141"><div class="diva2addpubchoice">Undergraduate subject:</div>
  // 	<div class="diva2addpubchoice2">Communications Systems</div></div></div>
  //   <div class="diva2addpubchoice">Pages:</div>
  //   <div class="diva2addpubchoice2"><span id="j_id15:startpage">xiii,72</span></div>
  //   <div class="icePnlSrs" id="j_id15:j_id149"><div class="diva2addpubchoice">Series:</div>
  //     <div class="diva2addpubchoice2">TRITA-ICT-EX; 2019:00</div></div>
  //   <div class="diva2addpubchoice">Year of publ.:</div>
  //   <div class="diva2addpubchoice2"><span id="j_id15:dateIssued">2019</span></div>
  //   <div class="diva2addpubchoice">URI:</div>
  //   <div class="diva2addpubchoice2">urn:nbn:se:kth:diva-212770</div>
  //   <div class="diva2addpubchoice">Permanent link:</div>
  //   <div class="diva2addpubchoice2">http://urn.kb.se/resolve?urn=urn:nbn:se:kth:diva-212770</div>
  //   <div class="icePnlSrs" id="j_id15:j_id171"><div class="diva2addpubchoice">National subject category:</div>
  //     <div class="diva2addpubchoice2">Communication Systems</div></div>
  //   <div class="icePnlSrs" id="j_id15:j_id176"><div class="diva2addpubchoice">Keywords(en):</div>
  //     <div class="diva2addpubchoice2">Fiddle, Fee, Foo, Fum</div>
  //     <div class="diva2addpubchoice">Keywords(sv):</div>
  //     <div class="diva2addpubchoice2">Faddle, Fåå, Fää, Fööm</div></div>
  //   <div class="icePnlSrs" id="j_id15:j_id181"><div class="diva2addpubchoice">Abstract(en):</div>
  //     <div class="diva2addpubchoice2"><p>This is a abstract for an non existant thesis about <sup>18</sup>F<sup>-</sup></p></div>
  //     <div class="diva2addpubchoice">Abstract(sv):</div>
  //     <div class="diva2addpubchoice2"><p>Detta är ett abstrakt för en icke-existerande avhandling om <sup>18</sup>F<sup>-</sup></p></div></div>
  //   <div class="diva2addpubchoice">Note:</div>
  //   <div class="diva2addpubchoice2"><span id="j_id15:notes"><p>A completely bogus entry for testing with Puppeteer using diva5.js</p></span></div>
  //   <div class="diva2addpubchoice">Presentation:</div>
  //   <div class="diva2addpubchoice2"><span id="j_id15:levelRev">2019-07-25, Seminar room Grimeton at COM, Kistagången 16, East, Floor 4, Elevator B, Kista, 04:31 (English), </span></div>
  //   <div class="diva2addpubchoice">Supervisor:</div>
  //   <div class="diva2addpubchoice2"><div class="icePnlSrs" id="j_id15:j_id196">Västberg, Anders, universitetslektor (KTH, School of Information and Communication Technology (ICT), Communication Systems, CoS, Radio Systems Laboratory (RS Lab)), u1ft3a12, 0000-0002-4226-9652, vastberg@kth.se<br><br>Normal, A. B. (Famous Anvils), ABNormal@example.org<br><br></div></div>
  //   <div class="diva2addpubchoice">Examiner:</div>
    //   <div class="diva2addpubchoice2"><div class="icePnlSrs" id="j_id15:j_id209">Maguire Jr., Gerald Q., professor (KTH, School of Information and Communication Technology (ICT), Communication Systems, CoS, Radio Systems Laboratory (RS Lab)), u1d13i2c, 0000-0002-6066-746X, maguire@kth.se<br><br></div></div></fieldset></div>

    await page.waitFor('div.diva2addtextarea');
    let finalAreaHandles=await page.$$('div.diva2addtextarea fieldset');
    let finalText;
    finalText = await finalAreaHandles[0].$$eval('div', nodes => nodes.map(i => i.textContent));
    if (verboseGQM) {
	console.info("final page info: ", finalText);
    }
    let finalFileStatus;
    finalFileStatus = await finalAreaHandles[1].$$eval('div', nodes => nodes.map(i => i.textContent));
    // Save the data about where things are in this instance of DiVA
    let collected_data;
    var current_date = new Date();

    var isWin = (os.platform() === 'win32');
    if (isWin) {
	output_file_name='saved-data-'+current_date.toISOString().slice(0,10)+'.json';
	collected_data={blanks, finalText, finalFileStatus};
	try {
	    fs.writeFile(output_file_name, JSON.stringify(collected_data), function(err) {
		if (err) throw err;
		console.log('completed writing JSON information about DiVA entry');
	    });
	} catch (error) {
	    console.info("There was an error in writing the file");
	}
    } else {
	output_file_name='saved-data-'+current_date.toISOString()+'.json';
	collected_data={blanks, finalText, finalFileStatus};
	fs.writeFile(output_file_name, JSON.stringify(collected_data), function(err) {
            if (err) throw err;
            console.log('completed writing JSON information about DiVA entry');
	});

    }

    return;
    debugger;


}

main();
