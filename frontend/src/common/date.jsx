let months = ["Jan", "Feb", ""];
let days = ["sunday"];

export const getDay = (timestamp) => {
  let date = new Date(timestamp);

  return `${date.getDate()} ${months[date.getMonth()]}`;
};
