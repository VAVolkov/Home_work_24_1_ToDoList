'use strict';

class TodoList {
    constructor({ card, ulTask, ulTaskDone }) {

        this.card = document.querySelector(card);
        this.ulTask = this.card.querySelector(ulTask);
        this.ulTaskDone = this.card.querySelector(ulTaskDone);
        this.liNotDone = this.ulTask.querySelectorAll('input[data-status=false]')
        this.liDoneZero = this.ulTaskDone.querySelector('.hide');
        this.liTaskDone = this.ulTaskDone.querySelectorAll('li');
        this.liNotDoneZero = this.ulTask.children[0].outerHTML;

        this.tasksListFromLocalStorage = [];

    }
    createEmptyTask() {
        let liEmpty = `
            <li><img class="icons" src="img/circle.png">
                <input type="text" data-status="false" class="task" placeholder="Нове завдання">
                <img class="icons" src="img/plus.png">
            </li>
        `
        this.ulTask.lastElementChild.insertAdjacentHTML('afterEnd', liEmpty);
    }

    createEmptyTaskDone() {
        let liEmpty = `
            <li><img class="icons" src="img/checklist.png">
                <input type="text" data-status="true" class="task" placeholder="Нове завдання" disabled>
                <img class="icons" src="img/minus.png">
            </li>
        `
        this.ulTaskDone.lastElementChild.insertAdjacentHTML('afterEnd', liEmpty);
    }

    createEmptyHideTask() {
        let liEmpty = `
            <li class="hide"><img class="icons" src="img/circle.png">
                <input type="text" data-status="false" class="task" placeholder="Нове завдання">
                <img class="icons" src="img/plus.png">
            </li>
        `
        this.ulTask.innerHTML = liEmpty;
    }

    createEmptyHideTaskDone() {
        let liEmpty = `
            <li class="hide"><img class="icons" src="img/checklist.png">
                <input type="text" data-status="true" class="task" placeholder="Нове завдання" disabled>
                <img class="icons" src="img/minus.png">
            </li>
        `
        this.ulTaskDone.innerHTML = liEmpty;
    }

    toTaskDone() {
        this.ulTask.addEventListener('click', (even) => {
            let targetTask = even.target;
            let taskMessage;


            if (targetTask.matches('img[src="img/circle.png"]')) {
                let tmp = targetTask.parentElement;
                tmp.children[0].src = "img/checklist.png";
                taskMessage = tmp.children[1].value;
                tmp.children[2].src = "img/minus.png";
                this.ulTaskDone.lastElementChild.insertAdjacentHTML('afterEnd', tmp.outerHTML);

                this.ulTaskDone.lastElementChild.children[1].setAttribute('data-status', 'true');
                this.ulTaskDone.lastElementChild.children[1].disabled = 'disabled';
                this.ulTaskDone.lastElementChild.children[1].value = taskMessage;

                targetTask.parentElement.remove();
                this.createEmptyTask();
                this.createTasksObject();

            } else if (targetTask.matches('img[src="img/plus.png"]')) {
                this.ulTask.lastElementChild.insertAdjacentHTML('afterEnd', this.liNotDoneZero);
                this.createTasksObject();
            }
        });
    }

    deleteTask() {
        this.ulTaskDone.addEventListener('click', (even) => {
            let targetTask = even.target;
            if (targetTask.matches('img[src="img/minus.png"]')) {
                targetTask.parentElement.remove();
                this.createTasksObject();
            }
        })
    }

    createTasksObject() {

        let tasksObject = {};
        let tasksAll = this.card.querySelectorAll('li');
        console.dir(tasksAll);
        for (let i = 0; i < tasksAll.length; i++) {
            let taskStatus = tasksAll[i].children[1].attributes[1].nodeValue;
            let taskValue = tasksAll[i].children[1].value;
            tasksObject[i] = { value: `${taskValue}`, status: `${taskStatus}` };
        }
        console.dir(tasksObject);
        localStorage.setItem('tasksObject', JSON.stringify(tasksObject));
    }

    saveTaskObject() {
        this.card.addEventListener('change', () => {
            this.createTasksObject();
        })
    }

    getTaskObject() {
        this.tasksListFromLocalStorage = JSON.parse(localStorage.getItem('tasksObject'));
        console.log(this.tasksListFromLocalStorage);
        return this.tasksListFromLocalStorage;
    }

    buildTasksList() {
        let task = '';
        this.ulTaskDone = this.card.querySelector('.taskDone');
        this.ulTaskDone.innerHTML = "";
        this.ulTask = this.card.querySelector('.task');
        this.ulTask.innerHTML = "";
        this.createEmptyHideTask();
        this.createEmptyHideTaskDone();

        let tasksArray = this.getTaskObject();

        for (let key in tasksArray) {

            let value = tasksArray[key].value;
            let status = tasksArray[key].status;
            if (status == 'false') {
                this.createEmptyTask();
                this.ulTask = this.card.querySelector('.task');
                this.ulTask.lastElementChild.children[1].value = value;
            } else {
                this.createEmptyTaskDone();
                this.ulTaskDone = this.card.querySelector('.taskDone');
                this.ulTaskDone.lastElementChild.children[1].value = value;
            }
        }
    }

    buildDefualtTaskList() {
        this.createEmptyHideTask();
        this.createEmptyHideTaskDone();
        this.createEmptyTask();
        this.createEmptyTask();
        this.createEmptyTask();
        this.createEmptyTask();
    }

    cleanUp() {
        this.ulTaskDone = this.card.querySelector('.taskDone');
        this.ulTask = this.card.querySelector('.task');
        this.ulTask.children[1].remove();
        this.ulTaskDone.children[1].remove();
    }

    buildTasksListFromAPI(item) {
        let task = '';
        this.ulTaskDone = this.card.querySelector('.taskDone');
        this.ulTaskDone.innerHTML = "";
        this.ulTask = this.card.querySelector('.task');
        this.ulTask.innerHTML = "";
        this.createEmptyHideTask();
        this.createEmptyHideTaskDone();

        let tasksArray = item;

        for (const v of tasksArray) {
            let value = v.title;
            let status = v.completed;
            if (status == false) {
                this.createEmptyTask();
                this.ulTask = this.card.querySelector('.task');
                this.ulTask.lastElementChild.children[1].value = value;
            } else {
                this.createEmptyTaskDone();
                this.ulTaskDone = this.card.querySelector('.taskDone');
                this.ulTaskDone.lastElementChild.children[1].value = value;
            }

        }
    }

    getObjectFromServer() {
        const request = new XMLHttpRequest();
        let arrayObjectFromAPI = [];

        request.addEventListener('readystatechange', () => {

            if ((request.readyState === 4) && (request.status === 200)) {
                const data = JSON.parse(request.responseText);
                data.forEach(item => {
                    if (item.userId === 1) {
                        arrayObjectFromAPI.push(item);
                    }
                    this.buildTasksListFromAPI(arrayObjectFromAPI);
                })
            }
        });

        request.open('GET', 'https://jsonplaceholder.typicode.com/todos');
        request.setRequestHeader('Content-type', 'application/json');
        request.send();

        console.dir(request);
    }

    init() {
        this.getObjectFromServer();

        // this.getTaskObject();
        // if (this.tasksListFromLocalStorage == null) {
        //     this.buildDefualtTaskList();
        // } else {
        //     this.buildTasksList();
        //     this.cleanUp();
        // }

        this.toTaskDone();
        this.deleteTask();
        this.saveTaskObject();

    }
}

