login();

function login(){
    chrome.storage.local.get(["username", "password", "webaddress"], function (result) {
      let { username, password, webaddress } = result;

      if (username == null || password == null || webaddress == null) {
        document.getElementById('head').innerText = "Check credentials";
        document.getElementById('logOut').hidden = true;
        return 0;
      }
      else {
        fetch(`${webaddress}/webapi/auth.cgi?api=SYNO.API.Auth&version=2&method=login&account=${username}&passwd=${password}&session=DownloadStation&format=cookie`)
          .then(response => {
            return response.json()
          })
          .then(loginrequest => {
            chrome.cookies.set({
              'url': `${webaddress}`,
              'name': 'SynologyDownloadStation',
              'value': loginrequest.data.sid
            });
          });
      }
    });
    getDownloadTasks();
}

function getDownloadTasks() {
  let tasks;
  chrome.storage.local.get(["webaddress"], function (result) {
    let webaddress = result.webaddress;
    fetch(`${webaddress}/webapi/DownloadStation/task.cgi?api=SYNO.DownloadStation.Task&version=1&method=list`).then(response => {
      return response.json()
    })
      .then(data => {
        tasks = data
      })
      .then(() => {
        let appendActiveTasks = document.getElementById("tasks-list");
        tasks.data.tasks.forEach(task => {
          let li = document.createElement("li");
          li.className = "list-group-item list-group-item-action";
          li.appendChild(document.createTextNode(task.title));
          appendActiveTasks.appendChild(li);
        });
      });
  });
}

function addTask() {
  chrome.storage.local.get(['webaddress'], function (result) {
    let webaddress = result.webaddress;
    let addTaskLink = document.getElementById('addTask').value;
    if (addTaskLink != '')
      fetch(`${webaddress}/webapi/DownloadStation/task.cgi?api=SYNO.DownloadStation.Task&version=1&method=create&uri=${addTaskLink}`)
        .then(console.log('Task ADDED!'));
    else {
      console.log("empty input field");
    }
  });
}

//--------------------
//Button Listeners:
//Button Add Task
document.getElementById('buttonAddTask').addEventListener('click', function () {
  addTask();
});

//Log Out button
document.getElementById('logOut').addEventListener('click', function () {
  chrome.storage.local.get(["webaddress"], function (result) {
    fetch(`${result.webaddress}/webapi/auth.cgi?api=SYNO.API.Auth&version=1&method=logout&session=DownloadStation`).then(chrome.storage.local.clear()).then(console.log('clear'));
  });
});