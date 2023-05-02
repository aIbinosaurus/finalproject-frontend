// TODO #4.0: Change this IP address to EC2 instance public IP address when you are going to deploy this web application
// const backendIPAddress = "127.0.0.1:3000";

const taskList = document.getElementById('taskList');
const taskInput = document.getElementById('title');
const taskDueDate = document.getElementById('dueDate');
const taskNote = document.getElementById('note');
const taskLink = document.getElementById('link')
const addTaskButton = document.getElementById('addTaskButton');
const taskCategory = document.getElementById('selectCategory');
const newCategory = document.getElementById('addCategory');
let loginButton = document.getElementById('login');
let logoutButton = document.getElementById('login');
let isLogin = false;
let itemsData;

let assignments = [];

window.onload = async() =>{
  if(checkLoginStatus()){
    isLogin = true;
  }
  await getAssignmentsFromCV();
  console.log("test");
  console.log(assignments);
  console.log(assignments.length);
    showTask();
    console.log("Load");
    console.log(onLoad);
  showLogin();
}



function showLogin(){
  let loginButton = document.getElementById('login');
  let logoutButton = document.getElementById('login');
  if(isLogin){
    loginButton.style.display("none");
    logoutButton.style.display("flex");
  } 
  else{
    loginButton.style.display("flex");
    logoutButton.style.display("none");
  }
}

function showAddTask() {
  let x = document.getElementById("addTaskBox");
  if (x.style.display == "none") {
    x.style.display = "flex";
  } else {
    x.style.display = "none";
  }
}

async function newTask(title, dueDate, dueTime, category, newNote, link) {
  let dict = {
    title: title,
    dueDate: dueDate,
    dueTime: dueTime,
    category: category,
    note: newNote,
    link: link
  }
  assignments.push(dict);
  showTask();
  const response = await fetch(`http://${backendIPAddress}/items`, {
    method: 'POST',
    credentials: "include",
    body: JSON.stringify(dict)
  });
}

const getAssignmentsFromDB = async () => {
  const options = {
    method: "GET",
    credentials: "include",
  };
  await fetch(`http://${backendIPAddress}/items`, options)
    .then((response) => response.json())
    .then((data) => {
      itemsData = data;
    })
    .catch((error) => console.error(error));
  console.log(itemsData);
  assignments.push(itemsData);
  showTask();
};

const getAssignmentsFromCV = async () => {
  onLoad = true;
  const d = new Date();
  const time = d.getTime() / 1000;
  console.log(time);
  const options = {
    method: "GET",
    credentials: "include",
  };
  const response = await fetch(`http://${backendIPAddress}/courseville/get_courses`, options);
  const data = await response.json();
  const courses = data.data.student;

  console.log("courses");
  console.log(courses.length);
  console.log(courses);

  await Promise.all(courses.map(async (course) => {
    let cv_cid = course.cv_cid;
    let assignments_courses;
    const response = await fetch(`http://${backendIPAddress}/courseville/get_course_assignments/${cv_cid}`, options);
    const data = await response.json();
    assignments_courses = data.data;
    console.log(assignments_courses);
    await Promise.all(assignments_courses.map(async (assignment_course) => {
      let item_id = assignment_course.itemid;
      const response = await fetch(`http://${backendIPAddress}/courseville/get_assignment_detail/${item_id}`, options);
      const data = await response.json();
      let assignment = {};
      if (data.data.duetime > time) {
        assignment["title"] = data.data.title;
        assignment["dueDate"] = data.data.duedate;
        assignment["category"] = "assignment";
        assignment["dueTime"] = data.data.duetime;
        assignment["note"] = "";
        assignment["link"] = `https://www.mycourseville.com/?q=courseville/worksheet/${cv_cid}/${item_id}`;
        assignments.push(assignment);
      }
    }))
  }));
  onLoad = false;
};

const showTask = () =>{
  taskList.innerHTML="";
  console.log("ShowTask");
  console.log(assignments);
  assignments.map((assignment, i) => {
    console.log(i);
    const oneRow = document.createElement('div');
    const note = document.createElement('div');
    const taskItem = document.createElement('button');
    const bin = document.createElement('button');
    note.className = "note";
    taskItem.className = "task";
    bin.className = "deleteButton";
    taskList.className = "taskList";

    oneRow.id = `oneRow${i}`;
    oneRow.className = "oneRow";
    note.id = `note${i}`;
    taskItem.id = `task${i}`;
    bin.id = `bin${i}`;
    bin.innerHTML = `<img src="./img/image-removebg-preview 1.png" alt="bin">`;

    if (taskLink.value != '') { 
      note.innerHTML = `<div class = "note-text">Note</div>
                      <div class = "input-note-text"> ${assignment.note} </div>
                      <a class = "link-text" href="${assignment.link}">Link to ${assignment.title}</a>`;
    } else {
      note.innerHTML = `<div class = "note-text" style= "height : 120 ";>Note</div>
                      <div class = "input-note-text"> ${assignment.note} </div>`;
    }
    taskItem.innerHTML = `<button class = "check-task" onclick = "checkTask(event,${i})">
                          <div id = "checkMark${i}" class = "checkMark"></div>
                        </button>
                        <span id="taskName${i}" class="taskName">${assignment.title}</span>
                        <span id="taskDueDate${i}" class = "taskDueDate">${assignment.dueDate}</span>`;
    oneRow.appendChild(taskItem);
    oneRow.appendChild(bin);
    taskList.appendChild(oneRow);
    taskList.appendChild(note);
    taskInput.value = '';
    taskItem.addEventListener('click', () => {
      clickTask(i);
    });
    bin.addEventListener("click", () => {
      deleteTask(i);
    });
  });
}
// TODO #2.2: Show group members
// const showGroupMembers = async () => {
//   const member_list = document.getElementById("member-list");
//   member_list.innerHTML = "";
//   const member_dropdown = document.getElementById("name-to-add");
//   member_dropdown.innerHTML =
//     "<option value='0'>-- เลือกผู้ฝากซื้อ --</option>";
//   const options = {
//     method: "GET",
//     credentials: "include",
//   };
//   await fetch(`http://${backendIPAddress}/items/members`, options)
//     .then((response) => response.json())
//     .then((data) => {
//       const members = data;
//       members.map((member) => {
//         member_list.innerHTML += `
//           <li>${member.full_name}</li>
//           `;
//         // ----------------- FILL IN YOUR CODE UNDER THIS AREA ONLY ----------------- //
//         member_dropdown.innerHTML += ``;
//         // ----------------- FILL IN YOUR CODE ABOVE THIS AREA ONLY ----------------- //
//       });
//     })
//     .catch((error) => console.error(error));
// };

// TODO #2.3: Send Get items ("GET") request to backend server and store the response in itemsData variable
// const getItemsFromDB = async () => {
//   console.log(
//     "This function should fetch 'get items' route from backend server."
//   );
// };

// // TODO #2.4: Show items in table (Sort itemsData variable based on created_date in ascending order)
// const showItemsInTable = (itemsData) => {
//   const table_body = document.getElementById("main-table-body");
//   table_body.innerHTML = "";
//   // ----------------- FILL IN YOUR CODE UNDER THIS AREA ONLY ----------------- //

//   // ----------------- FILL IN YOUR CODE ABOVE THIS AREA ONLY ----------------- //
//   itemsData.map((item) => {
//     // ----------------- FILL IN YOUR CODE UNDER THIS AREA ONLY ----------------- //
//     table_body.innerHTML += `
//         <tr id="${item.item_id}">
//             <td>${item.item}</td>
//             <td>Name</td>
//             <td>Price</td>
//             <td><button class="delete-row" onclick="deleteItem('${item.item_id}')">ลบ</button></td>
//         </tr>
//         `;
//     // ----------------- FILL IN YOUR CODE ABOVE THIS AREA ONLY ----------------- //
//   });
// };

// TODO #2.5: Send Add an item ("POST") request to backend server and update items in the table
// const addItem = async () => {
//   const item = document.getElementById("item-to-add").value;
//   const name = document.getElementById("name-to-add").value;
//   const price = document.getElementById("price-to-add").value;

//   console.log(
//     "This function should fetch 'add item' route from backend server and update items in the table."
//   );
// };

// // TODO 2.6: Send Delete an item ("DELETE") request to backend server and update items in the table
// const deleteItem = async (item_id) => {
//   console.log(
//     "This function should fetch 'delete item' route in backend server and update items in the table."
//   );
// };

// const redrawDOM = () => {
//   window.document.dispatchEvent(
//     new Event("DOMContentLoaded", {
//       bubbles: true,
//       cancelable: true,
//     })
//   );
//   document.getElementById("item-to-add").value = "";
//   document.getElementById("name-to-add").value = "0";
//   document.getElementById("price-to-add").value = "";
// };

// document.getElementById("group-no").innerHTML = getGroupNumber();

// document.addEventListener("DOMContentLoaded", async function (event) {
//   await getAssignmentsFromCV();
//   console.log("Tasks are showing");
// });

  // console.log("Showing group members.");
  // await showGroupMembers();
  // console.log("Showing items from database.");
  // await getItemsFromDB();
  // showItemsInTable(itemsData);
// });
