document.addEventListener("DOMContentLoaded", function(){

    const searchButton = document.getElementById("search-button");
    const usernameInput = document.getElementById("user-input");
    const statsContainer = document.querySelector(".stats-container");
    const easyProgressCircle = document.querySelector(".easy-progress");
    const mediumProgressCircle = document.querySelector(".medium-progress");
    const hardProgressCircle = document.querySelector(".hard-progress");
    const easyLabel = document.getElementById("easy-label");
    const mediumLabel = document.getElementById("medium-label");
    const hardLabel = document.getElementById("hard-label");
    const cardStatsContainer = document.querySelector(".stats-cards");

    function validateUsername(username){
        if(username.trim() === "") {
            alert("username should not be empty");
            return false;
        }
        const regex = /^[a-zA-Z_][a-zA-Z0-9_]{2,14}$/;
        const isMatching = regex.test(username);
        if(!isMatching) {
            alert("Invalid Username!");
        }
        return isMatching;
    }

    async function fetchUserDetails(username) {

        try{
            searchButton.textContent = "Searching...";
            searchButton.disabled = true;
            
            const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
            const targetUrl = 'https://leetcode.com/graphql/';
        const myHeaders = new Headers();
        myHeaders.append("content-type", "application/json");

        const graphql = JSON.stringify({
            query: `
            query userSessionProgress($username: String!) {
      allQuestionsCount {
        difficulty
        count
      }
      matchedUser(username: $username) {
        submitStats {
          acSubmissionNum {
            difficulty
            count
          }
          totalSubmissionNum {
            difficulty
            count
          }
        }
      }
    }
  `,
  variables: { "username": `${username}`}
    
    });

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body:graphql,
        redirect: "follow"
    };

    const response = await fetch(proxyUrl+targetUrl, requestOptions);

            if(!response.ok) {
                throw new Error("unable to fetch the User details");
            }
            const passedData = await response.json();
            console.log("Logging data:", passedData);

            displayUserData(passedData);
        }

        catch(error) {
            statsContainer.innerHTML = '<p>No Data Found</p>'
        }

        finally {
            searchButton.textContent = "Search";
            searchButton.disabled = false;
        }
    }

    function updateProgress(solved, total, label, circle) {
      const progressDegree = (solved/total)*100;
      circle.style.setProperty("--progress-degree", `${progressDegree}%`);
      label.textContent = `${solved}/${total}`;
    }

    function displayUserData(passedData) {
      const totalQuestions = passedData.data.allQuestionsCount[0].count;
      const totalEasyQuestions = passedData.data.allQuestionsCount[1].count;
      const totalMediumQuestions = passedData.data.allQuestionsCount[2].count;
      const totalHardQuestions = passedData.data.allQuestionsCount[3].count;

      const solvedTotalQuestions = passedData.data.matchedUser.submitStats.acSubmissionNum[0].count;
      const solvedTotalEasyQuestions = passedData.data.matchedUser.submitStats.acSubmissionNum[1].count;
      const solvedTotalMediumQuestions = passedData.data.matchedUser.submitStats.acSubmissionNum[2].count;
      const solvedTotalHardQuestions = passedData.data.matchedUser.submitStats.acSubmissionNum[3].count;

      updateProgress(solvedTotalEasyQuestions, totalEasyQuestions, easyLabel, easyProgressCircle);
      updateProgress(solvedTotalMediumQuestions, totalMediumQuestions, mediumLabel, mediumProgressCircle);
      updateProgress(solvedTotalHardQuestions, totalHardQuestions, hardLabel, hardProgressCircle);

      const cardsData = [
        { label: "Overall Submissions", value: passedData.data.matchedUser.submitStats.totalSubmissionNum[0].count},
        { label: "Overall Easy Submissions", value: passedData.data.matchedUser.submitStats.totalSubmissionNum[1].count},
        { label: "Overall Medium Submissions", value: passedData.data.matchedUser.submitStats.totalSubmissionNum[2].count},
        { label: "Overall Hard Submissions", value: passedData.data.matchedUser.submitStats.totalSubmissionNum[3].count}
      ];

      console.log("card data", cardsData);

      cardStatsContainer.innerHTML = cardsData.map(
        data => { 
          return  `<div class="card">
            <h4>${data.label}</h4>
            <p>${data.value}</p>
            </div>`;
           }).join("");
    }
    searchButton.addEventListener('click', function() {
        const username = usernameInput.value;
        console.log("Loggedin useranme:", username); 
        if(validateUsername(username)) {
            fetchUserDetails(username);
        }
    })
})