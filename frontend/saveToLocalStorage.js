const saveBtn = document.getElementById("save-btn");

let savedPosts = [];
let currentPost = null;
let labelFrequency = {};

let currentPage = 1;
const postsPerPage = 6; // 10 posts per page
const columns = 2; // 2 columns layout

if (!currentPost) saveBtn.disabled = true

console.log(`current post: ${currentPost}`)

function inputByBatch() {
    // get txt file
    // read lines
    // for line in txt
    // fetch labels
    // saveToLocalStorage
    // updateSavedPostDisplay
}

saveBtn.addEventListener("click", function () {
    // if () {
    console.log(`Num saved posts: ${savedPosts.length}`)
    console.log("Saving post...")
    saveToLocalStorage(currentPost)
    updateSavedPostsDisplay()
    saveBtn.disabled = true
    Toast('Post saved successfully!');
    // }
})




const PostDisplay = (post, index) => {
    const postElement = document.createElement("div");
    postElement.classList.add("postDisplay", "border-none");

    // Post text
    const textElement = document.createElement("p");
    textElement.textContent = post.text;
    textElement.classList.add("postDisplay-text");

    // Bottom row for labels and delete button
    const bottomRow = document.createElement("div");
    bottomRow.classList.add("postDisplay-bottomRow");

    // const bottomRow2 = document.createElement("div");
    // bottomRow2.classList.add("postDisplay-bottomRow");

    // Label container
    const labelsContainer = document.createElement("div");
    labelsContainer.classList.add("postDisplay-labelContainer");
    for (let label of post.labels) {
        if (parseFloat(label.probability) > 50) {
            const labelElement = document.createElement("div");
            labelElement.classList.add(
                "postDisplay-label",
                `label-${label.name.toLowerCase()}`
            );
            labelElement.textContent = label.name;
            labelsContainer.appendChild(labelElement);
        }
    }

    // Delete button
    const deleteButton = document.createElement("button");
    deleteButton.classList.add("deleteButton");

    // Create an icon element
    const deleteIcon = document.createElement("i");
    deleteIcon.classList.add("bx", "bx-trash", "bx-xs"); // 
    deleteButton.appendChild(deleteIcon);

    deleteButton.addEventListener("click", () => deleteSavedPost(index));

    // Append labels and delete button to the bottom row
    bottomRow.appendChild(labelsContainer);
    bottomRow.appendChild(deleteButton);

    // Append text and bottom row to the post element
    postElement.appendChild(textElement);
    postElement.appendChild(bottomRow);

    return postElement;
};

function saveToLocalStorage(data) {
    // localStorage.clear()
    console.log("data");
    console.log(data);

    // Retrieve existing data from localStorage
    savedPosts = JSON.parse(localStorage.getItem("savedPosts")) || [];

    // Add new data to saved posts array
    savedPosts.push(data);

    // Save the updated array back to localStorage
    localStorage.setItem("savedPosts", JSON.stringify(savedPosts));

    console.log("Localstorage:");
    console.log(JSON.parse(localStorage.getItem("savedPosts")));
}

function displayPage(page) {
    const startIndex = (page - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const postsToShow = savedPosts.slice(startIndex, endIndex);

    // Clear existing posts
    const savedPostsContainer = document.getElementById("savedPosts");
    savedPostsContainer.innerHTML = "";

    // Create a table element
    const table = document.createElement("table");
    table.classList.add("posts-table");

    let row;

    // Add posts for this page in a table format
    postsToShow.forEach((post, index) => {
        // Create a new row for every two posts
        if (index % 2 === 0) {
            row = document.createElement("tr");
            table.appendChild(row);
        }

        const cell = document.createElement("td");
        const postDisplayElement = PostDisplay(post, startIndex + index);
        cell.appendChild(postDisplayElement);
        row.appendChild(cell);
    });

    savedPostsContainer.appendChild(table);
}

// Function to create pagination controls
function createPaginationControls() {
    const paginationControls = document.getElementById("pagination-controls");
    paginationControls.innerHTML = "";

    // Calculate total number of pages
    const totalPages = Math.ceil(savedPosts.length / postsPerPage);

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement("button");
        pageButton.innerText = i;

        // Add 'active-page' class to the current page button
        if (i === currentPage) {
            pageButton.classList.add("active-page");
        }

        pageButton.addEventListener("click", () => {
            currentPage = i; // Update the current page
            displayPage(i);
            updateActivePageButton();
        });

        paginationControls.appendChild(pageButton);
    }
}

function updateActivePageButton() {
    // Remove active class from all buttons
    document.querySelectorAll("#pagination-controls button").forEach((button) => {
        button.classList.remove("active-page");
    });

    // Add active class to the current page button
    const activeButton = document.querySelector(
        `#pagination-controls button:nth-child(${currentPage})`
    );
    if (activeButton) {
        activeButton.classList.add("active-page");
    }
}

function updateSavedPostsDisplay() {
    savedPosts = JSON.parse(localStorage.getItem("savedPosts")) || [];
    displayPage(1);
    createPaginationControls();

    console.log("savedPosts");
    console.log(savedPosts);

    labelFrequency = countLabelFrequency();
    document.getElementById("frequency-container").innerHTML = "";

    console.log("innerHTML");
    console.log(document.getElementById("frequency-container").innerHTML);

    for (let label in labelFrequency) {
        console.log(`${label}: ${labelFrequency[label]}`);
        labelFreq = `<span> ${label}: ${labelFrequency[label]} </span>`;
        document.getElementById("frequency-container").innerHTML += labelFreq;
    }
}

function countLabelFrequency() {
    const labelNames = [
        "Age",
        "Gender",
        "Physical",
        "Race",
        "Religion",
        "Others",
    ];

    labelNames.forEach((label) => {
        labelFrequency[label] = 0;
    });

    savedPosts.forEach((obj) => {
        // Iterate through the labels array of each object
        obj.labels.forEach((label) => {
            // Check if the label probability is greater than 50%
            if (parseFloat(label.probability) > 50 && label.name in labelFrequency) {
                // If it meets the conditions, increment the count
                labelFrequency[label.name]++;
            }
        });
    });

    // Print the label frequencies
    console.log(labelFrequency);

    return labelFrequency;
}

function deleteSavedPost(index) {
    // Retrieve existing data from localStorage
    savedPosts = JSON.parse(localStorage.getItem("savedPosts")) || [];

    // Remove the post at the specified index
    savedPosts.splice(index, 1);

    // Save the updated array back to localStorage
    localStorage.setItem("savedPosts", JSON.stringify(savedPosts));

    // Update the display after deletion
    updateSavedPostsDisplay();
}

// Call updateSavedPostsDisplay when the page loads
document.addEventListener("DOMContentLoaded", (event) => {
    updateSavedPostsDisplay();
});


function saveToLocalStorage(data) {

    // localStorage.clear()
    console.log('data')
    console.log(data)

    // Retrieve existing data from localStorage
    savedPosts = JSON.parse(localStorage.getItem('savedPosts')) || [];

    // Add new data to saved posts array
    savedPosts.push(data)

    // Save the updated array back to localStorage
    localStorage.setItem('savedPosts', JSON.stringify(savedPosts));

    console.log("Localstorage:")
    console.log(JSON.parse(localStorage.getItem('savedPosts')))

}

function countLabelFrequency() {

    const labelNames = ['Age', 'Gender', 'Physical', 'Race', 'Religion', 'Others'];

    labelNames.forEach((label) => {
        labelFrequency[label] = 0;
    });

    savedPosts.forEach((obj) => {
        // Iterate through the labels array of each object
        obj.labels.forEach((label) => {
            // Check if the label probability is greater than 50%
            if (parseFloat(label.probability) > 50 && label.name in labelFrequency) {
                // If it meets the conditions, increment the count
                labelFrequency[label.name]++;
            }
        });
    });

    // Print the label frequencies
    console.log(labelFrequency);

    return labelFrequency;

}

function deleteSavedPost(index) {
    // Retrieve existing data from localStorage
    savedPosts = JSON.parse(localStorage.getItem('savedPosts')) || [];

    // Remove the post at the specified index
    savedPosts.splice(index, 1);

    // Save the updated array back to localStorage
    localStorage.setItem('savedPosts', JSON.stringify(savedPosts));

    // Update the display after deletion
    updateSavedPostsDisplay();
}




