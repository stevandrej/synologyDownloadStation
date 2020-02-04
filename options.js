let uname;
let pass;
let address;

let buttonSave = document.getElementById('buttonSave');

buttonSave.addEventListener('click',
    function setCredentials() {
        uname = document.getElementById('username').value;
        pass = document.getElementById('password').value;
        address = document.getElementById('webaddress').value;

        if(uname=='' || pass=='')
        {
            errorNotification();
        }
        else {
            chrome.storage.local.set({ username:uname, password:pass, webaddress:address });
            savedNotification();
        }
    });

    function createElementForSavedNotification() {
        const txtElement = document.createElement('div');
        txtElement.className = "alert alert-success";
        txtElement.setAttribute("role", 'alert');
        txtElement.setAttribute('id', 'notification');

        text = document.createTextNode("Credentials saved!");

        txtElement.appendChild(text);
        document.getElementById('savedNotification').appendChild(txtElement);
    }

    function createElementForErrorNotification() {
        const txtElement = document.createElement('div');
        txtElement.className = "alert alert-danger";
        txtElement.setAttribute("role", 'alert');
        txtElement.setAttribute('id', 'notification');

        text = document.createTextNode("Oops! Have you filled the credential fields?");

        txtElement.appendChild(text);
        document.getElementById('savedNotification').appendChild(txtElement);
    }

    function savedNotification(){
        if (!document.getElementById('notification')) {
            createElementForSavedNotification();
        }
        else 
        {
            document.getElementById('notification').remove();
            createElementForSavedNotification();
        }
    }

    function errorNotification(){
        if (!document.getElementById('notification')) {
            createElementForErrorNotification();
        }
        else 
        {
            document.getElementById('notification').remove();
            createElementForErrorNotification();
        }
    }