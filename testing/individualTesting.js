import { mainSort, rangeSort, algoFunctionOptions } from "./sortingAlgo.js";

let groupList = [
  [
    "Antonio",
    "Cole",
    "Rafael",
    "Louis",
    "Tommy",
    "Samuel",
    "Ruben",
    "Jerry",
    "Silas",
    "Noah",
    "Alan",
    "Virginia",
    "Samantha",
    "Lisa",
    "Denise",
  ],
  [
    "Cody",
    "Sean",
    "Everett",
    "Lillian",
    "Evelyn",
    "Patricia",
    "Aaliyah",
    "Ethan",
    "Brady",
    "Lance",
    "Levi",
    "Nathan",
    "Cody",
    "Katherine",
  ],
  [
    "Jackson",
    "Tyler",
    "Leo",
    "Lilly",
    "Miles",
    "Walter",
    "Janice",
    "Amy",
    "Joyce",
    "Axel",
    "Timothy",
    "Carl",
    "Christian",
    "Dominic",
  ],
  [
    "Janet",
    "Autumn",
    "Christopher",
    "Bradley",
    "Kim",
    "Kylie",
    "Amanda",
    "Stella",
  ],
  [
    "Piper",
    "Braden",
    "Richard",
    "Henry",
    "Kelly",
    "Victor",
    "Betty",
    "Marilyn",
    "Claire",
    "Diane",
    "Isabella",
    "Walter",
  ],
  [
    "Rachel",
    "Max",
    "Rodney",
    "Riley",
    "Amber",
    "Jason",
    "Sawyer",
    "Joan",
    "David",
    "Sean",
    "Blake",
    "Colin",
    "Jared",
    "Jessica",
  ],
];

const maxSeats = 15;
const minSeats = 10;

console.log(`>>>>>>>>
  Max Seats: ${maxSeats}
  Min Seats: ${minSeats}
  Groups (below):`);
console.log(groupList);
console.log("---result---");

// console.log(rangeSort(groupList, algoFunctionOptions, maxSeats, minSeats));
try {
  console.log(rangeSort(groupList, algoFunctionOptions, maxSeats, minSeats));
} catch (error) {
  console.error(error);
  alert(error.message);
}
