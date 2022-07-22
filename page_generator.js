const animals = require('./animals.json');

const getRandomAnimal = () => {
  return animals[Math.floor(Math.random() * animals.length)];
};

const getRandomAnimals = (count) => {
  const result = [];
  for (let i = 0; i < count; i++) {
    const random = getRandomAnimal();
    result.push(random);
  }
  return result;
};

for (let i = 0; i < 100; i++) {
  const randoms = getRandomAnimals(5);
  const formatted = randoms.join('-').toLowerCase();
  const command = `hugo new ${formatted}.md`;
  console.log(command);
}
