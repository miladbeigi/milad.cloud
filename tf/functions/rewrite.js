function handler(event) {
  var request = event.request;
  var uri = request.uri;

  if (uri === "/toolbelt") {
    return {
      statusCode: 302,
      statusDescription: "Found",
      headers: {
        location: { value: "https://raw.githubusercontent.com/miladbeigi/portable-toolbelt/main/boot.sh" },
        "cache-control": { value: "no-cache" },
      },
    };
  }

  if (uri.endsWith("/")) {
    request.uri = uri + "index.html";
  } else if (uri.split("/").pop().indexOf(".") === -1) {
    return {
      statusCode: 301,
      statusDescription: "Moved Permanently",
      headers: { location: { value: uri + "/" } },
    };
  }

  return request;
}
