<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Activity Logger</title>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/tailwindcss@3.0.23/dist/tailwind.min.css"></script>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
        }
        .input-error {
            color: red;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="text-3xl font-bold mb-5">Activity Logger</h1>
        
        <!-- Activity input -->
        <div>
            <label for="activity-input" class="block text-lg">What did you do today?</label>
            <input type="text" id="activity-input" class="border p-2 w-full mb-4">
            <button id="save-btn" class="bg-blue-500 text-white p-2 rounded" disabled>Save Activity</button>
            <div id="error-message" class="input-error mt-2"></div>
        </div>

        <!-- Weekly log -->
        <div class="mt-8">
            <h2 class="text-2xl font-semibold">Weekly Log</h2>
            <div id="weekly-log"></div>
        </div>

        <!-- Admin access -->
        <div class="mt-8">
            <h2 class="text-2xl font-semibold">Admin Access</h2>
            <label for="admin-code" class="block text-lg">Admin Code</label>
            <input type="text" id="admin-code" class="border p-2 mb-4">
            <button id="admin-code-btn" class="bg-green-500 text-white p-2 rounded">Submit Admin Code</button>
        </div>
    </div>

    <script>
        // Offensive words list (case-insensitive)
        const offensiveWords = ['fword', 'nword', 'shit', 'bitch', 'asshole'];

        // Get the current day (0-6, Sunday-Saturday)
        function getCurrentDay() {
            const today = new Date();
            return today.getDay(); // 0 is Sunday, 6 is Saturday
        }

        // Check if the current time is between 7 PM and 11 PM
        function isAllowedTime() {
            const currentTime = new Date();
            const hours = currentTime.getHours();
            return hours >= 19 && hours < 23; // Allow between 7 PM (19) and 11 PM (23)
        }

        // Check if the input contains offensive words (case-insensitive)
        function containsOffensiveWords(activity) {
            const lowerCaseActivity = activity.toLowerCase();
            return offensiveWords.some(word => lowerCaseActivity.includes(word.toLowerCase()));
        }

        // Function to update access time based on time or admin status
        function updateAccessTime(isAdmin) {
            const isWithinAllowedTime = isAllowedTime() || isAdmin;
            if (!isWithinAllowedTime) {
                $('#activity-input').prop('disabled', true);
                $('#save-btn').prop('disabled', true);
                $('#error-message').text("You can only log activities between 7 PM and 11 PM unless you're an admin.");
            } else {
                $('#activity-input').prop('disabled', false);
                $('#save-btn').prop('disabled', false);
                $('#error-message').text('');
            }
        }

        // Function to save activity to localStorage
        function saveActivity() {
            const activity = $('#activity-input').val().trim();
            if (!activity) {
                $('#error-message').text("Please enter an activity before saving.");
                return;
            }

            // Check for offensive words
            if (containsOffensiveWords(activity)) {
                $('#error-message').text("This activity contains offensive language. Please enter a different activity.");
                return;
            }

            // Get the current day (0-6, Sunday-Saturday)
            const currentDay = getCurrentDay();

            // Get the existing data for the week
            let weeklyActivities = JSON.parse(localStorage.getItem('weeklyActivities')) || {};

            // Add the activity for today (7 PM to 11 PM)
            if (!weeklyActivities[currentDay]) {
                weeklyActivities[currentDay] = [];
            }
            weeklyActivities[currentDay].push(activity);

            // Save it back to localStorage
            localStorage.setItem('weeklyActivities', JSON.stringify(weeklyActivities));

            // Clear the input and update the log
            $('#activity-input').val('');
            $('#error-message').text('');
            displayWeeklyLog();
        }

        // Function to display the weekly activities log
        function displayWeeklyLog() {
            // Get the stored weekly activities
            let weeklyActivities = JSON.parse(localStorage.getItem('weeklyActivities')) || {};

            // Clear current log
            $('#weekly-log').empty();

            // Display the activities for each day
            for (let i = 0; i < 7; i++) {
                const dayName = getDayName(i);
                const activities = weeklyActivities[i] || [];
                const activityList = activities.map(activity => `<li class="text-lg">${activity}</li>`).join('');

                $('#weekly-log').append(`
                    <div class="border p-4 rounded-lg shadow-md bg-white">
                        <h3 class="text-xl font-semibold">${dayName}</h3>
                        <ul class="list-disc pl-5">
                            ${activityList ? activityList : '<li class="text-gray-500">No activities logged yet.</li>'}
                        </ul>
                    </div>
                `);
            }
        }

        // Helper function to get day names
        function getDayName(dayIndex) {
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            return days[dayIndex];
        }

        // Function to check if the user is an admin
        function checkAdminAccess() {
            const adminCode = $('#admin-code').val().trim();
            return adminCode === '555'; // Admin code is hardcoded as "555"
        }

        // Event listener for submitting the admin code
        $('#admin-code-btn').on('click', function () {
            const isAdmin = checkAdminAccess();

            if (isAdmin) {
                // Admin entered correct code, update access time to bypass restrictions
                updateAccessTime(true); // Allow admin to log activities anytime
                $('#error-message').text("You are now logged in as an admin.");
            } else {
                $('#error-message').text("Invalid admin code. Please try again.");
            }
        });

        // Event listener for saving activity
        $('#save-btn').on('click', function () {
            const isAdmin = checkAdminAccess();
            updateAccessTime(isAdmin);

            if (isAdmin || isAllowedTime()) {
                saveActivity();
            }
        });

        // Display the weekly log and update access time on page load
        const isAdmin = checkAdminAccess();
        updateAccessTime(isAdmin);
        displayWeeklyLog();
    </script>
</body>
</html>
