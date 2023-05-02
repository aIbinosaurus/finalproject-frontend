// TODO #4.0: Change this IP address to EC2 instance public IP address when you are going to deploy this web application
// const backendIPAddress = "127.0.0.1:3000";

const taskList = document.getElementById('taskList');
const taskInput = document.getElementById('title');
const taskDueDate = document.getElementById('dueDate');
const taskNote = document.getElementById('note');
const taskLink = document.getElementById('link')
const addTaskButton = document.getElementById('addTaskButton');
const taskCategory = document.getElementById('selectCategory');
const addCategory = document.getElementById('addCategory');
let loginButton = document.getElementById('login');
let logoutButton = document.getElementById('logout');
let itemsData;
let isLogin = false;
let username = "";
let assignments = [];

window.onload = async () => {

  // hide add task
  // const addTask = document.getElementById('addTask');
  let checklLogin = await checkLoginStatus();
  username = await getUserProfile();
  if (checklLogin) {
    isLogin = true;
  }
  showLogin();
  await getAssignmentsFromCV();
  await getAssignmentsFromDB();
  showTask("All");
  if (username != "") {
    const loader = document.getElementById('loader');
    addTask.style.display = "flex";
    loader.style.display = "none";
  }
}

// if login show add task
function showLogin() {

  if (isLogin) {
    loginButton.style.display = "none";
    logoutButton.style.display = "flex";
  }
  else {
    loginButton.style.display = "flex";
    logoutButton.style.display = "none";
    addTask.style.display = "none";
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
  // console.log("username")
  // console.log(username)
  if (title == "" || dueDate == "" || dueTime == "" || category == "" || !isLogin || username == "") {
    return;
  }
  document.getElementById("addTaskBox").style.display = "none";
  const currentDate = new Date(); const timestamp = currentDate.getTime();
  let dict = {
    id: username + timestamp + title,
    user: username,
    title: title,
    dueDate: dueDate,
    dueTime: dueTime,
    category: category,
    note: newNote,
    link: link,
    status: false,
    type: "normal"
  }
  console.log("DICT")
  console.log(dict)
  assignments.push(dict);
  showTask("All");

  const options = {
    method: "POST",
    credentials: "include",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(dict)
  };

  taskInput.value = "";
  taskDueDate.value = "";
  taskNote.value = "";
  taskLink.value = "";
  taskCategory.value = "";
  addCategory.value = "";
  addCategory.style.display = "none";
  


  const res = await fetch(`http://${backendIPAddress}/items`, options)
  const data = await res.json();
  console.log("data")
  console.log(data)
}

const getAssignmentsFromDB = async () => {
  const options = {
    method: "GET",
    credentials: "include",
  };
  const res = await fetch(`http://${backendIPAddress}/items`, options)
  const data = await res.json();
  itemsData = data;
  console.log("itemsData from DB")
  console.log(itemsData)
  itemsData.map((item) => {
    if (item.user != username) return;
    let assignment = {};
    assignment["id"] = item.id;
    assignment["title"] = item.title;
    assignment["dueDate"] = item.dueDate;
    assignment["category"] = item.category;
    assignment["note"] = item.note;
    assignment["link"] = item.link;
    assignment["status"] = item.status;
    assignment["type"] = item.type;
    assignments.push(assignment);
  })
};

const getAssignmentsFromCV = async () => {
  onLoad = true;
  const d = new Date();
  const time = d.getTime() / 1000;
  // console.log(time);
  const options = {
    method: "GET",
    credentials: "include",
  };
  const response = await fetch(`http://${backendIPAddress}/courseville/get_courses`, options);
  const data = await response.json();
  const courses = data.data.student;
  // console.log(courses);
  await Promise.all(courses.map(async (course) => {
    if (course.semester == 2 && course.year == "2022") {
      console.log(course.year, course.semester);
      let cv_cid = course.cv_cid;
      let assignments_courses;
      const response = await fetch(`http://${backendIPAddress}/courseville/get_course_assignments/${cv_cid}`, options);
      const data = await response.json();
      assignments_courses = data.data;
      // console.log(assignments_courses);
      await Promise.all(assignments_courses.map(async (assignment_course) => {
        let item_id = assignment_course.itemid;
        const response = await fetch(`http://${backendIPAddress}/courseville/get_assignment_detail/${item_id}`, options);
        const data = await response.json();
        let assignment = {};
        if (data.data.duetime > time) {
          assignment["title"] = data.data.title;
          assignment["dueDate"] = data.data.duedate;
          assignment["category"] = "Assignment";
          assignment["dueTime"] = data.data.duetime;
          assignment["note"] = "";
          assignment["link"] = `https://www.mycourseville.com/?q=courseville/worksheet/${cv_cid}/${item_id}`;
          assignment["status"] = false;
          assignment["type"] = "mcv";
          assignments.push(assignment);
        }
      }))
    }
  }));
  onLoad = false;
};
// if (taskCategory.value == "Other") {
//     const other = selectCategory.lastChild;
//     selectCategory.removeChild(selectCategory.lastChild);
//     category[category.length - 1] = newCategory.value;
//     category.push("Other");

//     let j = category.length - 2;
//     const optionCategory = document.createElement('option');
//     const categorySidebar = document.createElement('button');
//     optionCategory.innerHTML = category[j];
//     optionCategory.value = category[j];
//     categorySidebar.innerHTML = category[j];
//     categorySidebar.className = "categorySideBar";
//     categoryBox.appendChild(categorySidebar);
//     selectCategory.appendChild(optionCategory);
//     selectCategory.appendChild(other);
//     console.log(category);
// }

//             const categoryBox = document.getElementById('categoryBox');
//             const category = ["All","Assignment","Other"];
//             for (let i = 0; i < category.length - 1; i++) {
//                 const categorySidebar = document.createElement('button');
//                 categorySidebar.className = "categorySideBar";
//                 categorySidebar.innerHTML = category[i];
//                 categorySidebar.id = category[i];
//                 categoryBox.appendChild(categorySidebar);
//                 categorySidebar.addEventListener("click", () => {
//                     showTask(category[i]);
//                 });
//             }

const showTask = (targetCategory) => {
  taskList.innerHTML = "";
  const category = ["All", "Assignment"];//thissssssss
  console.log("showTask")
  console.log(assignments)
  assignments.sort((a, b) => (a.dueDate < b.dueDate) ? -1 : (a.dueDate > b.dueDate) ? 1 : 0);
  assignments.map((assignment, i) => {

    let ch = 0;
    for(let i = 0; i < category.length; i++){
      if(assignment.category == category[i]){
        ch = 1;
        break;
      }
    }
    if(ch == 0){
      if(assignment.category != "Other"){
        category.push(assignment.category);
      }
    }
    if (assignment.category == targetCategory || targetCategory == "All") {
      const oneRow = document.createElement('div');
      const note = document.createElement('div');
      const taskItem = document.createElement('button');
      const bin = document.createElement('button');
      note.className = "note";
      if (assignment.type == "mcv") {
        taskItem.className = "mcvTask";
      }
      else {
        taskItem.className = "task";
      }
      bin.className = "deleteButton";
      taskList.className = "taskList";

      oneRow.id = `oneRow${i}`;
      oneRow.className = "oneRow";
      note.id = `note${i}`;
      taskItem.id = `task${i}`;
      bin.id = `bin${i}`;
      bin.innerHTML = `<img src="./img/image-removebg-preview 1.png" alt="bin">`;

      if (assignment.link == "") {
        note.innerHTML = `<div class = "note-text">Note</div>
                      <div class = "input-note-text"> ${assignment.note} </div>`;
      } 
      else {
        note.innerHTML = `<div class = "note-text" style= "height : 120 ";>Note</div>
                      <div class = "input-note-text"> ${assignment.note} </div>
                      <a class = "link-text" href="${assignment.link}">Link to ${assignment.title}</a>`;
      }
      if (assignment.type == "mcv") {
        taskItem.innerHTML = `<span id="taskName${i}" class="taskName" >${assignment.title}</span>
        <span >${assignment.category}</span> <span id="taskDueDate${i}" class = "taskDueDate">${assignment.dueDate}</span>`;
      }
      else if (assignments[i].status) {
        taskItem.innerHTML = `<button class = "check-task" onclick = "checkTask(event,${i})">
                          <div id = "checkMark${i}" class = "checkMark" style = "display:flex;"></div>
                        </button>
                        <span id="taskName${i}" class="taskName" style = "text-decoration : line-through;">${assignment.title}</span>
                        <span >${assignment.category}</span>
                        <span id="taskDueDate${i}" class = "taskDueDate">${assignment.dueDate}</span>`;
      } else {
        taskItem.innerHTML = `<button class = "check-task" onclick = "checkTask(event,${i})">
                          <div id = "checkMark${i}" class = "checkMark"></div>
                        </button>
                        <span id="taskName${i}" class="taskName">${assignment.title}</span>
                        <span >${assignment.category}</span>
                        <span id="taskDueDate${i}" class = "taskDueDate">${assignment.dueDate}</span>`;
      }
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
    }
    // console.log(i);

  });
  // set up category
  const categoryBox = document.getElementById('categoryBox');
  const selectCategory = document.getElementById("selectCategory");
  const initCategory = document.createElement('option');
  categoryBox.innerHTML = "";
  selectCategory.innerHTML = "";
  initCategory.value = ""
  
  console.log("category");
  console.log(category);
  console.log("length");
  console.log(category.length);

  
  for (let i = 0; i < category.length; i++) {
    console.log("I: ",i,category[i]);
    const categorySidebar = document.createElement('button');
    categorySidebar.className = "categorySideBar";
    categorySidebar.innerHTML = category[i];
    categorySidebar.id = category[i];
    categoryBox.appendChild(categorySidebar);
    categorySidebar.addEventListener("click", () => {
      showTask(category[i]);
    });
  }

  initCategory.innerHTML = "---Category---";
  selectCategory.appendChild(initCategory);

  category.push("Other");

  for (let i = 0; i < category.length; i++) {
      if(category[i] == "All") continue;
      const optionCategory = document.createElement('option');
      optionCategory.innerHTML = category[i];
      optionCategory.value = category[i];
      selectCategory.appendChild(optionCategory);
      console.log(category[i]);
  }


}

const getAssignmentsOfCategory = (category) => {
  return assignments.filter((assignment) => {
    return assignment.category === category;
  });
}

function deleteTask(idx) {
  console.log(assignments[idx].title);
  // console.log(getAssignmentsOfCategory(assignments[idx].category).length);
  if (getAssignmentsOfCategory(assignments[idx].category).length == 1 && assignments[idx].category != "All") {
    // let categoryInSidebar = document.getElementById(assignments[idx].category);
    // categoryBox.removeChild(categoryInSidebar);
    category.splice(category.indexOf(assignments[idx].category), 1);
    // console.log(category);
  }
  fetch(`http://${backendIPAddress}/items/${assignments[idx].id}`, {
    method: "DELETE",
    credentials: "include",
  });

  assignments.splice(idx, 1);
  console.log(assignments);
  showTask("All");
}

function checkTask(event, idx) {
  let x = document.getElementById("checkMark" + idx);
  let y = document.getElementById("taskName" + idx);
  console.log(x.style.display);
  event.stopPropagation();
  if (x.style.display != "flex" || x.style.display == null) {
    x.style.display = "flex";
    y.style.textDecoration = "line-through";
    assignments[idx].status = true;
  } else {
    x.style.display = "none";
    y.style.textDecoration = "none";
    assignments[idx].status = false;
  }

  const bodys = {
    status: assignments[idx].status,
  }

  const options = {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bodys),
  }

  fetch(`http://${backendIPAddress}/items/${assignments[idx].id}`, options)
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
