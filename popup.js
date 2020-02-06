(async function init() {
	let username = null
	let password = null
	let webaddress = null;

	if (await getCredentials()) {
		await checkCookie();
		await DownloadingTasks();
	}

	async function getCredentials() {
		return await new Promise(resolve => {
			chrome.storage.local.get(["username", "password", "webaddress"], function (result) {
				username = result.username;
				password = result.password;
				webaddress = result.webaddress;
				if (username == null || password == null || webaddress == null) {
					//If empty NOTIFY user and don't continue
					document.getElementById('head').innerText = "Check credentials!";
					document.getElementById('logOut').hidden = true;
					document.getElementById('tasks-list-div').hidden = true;
					document.getElementById('add-task').hidden = true;
					resolve(false);
				} else {
					resolve(true);
				}
			})
		});
	}

	async function checkCookie() {
		chrome.cookies.get(
			{
				"url": webaddress,
				"name": 'SynologyDownloadStation Chrome Extension'
			}, async data => {
			if (data) {
				if (data.value == null && data.name !== "SynologyDownloadStation Chrome Extension") {
					await login();
				}
			}
			else {
				await login();
			}
		});
	}

	async function login() {
		await fetch(`${webaddress}/webapi/auth.cgi?api=SYNO.API.Auth&version=2&method=login&account=${username}&passwd=${password}&session=DownloadStation&format=cookie`)
			.then(response => {
				return response.json();
			})
			.then(loginrequest => {
				chrome.cookies.set({
					'url': `${webaddress}`,
					'name': 'SynologyDownloadStation Chrome Extension',
					'value': loginrequest.data.sid
				});
			});
	}

	async function DownloadingTasks() {
		try {
			await DownloadTasks_getMethod();
		}
		catch (er) {
			await login();
			await DownloadTasks_getMethod();
		}
	}

	async function DownloadTasks_getMethod() {
		await fetch(`${webaddress}/webapi/DownloadStation/task.cgi?api=SYNO.DownloadStation.Task&version=1&method=list`)
			.then(response => {
				return response.json()
			})
			.then(tasks => {
				console.log(tasks);
				let appendActiveTasks = document.getElementById("tasks-list");
				tasks.data.tasks.forEach(task => {
					let li = document.createElement("li");
					li.className = "list-group-item list-group-item-action";
					li.appendChild(document.createTextNode(task.title));
					appendActiveTasks.appendChild(li);
				});
			});
	}

	function addTask() {
		chrome.storage.local.get(['webaddress'], function (result) {
			let webaddress = result.webaddress;
			const addTaskLink = document.getElementById('addTask').value;
			if (addTaskLink !== '')
				fetch(`${webaddress}/webapi/DownloadStation/task.cgi?api=SYNO.DownloadStation.Task&version=1&method=create&uri=${addTaskLink}`);
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
		console.log('log out');
		chrome.storage.local.get(["webaddress"], function (result) {
			fetch(`${result.webaddress}/webapi/auth.cgi?api=SYNO.API.Auth&version=1&method=logout&session=DownloadStation`).then(chrome.storage.local.clear()).then(console.log('clear'));
		});
		location.reload();
	});

})();