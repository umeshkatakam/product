let url = "http://localhost:8000/api/product_lists";
var result = [];

export function getData() {
  fetch(url).then(function (response) {
    response.text().then(function (text) {
      result.push(text);
    });
  });
  return result;
}
