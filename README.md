# synologyDownloadStation

Chrome Extension for Synology DownloadStation  
-This extension is still **not published** in the Chrome Web Store

## Description

This extension allows you to quickly **view** your active or completed tasks in your Synology Torrent Client (aka. Download Station), **add** new torrents via torrent link or **remove** tasks.
### Options page
To set up the login parameters go to the extension options, and fill in the fields  
NAS address (make sure to fill in with the 'http' or 'https' and to include the port number (:5000) (see the input placeholder for example)  
Username and Password and click SAVE. Now you can close the options page and use the extension.
_Login credentials are saved locally in your Chrome browser._

### The Extension
* For authentication, the extension will create cookie (if there isn't one) and will generate a list of active tasks.
* Completed tasks are marked with green color.
* To add a new task, insert the URL in the "Add task" field.
* The refresh button reloads the task list.
* Log out button removes the credentials from the local storage and logs out.

## Technologies

* Javascript
* [Bootstrap](https://getbootstrap.com/) - open source toolkit for developing with HTML, CSS, and JS
* [Roboto fonts](https://fonts.google.com/specimen/Roboto) - Official Roboto fonts from Google
* [FontAwesome](https://fontawesome.com/) - Icon set and toolkit
