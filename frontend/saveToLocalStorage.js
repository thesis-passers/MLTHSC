const saveBtn = document.getElementById("save-btn");

let savedPosts = [];
let currentPost = null;
let labelFrequency = {};

let currentPage = 1;
const postsPerPage = 6;
const columns = 2;

if (!currentPost) saveBtn.disabled = true;

console.log(`current post: ${currentPost}`);

function inputByBatch() {
    // get txt file
    // read lines
    // for line in txt
    // fetch labels
    // saveToLocalStorage
    // updateSavedPostDisplay
}

/** Save Button */
saveBtn.addEventListener("click", function () {
    console.log(`Num saved posts: ${savedPosts.length}`);
    console.log("Saving post...");
    saveToLocalStorage(currentPost);
    updateSavedPostsDisplay();

    // Scroll down to the saved posts container
    const savedPostsContainer = document.getElementById("saved-post");
    savedPostsContainer.scrollIntoView({ behavior: "smooth" });
    const totalPages = Math.ceil(savedPosts.length / postsPerPage);

    currentPage = totalPages;
    displayPage(1);
    updateActivePageButton();

    saveBtn.disabled = true;
    Toast("Post saved successfully!");
});

/** Display Saved Hate Speech */
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

/** Save to storage */
function saveToLocalStorage(data) {
    // Retrieve existing data from localStorage
    savedPosts = JSON.parse(localStorage.getItem("savedPosts")) || [];

    // Add new data to saved posts array
    savedPosts.unshift(data);

    // Save the updated array back to localStorage
    localStorage.setItem("savedPosts", JSON.stringify(savedPosts));

    // Update the display with the current filter
    displayPage(currentPage, getSelectedLabel());
    
    console.log("Localstorage:");
    console.log(JSON.parse(localStorage.getItem("savedPosts")));
}


/** Update Saved Posts */
function updateSavedPostsDisplay() {
    savedPosts = JSON.parse(localStorage.getItem("savedPosts")) || [];
    displayPage(1);
    createPaginationControls();

    console.log("savedPosts");
    console.log(savedPosts);

    labelFrequency = countLabelFrequency();

    // Clear previous chart data
    if (window.myPieChart) {
        window.myPieChart.destroy();
    }

    // Update the chart with new data
    createPieChart();
}

/** Delete Saved Post */
function deleteSavedPost(index) {
    savedPosts = JSON.parse(localStorage.getItem("savedPosts")) || [];
    savedPosts.splice(index, 1);
    localStorage.setItem("savedPosts", JSON.stringify(savedPosts));

    displayPage(currentPage, getSelectedLabel());
}


const filterButtons = document.querySelectorAll('.filterButton');

filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
        filterButtons.forEach((btn) => btn.classList.remove('active'));

        button.classList.add('active');

        const selectedLabel = button.getAttribute('data-label');
        displayPage(1);
        createPaginationControls();

        console.log('Selected Label:', selectedLabel);
    });
});












document.addEventListener("DOMContentLoaded", (event) => {
    updateSavedPostsDisplay();
    createPieChart();
});

/** Label Frequency */
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

function displayPage(page, selectedLabel = "") {
    const startIndex = (page - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;

    let postsToShow;

    if (selectedLabel === "") {
        // If "all labels" is selected, show all posts without pagination
        postsToShow = savedPosts;
    } else {
        // Filter posts based on the selected label
        postsToShow = filterPosts(savedPosts, selectedLabel);
    }

    // Slice the posts to display based on the pagination settings
    const paginatedPosts = postsToShow.slice(startIndex, endIndex);

    // Clear existing posts
    const savedPostsContainer = document.getElementById("savedPosts");
    savedPostsContainer.innerHTML = "";

    // Add posts for this page in a grid format
    paginatedPosts.forEach((post, index) => {
        const postDisplayElement = PostDisplay(post, index);
        savedPostsContainer.appendChild(postDisplayElement);
    });
}

function filterPosts(posts, selectedLabel) {
    if (selectedLabel === "") {
        // No label selected, return all posts
        return posts;
    }

    // Filter posts based on the selected label
    return posts.filter((post) =>
        post.labels.some(
            (label) =>
                label.name.toLowerCase() === selectedLabel && parseFloat(label.probability) > 50
        )
    );
}

const postFilterButtons = document.querySelectorAll('.filterButton');

postFilterButtons.forEach((button) => {
    button.addEventListener('click', () => {
        // Remove the "active" class from all buttons
        postFilterButtons.forEach((btn) => btn.classList.remove('active'));

        // Add the "active" class to the clicked button
        button.classList.add('active');

        // Trigger filtering based on the selected label
        const selectedLabel = button.getAttribute('data-label');
        displayFilteredPosts(selectedLabel);
    });
});

function displayFilteredPosts(selectedLabel) {
    const savedPostsContainer = document.getElementById('savedPosts');
    savedPostsContainer.innerHTML = '';

    savedPosts.forEach((post, index) => {
        // Check if the post has the selected label
        const hasSelectedLabel = selectedLabel === '' || post.labels.some((label) => label.name.toLowerCase() === selectedLabel && parseFloat(label.probability) > 50);

        if (hasSelectedLabel) {
            const postElement = PostDisplay(post, index);
            savedPostsContainer.appendChild(postElement);
        }
    });
}


/** For Page Controls */
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
            const selectedLabel = getSelectedLabel(); // Fetch the selected label
            displayPage(i, selectedLabel); // Pass the selected label to displayPage
            updateActivePageButton();
        });

        paginationControls.appendChild(pageButton);
    }
}

// Fetch the selected label based on the active filter button
function getSelectedLabel() {
    const activeFilterButton = document.querySelector(".filterButton.active");
    return activeFilterButton ? activeFilterButton.getAttribute("data-label") : "";
}
/** Update Page */
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

/** For Chart */
function createPieChart() {
    const ctx = document.getElementById("labelPieChart").getContext("2d");

    // Set the width and height of the chart
    ctx.canvas.width = 400; // Width in pixels
    ctx.canvas.height = 300; // Height in pixels

    // Create an array of data for the pie chart
    const labelNames = [
        "Age",
        "Gender",
        "Physical",
        "Race",
        "Religion",
        "Others",
    ];
    const data = labelNames.map((label) => labelFrequency[label]);

    // Calculate the total count of labels
    const totalCount = data.reduce((acc, count) => acc + count, 0);

    // Calculate the percentage for each label
    const percentages = data.map((count) =>
        ((count / totalCount) * 100).toFixed(2)
    );

    // Define colors for the chart segments
    const backgroundColors = [
        "#fe5555", // Age
        "#f09f2e", // Gender
        "#ffcc00", // Physical
        "#2bce9a", // Race
        "#424bfc", // Religion
        "#65696c", // Others
    ];

    // Create the pie chart using Chart.js
    window.myPieChart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: labelNames,
            datasets: [
                {
                    label: " Count",
                    data: data,
                    backgroundColor: backgroundColors,
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    enabled: false,
                    position: "bottom",
                    labels: {
                        boxWidth: 40,
                        padding: 20,
                    },
                },
                title: {
                    display: true,
                    text: "Frequency of Labels",
                    padding: 10,
                },
                emptyDoughnut: {
                    color: "gray",
                    width: 2,
                    radiusDecrease: 20,
                },
            },
        },
    });

    // Legend
    const legendContainer = document.getElementById("legendContainer");
    legendContainer.innerHTML = "";

    // Post Count
    const savedPostsCount = document.createElement("div");
    savedPostsCount.classList.add("saved-posts-count");
    savedPostsCount.innerHTML = `
      <div class="label-frequency">Saved Hate Speech Posts</div>
      <div class="count">${savedPosts.length}</div>
    `;
    legendContainer.appendChild(savedPostsCount);

    labelNames.forEach((label, index) => {
        const legendItem = document.createElement("div");
        legendItem.style.borderTop = "7px solid" + backgroundColors[index];
        legendItem.classList.add("legend-item");

        // Labels Count
        const labelName = document.createElement("div");
        labelName.innerHTML = `
      <div class="label-frequency">${label}</div>
      <div class="count">${data[index]} <span class="label-percentage">(${percentages[index]}<sup>%</sup><span>)</div>
    `;
        legendItem.appendChild(labelName);

        legendContainer.appendChild(legendItem);
    });
}
