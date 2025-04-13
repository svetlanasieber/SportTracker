const BASE_URL = 'http://localhost:3030/jsonstore/workout';

const endpoints = {
    update: (id) => `${BASE_URL}/${id}`,
    delete: (id) => `${BASE_URL}/${id}`,
};

const workoutElement = document.getElementById("workout");
const dateElement = document.getElementById("date");
const locationNumber = document.getElementById("location");

const confirmedVacations = document.getElementById("history");
const list = document.getElementById('list');

const addBtn = document.getElementById("add-workout");
const editBtn = document.getElementById("edit-workout");
const loadBtn = document.getElementById("load-workout");
const clearBtn = document.querySelector(".clear-btn");

let selectedWorkoutId = null;

function attachEvents() {
    loadBtn.addEventListener('click', loadBoardEventHandler);
    addBtn.addEventListener('click', createWorkoutEventHandler);
    editBtn.addEventListener('click', editTaskEventHandler);
}

function getIdByWorkout(workout) {
    return fetch(BASE_URL)
        .then(res => res.json())
        .then(res => Object.entries(res).find(e => e[1].workout == workout)[1]._id);
}

async function loadBoardEventHandler() {
    clearAllSections();
    try {
        const res = await fetch(BASE_URL);
        const allWorkout = await res.json();
        Object.values(allWorkout).forEach((workout) => {
            const container = document.createElement('div');
            container.className = 'container';

            const workoutElement = document.createElement('h2');
            workoutElement.textContent = workout.workout;

            const dateElement = document.createElement('h3');
            dateElement.textContent = workout.date;

            const locationElement = document.createElement('h3');
            locationElement.textContent = workout.location;
            locationElement.setAttribute('id', 'location')

            const buttonsContainer = document.createElement('div'); // Create the new div for buttons
            buttonsContainer.className = 'buttons-container';

            const changeBtn = document.createElement('button');
            changeBtn.className = 'change-btn';
            changeBtn.textContent = 'Change';

            const doneBtn = document.createElement('button');
            doneBtn.className = 'delete-btn';
            doneBtn.textContent = 'Done';

            buttonsContainer.appendChild(changeBtn); // Append buttons to the new div
            buttonsContainer.appendChild(doneBtn);

            container.appendChild(workoutElement);
            container.appendChild(dateElement);
            container.appendChild(locationElement);
            container.appendChild(buttonsContainer); // Append the new div to the container

            list.appendChild(container);
        });
        attachEventListeners();
    } catch (err) {
        console.error(err);
    }
}

function attachEventListeners() {
    const changeButtons = document.querySelectorAll('.change-btn');
    const doneButtons = document.querySelectorAll('.delete-btn');

    changeButtons.forEach((changeButton) => {
        changeButton.addEventListener('click', (event) => {
            const workoutElement = event.target.closest('.container');
            const workout = workoutElement.querySelector('h2').textContent;
            const date = workoutElement.querySelector('h3:nth-child(2)').textContent;
            const location = workoutElement.querySelector('h3:nth-child(3)').textContent;
            editTask(workout, date, location);
            enableEditBtn();
        });
    });
    

    doneButtons.forEach((doneButton) => {
        doneButton.addEventListener('click', (event) => {
            const workoutElement = event.target.closest('.container');
            const location = workoutElement.querySelector('h2').textContent;
            deleteTask(location);
        });
    });
    
}

function enableEditBtn() {
    addBtn.disabled = true;
    editBtn.disabled = false;
}

function enableAddBtn() {
    addBtn.disabled = false;
    editBtn.disabled = true;
}

function createWorkoutEventHandler(ev) {
    ev.preventDefault();
    if (workoutElement.value !== '' && locationNumber.value !== '' && dateElement.value !== '') {
        const headers = {
            method: 'POST',
            body: JSON.stringify({
                workout: workoutElement.value,
                location: locationNumber.value,
                date: dateElement.value,
            }),
        };

        fetch(BASE_URL, headers)
            .then(loadBoardEventHandler)
            .catch(console.error);

        clearAllInputs();
    }
}

async function editTask(workoutName, taskDate, workoutLocation) {
    selectedWorkoutId = await getIdByWorkout(workoutName);
    workoutElement.value = workoutName;
    dateElement.value = taskDate;
    locationNumber.value = workoutLocation;
}

function editTaskEventHandler(ev) {
    ev.preventDefault();
    const workoutName = workoutElement.value;
    const data = {
        workout: workoutElement.value,
        location: locationNumber.value,
        date: dateElement.value,
        _id: selectedWorkoutId,
    };

    fetch(endpoints.update(data._id), {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then(() => {
            clearAllInputs();
            loadBoardEventHandler();
            selectedWorkoutId = null;
            enableAddBtn();
        })
        .catch(console.error);
}

function deleteTask(taskLoacation) {
    getIdByWorkout(taskLoacation)
        .then((id) =>
            fetch(endpoints.delete(id), {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            })
        )
        .then(() => {
            clearAllSections();
            loadBoardEventHandler();
            selectedWorkoutId = null;
            enableAddBtn();
        })
        .catch(console.error);
}

function clearAllSections() {
    list.innerHTML = '';
}

function clearAllInputs() {
    workoutElement.value = '';
    locationNumber.value = '';
    dateElement.value = '';
}

attachEvents();
