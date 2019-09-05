Tools for use with Puppeter when filling in DiVA's forms, i.e., entering meta-data and uploading documents to DiVA. The focus of the code has been on degree projects. The assumption is that another program gets data from Canvas and from the thesis itself to make a JSON file that contains the relevant data and a pointer to the file containing the document (thesis).

# diva7.js
The latest version of the program for making an entry in DiVA.

# divaN.js are earlier versions of the program

# Entering_data_inf_DiVA.docx
contains documentation on the program and how it works

# extract-national-subject-categories-info.js
Extracts the national subject category information from DiVA, this is used to create a JSON file that the diva7.js program later uses.

For example, National_subject_categories-new.json is the latest national subject categories tree (as of August 2019); while National_subject_categories-old.json is an earlier one. Note that the test instance of DiVA has the old tree.

# extract-organization-info.js
Extracts the organization information from DiVA, this is used to create a JSON file that the diva7.js program later uses.

For example, kth-org-diva-new.json is the latest KTH organization tree (as of August 2019); while kth-org-diva-old.json is the older organization tree.  Note that the test instance of DiVA has the old tree.

# thesis_info.json, thesis_info-CSC-TCS-ICT-EES.json, ...
JSON files for fake theses as test cases and examples




