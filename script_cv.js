// TODO #4.0: Change this IP address to EC2 instance public IP address when you are going to deploy this web application
const backendIPAddress = "3.211.186.194:3000";

const authorizeApplication = () => {
  window.location.href = `http://${backendIPAddress}/courseville/auth_app`;
};

// TODO #3.1: Change group number
const getGroupNumber = () => {
  return 13;
};

const checkLoginStatus = async () => {
    const options = {
      method: "GET",
      credentials: "include",
    };
    try{ 
    const response = await fetch(`http://${backendIPAddress}/courseville/get_profile_info`,options); 
    const data = await response.json();
    // console.log(data);
  }
    catch(error){
      console.log("User not logged in");
      return false;
    }
    console.log("User logged in");
    return true;
};
// Example: Send Get user profile ("GET") request to backend server and show the response on the webpage
const getUserProfile = async () => {
  const options = {
    method: "GET",
    credentials: "include",
  };
  return await fetch(
    `http://${backendIPAddress}/courseville/get_profile_info`,
    options
  )
    .then((response) => response.json())
    .then((data) => {
      // console.log(data.user);
      return data.user.firstname_en;
    })
    .catch((error) => console.error(error));
};

// TODO #3.3: Send Get Courses ("GET") request to backend server and filter the response to get Comp Eng Ess CV_cid
//            and display the result on the webpage
const getCompEngEssCid = async () => {
  document.getElementById("ces-cid-value").innerHTML = "";
  console.log(
    "This function should fetch 'get courses' route from backend server and find cv_cid value of Comp Eng Ess."
  );
};

// TODO #3.5: Send Get Course Assignments ("GET") request with cv_cid to backend server
//            and create Comp Eng Ess assignments table based on the response (itemid, title)
const createCompEngEssAssignmentTable = async () => {
  const table_body = document.getElementById("main-table-body");
  table_body.innerHTML = "";
  const cv_cid = document.getElementById("ces-cid-value").innerHTML;

  console.log(
    "This function should fetch 'get course assignments' route from backend server and show assignments in the table."
  );
};

const logout = async () => {
  window.location.href = `http://${backendIPAddress}/courseville/logout`;
};

// document.getElementById("group-id").innerHTML = getGroupNumber();
