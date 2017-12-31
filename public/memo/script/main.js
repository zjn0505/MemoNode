function postMemo(oFormElement) {
  var http = new createCORSRequest(oFormElement.method, oFormElement.action);
  http.open(oFormElement.method, oFormElement.action, true);
  http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  http.onreadystatechange = function() {
    if(http.readyState == 4 && http.status == 200) {
        var json = JSON.parse(http.response);
        if (json.result == 200) {
          var alertSuccess = document.getElementById("push_success");
          alertSuccess.innerHTML = "<strong>Success!</strong> You have created a memo with id <span style='font-family: monaco, Consolas;'><a href='https://pullsh.me/"+json.memo._id+"'>"+json.memo._id+"</a></span>.";
          alertSuccess.style.display = "inherit"
          saveToHistory(json);
        }
    }
  }
  var data = new FormData(oFormElement);
  http.send(urlencodeFormData(data));
  return false;
}

function readMemo(oFormElement) {
  var host = oFormElement.action + "?memoId=" + oFormElement[0].value;
  var http = new createCORSRequest(oFormElement.method, host);
  http.open(oFormElement.method, host, true);
  http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  http.onreadystatechange = function() {
    if(http.readyState == 4 && http.status == 200) {
        var json = JSON.parse(http.response);
        if (json.result == 200) {
          var modal = document.getElementById("myModal");
          modal.style.display = "block";
          $('#modal-title').html("Memo Id : <span style='font-family: monaco, Consolas;'><strong>" + json.memo._id + "</strong></span>");
          $('#modal-content').html("<p>"+processText(json.memo.msg)+"</p>");
          $('#myBtn').click();
          saveToHistory(json);
        }
    }
  }
  http.send();
  return false;
}

function copyToClipboard(element) {
  var $temp = $("<input>");
  $("body").append($temp);
  $temp.val($(element).text()).select();
  document.execCommand("copy");
  $temp.remove();
}

function createCORSRequest(method, url) {
  var xhr = new XMLHttpRequest();
  if ("withCredentials" in xhr) {
    // XHR for Chrome/Firefox/Opera/Safari.
    xhr.open(method, url, true);
  } else if (typeof XDomainRequest != "undefined") {
    // XDomainRequest for IE.
    xhr = new XDomainRequest();
    xhr.open(method, url);
  } else {
    // CORS not supported.
    xhr = null;
    console.log("not support CORS");
  }
  return xhr;
}

function urlencodeFormData(fd) {
    var s = '';
    function encode(s){ return encodeURIComponent(s).replace(/%20/g,'+'); }
  for(var pair of fd.entries()){
      if(typeof pair[1]=='string'){
          s += (s?'&':'') + encode(pair[0])+'='+encode(pair[1]);
      }
  }
  return s;
}

function saveToHistory(json) {
  var id = json.memo._id;
  var hisObject = JSON.parse(localStorage.getItem("history"));
  if (hisObject == null || hisObject == undefined) {
    hisObject = {};
  }
  if (hisObject[id]) {
    delete hisObject[id]; 
  }
  hisObject[id] = json;
  localStorage.setItem("history", JSON.stringify(hisObject));
  rebuildTable(hisObject);
}

function rebuildTable() {
  var json = JSON.parse(localStorage.getItem("history"));
  $("#table-his tbody tr").remove();
  for (var key in json) {
    if (json.hasOwnProperty(key)) {
      var row = document.getElementById("table-his").getElementsByTagName("tbody")[0].insertRow(0);
      var cellId = row.insertCell(0);
      var cellContent = row.insertCell(1);
      cellId.innerHTML = "<span style='font-family: monaco, Consolas;'><a href='https://pullsh.me/" + json[key].memo._id + "'>" + json[key].memo._id + "</a></span>";
      cellContent.innerHTML = processText(json[key].memo.msg);
      
    }
  }
}

function processText(raw) {
  var html = raw.replace(/\r?\n/g, "<br />");
  return Autolinker.link(html);
}

window.onclick = function(event) {
  var modal = document.getElementById('myModal');
  if (event.target == modal) {
    modal.style.display = "none";
  }
}