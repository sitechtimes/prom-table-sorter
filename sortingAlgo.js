const groups = [
  ["a", "b", "c", "d"],
  ["e", "f", "g", "h"],
  ["i", "j", "k", "l", "m", "n"],
  ["o", "p", "q"],
  ["r"],
  ["s"],
  ["t", "u"],
  ["v", "w", "x"],
  ["y", "z"],
];

const tables = [
  { seats: 8, occupants: [] },
  { seats: 3, occupants: [] },
  { seats: 6, occupants: [] },
  { seats: 4, occupants: [] },
  { seats: 5, occupants: [] },
];

// put the largest groups in the largest tables first
groups.sort((a, b) => b.length - a.length);
tables.sort((a, b) => b.seats - a.seats);

groups.forEach((group) => {
  if (tables[0].seats >= group.length) {
    tables[0].occupants.push(group);
    tables[0].seats -= group.length;
    tables.sort((a, b) => b.seats - a.seats);
  } else
    console.error("table configuration doesn't fit, moving to next algorithm");
});

console.log(tables);
