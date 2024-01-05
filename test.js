const testGroups = [
  [
    "Alice",
    "Bob",
    "Charlie",
    "David",
    "Ethan",
    "Frank",
    "George",
    "Hannah",
    "Iris",
  ],
  ["Jack", "Katie", "Liam", "Mia"],
  ["Noah", "Olivia", "Peter", "Quinn", "Rachel", "Sam"],
  ["Tom", "Uma", "Victor", "Wendy", "Xavier", "Yara", "Zane"],
  ["Abby", "Ben", "Cindy", "Dan"],
  ["Eva", "Fred", "Grace", "Harry", "Ivy"],
  ["Jake", "Kelly", "Leo", "Molly", "Nate", "Oscar"],
  ["Patty", "Quincy", "Rita", "Steve", "Tina", "Ursula", "Vince", "Walter"],
  ["Xena", "Yoshi", "Zara", "Andy", "Bella", "Carl", "Daisy"],
];

let totalNames = [];
for (let i = 0; i < testGroups.length; i++) {
  totalNames.push(testGroups[i].length);
}

console.log(totalNames.sort((a, b) => b - a)); // This will print the total number of names

const testTables = [4, 6, 8, 10, 7, 5, 8, 9, 7, 4];

console.log(testTables.sort((a, b) => b - a)); // This will print the total number of names
