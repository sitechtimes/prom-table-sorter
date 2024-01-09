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

/* const testTables = [
  { seats: 8, occupants: [] },
  { seats: 3, occupants: [] },
  { seats: 6, occupants: [] },
  { seats: 4, occupants: [] },
  { seats: 5, occupants: [] },
];
 */

const testTables = [4, 6, 8, 10, 7, 5, 8, 9, 7, 4];

const algoOptions = [
  {
    name: "Largest Groups --> Largest Tables (First)",
    groupSort: function (a, b) {
      return b.length - a.length;
    },
    tableSort: function (a, b) {
      return b.unoccupiedSeats - a.unoccupiedSeats;
    },
  },
  {
    name: "Largest Groups --> Smallest Tables (First)",
    groupSort: function (a, b) {
      return b.length - a.length;
    },
    tableSort: function (a, b) {
      return a.unoccupiedSeats - b.unoccupiedSeats;
    },
  },
  {
    name: "Smallest Groups --> Smallest Tables (First)",
    groupSort: function (a, b) {
      return a.length - b.length;
    },
    tableSort: function (a, b) {
      return a.unoccupiedSeats - b.unoccupiedSeats;
    },
  },
];

function sortTableSeats(groups, tables, groupSortFunc, tableSortFunc) {
  tableObjs = [];
  tables.forEach((table) => {
    tableObjs.push({
      capacity: table,
      unoccupiedSeats: table,
      occupants: [],
    });
  });
  tableObjs.sort(tableSortFunc);
  groups.sort(groupSortFunc);

  for (let i = 0; i < groups.length; i++) {
    if (tableObjs[0].unoccupiedSeats >= groups[i].length) {
      tableObjs[0].occupants.push(groups[i]);
      tableObjs[0].unoccupiedSeats -= groups[i].length;
      tableObjs.sort(tableSortFunc);
    } else {
      console.log("table configuration doesn't fit, moving to next algorithm");
      return null;
    }
  }
  return tableObjs;
}

function mainSort(mainGroups, mainTables, mainAlgoOptions) {
  let result = null;
  for (let i = 0; i < algoOptions.length; i++) {
    result = sortTableSeats(
      mainGroups,
      mainTables,
      mainAlgoOptions[i].groupSort,
      mainAlgoOptions[i].tableSort
    );
    if (result != null) break;
  }
  return result;
}

// test sorting function
console.log(mainSort(testGroups, testTables, algoOptions));
