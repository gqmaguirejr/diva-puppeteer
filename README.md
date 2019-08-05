# diva-puppeteer
These programs and files are used with Puppeteer to enter data into DiVA.

## diva7.js
Purpose: To enter a student thesis into DiVA

Input:
```
node diva7.js thesis_info.json
```

Output:
Outputs a file containing the information that was loaded and the IDs of the input, select, textarea, buttons, etc. that were found.


### Notes:
The program is a work in progress, but represents a substantial cleanup since diva6.js

The format of the output files name is similar to saved-data-2019-08-04T19:33:49.064Z.json
Note that on windows only the data is used - as the rest of the name is unsuitable for the Windows OS.

## extract-organization-info.js
Purpose: To extract the organization tree from DiVA

Input:
```
node extract-organization-info.js
```

Output:
Outputs a file containing the information that was found in the tree of categories.
The file name is similar to org-data-2019-08-01T13:01:49.920Z.json

This is used to create a file with the name:
     kth-org-diva-new.json
     kth-org-diva-old.json	

### Notes:
Note that you have to remove the "banks" part of the dictionary and the outer dictionary from the file that the program produces.

## extract-national-subject-categories-info.js
Purpose: To extract the National Subject Category information from DiVA

Input:
```
node extract-national-subject-categories-info.js
```

Output:
Outputs a file containing the information that was found in the tree of categories.
The file name is similar to national-subject-catergory-data-2019-08-01T13:20:35.101Z.json

This is used to create a file with the name:
     National_subject_categories-new.json
     National_subject_categories-old.json


### Notes:
Note that you have to remove the "banks" part of the dictionary and the outer dictionary from the file that the program produces.




## diva6.js
Purpose: To enter a student thesis into DiVA

Input:
```
node diva7.js thesis_info.json

Output:
Outputs a file containing the information that was loaded and the IDs of the input, select, textarea, buttons, etc. that were found.


### Notes:
The program is a work in progress - extensive use of page.waitFor(time)


