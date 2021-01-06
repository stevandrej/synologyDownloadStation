(async function init() {
	let username = null
	let password = null
	let webaddress = null;

	if (await getCredentials()) {
		/* await checkCookie(); */
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

/* 	async function checkCookie() {
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
	} */

	async function login() {
		await fetch(`${webaddress}/webapi/auth.cgi?api=SYNO.API.Auth&version=2&method=login&account=${username}&passwd=${password}&session=DownloadStation&format=cookie`)
			.then(response => {
				return response.json();
			})
			.then(loginrequest => {
				console.log(loginrequest);
/* 				chrome.cookies.set({
					'url': `${webaddress}`,
					'name': 'SynologyDownloadStation Chrome Extension',
					'value': loginrequest.data.sid
				}); */
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
		//remove tasks in the list, if previously populated 
		let list = document.getElementById("tasks-list");
		while (list.lastElementChild.getAttribute('id') !== 'loader') {
			list.removeChild(list.lastChild);
		}

		//GET tasks from server
		document.getElementById('loader').style.display = 'block';

		await fetch(`${webaddress}/webapi/DownloadStation/task.cgi?api=SYNO.DownloadStation.Task&version=1&method=list`)
			.then(response => {
				return response.json()
			})
			.then(tasks => {
				console.log(tasks);
				//Check if tasks list from server response is empty
				if (tasks.data.tasks.length === 0) {
					let appendActiveTasks = document.getElementById("tasks-list");
					let li = document.createElement("li");
					li.className = "list-group-item";
					li.appendChild(document.createTextNode("Task list is empty."));
					appendActiveTasks.appendChild(li);
				}
				else {
					let appendActiveTasks = document.getElementById("tasks-list");
					tasks.data.tasks.forEach(task => {
						let li = document.createElement("li");
						
						//background color green for finished tasks
						if(task.status === 'finished')
						{
							li.className = "list-group-item list-group-item-action bg-success text-white";
						}
						else{
							li.className = "list-group-item list-group-item-action";
						}

						li.id = task.id;
						li.appendChild(document.createTextNode(task.title));

							//create remove button
							let removeButton = document.createElement('button');
							removeButton.className = 'btn btn-dark btn-sm float-right removeBtn';
							removeButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
							
							//add event listenter to 'remove button'
							 removeButton.addEventListener('click', function removeTask(){
								let taskID = this.parentElement.id;
								document.getElementById('loader').style.display = 'block';
								fetch(`${webaddress}/webapi/DownloadStation/task.cgi?api=SYNO.DownloadStation.Task&version=1&method=delete&id=${taskID}`)
									.then(() => {
										DownloadingTasks(); //reload list
									});
							});

						li.appendChild(removeButton);

						appendActiveTasks.appendChild(li);
					});
				}
				document.getElementById('loader').style.display = 'none';
			});

	}

	//--------------------------------------
	//Button Listeners:

	//Button Add Task
	document.getElementById('buttonAddTask').addEventListener('click', async function addTask() {
		const addTaskLink = document.getElementById('addTask').value;
		if (addTaskLink !== '') {
			document.getElementById('loader').style.display = 'block';
			await fetch(`${webaddress}/webapi/DownloadStation/task.cgi?api=SYNO.DownloadStation.Task&version=1&method=create&uri=${addTaskLink}`).then(() => {
				DownloadingTasks();
			})
				.then(document.getElementById('addTask').value = '');
		}
	});

	document.getElementById('refresh').addEventListener('click', DownloadingTasks);

	//Log Out button
	document.getElementById('logOut').addEventListener('click', function () {
		fetch(`${webaddress}/webapi/auth.cgi?api=SYNO.API.Auth&version=1&method=logout&session=DownloadStation`).then(chrome.storage.local.clear());
		location.reload();
	});

})();