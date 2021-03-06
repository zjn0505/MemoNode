function postMemo(oFormElement) {
  if (oFormElement.elements.msg.value == "") {
	  return false;
  }
  var http = new createCORSRequest(oFormElement.method, oFormElement.action);
  http.open(oFormElement.method, oFormElement.action, true);
  http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  http.onreadystatechange = function() {
    if(http.readyState == 4) {
      if (http.status == 200) {
        var json = JSON.parse(http.response);
        if (json.result == 200) {
          var alertSuccess = document.getElementById("push_success");
          alertSuccess.innerHTML = "<strong>Success!</strong> You have created a memo with id <span style='font-family: monaco, Consolas, monospace;'><a target='_blank' href='https://pullsh.me/"+json.memo._id+"'>"+json.memo._id+"</a></span>.";
		  $(".alert-success").fadeIn(1000);
          alertSuccess.addEventListener('click', function(e) {
            var target = e.target || e.srcElement;
            if (target.tagName != "A") {
              copyToClipboard("https://pullsh.me/" + json.memo._id, "Memo link copied!");
			  setTimeout(function() {
				$(".alert-success").fadeOut(1000);
			  }, 1000);
            }
          });
          saveToHistory(json);
        }
      }
      $("#pleaseWaitDialog").modal('hide');
    }
  }
  http.ontimeout = function(e) {
    $("#pleaseWaitDialog").modal('hide');
    // show error here
  }
  var data = new FormData(oFormElement);
  http.send(urlencodeFormData(data));
  $("#pleaseWaitDialog").modal();
  $("#progress_header").text("Creating a Push memo");
  return false;
}

function readMemo(oFormElement) {
  if (oFormElement.elements.memoId.value == "") {
	return false;
  }
  var host = oFormElement.action + "?memoId=" + oFormElement[0].value;
  var http = new createCORSRequest(oFormElement.method, host);
  http.open(oFormElement.method, host, true);
  http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  http.onreadystatechange = function() {
    if(http.readyState == 4) {
      if (http.status == 200) {
        var json = JSON.parse(http.response);
        if (json.result == 200) {
          var modal = document.getElementById("myModal");
          modal.style.display = "block";
          $('#modal-title').html("Memo Id : <span style='font-family: monaco, Consolas, monospace;'><strong>" + json.memo._id + "</strong></span>");
          $('#modal-content').html("<p>"+processText(json.memo.msg)+"</p>");
          $('#myBtn').click();
          saveToHistory(json);
        }
      }
      $("#pleaseWaitDialog").modal('hide');
    }
  }
  http.send();
  http.ontimeout = function(e) {
    $("#pleaseWaitDialog").modal('hide');
    // show error here
  }
  $("#pleaseWaitDialog").modal();
  $("#progress_header").text("Pulling a memo");
  return false;
}

function copyToClipboard(text, toast) {
  var $temp = $("<input>");
  $("body").append($temp);
  $temp.val(text).select();
  document.execCommand("copy");
  $temp.remove();
  if (toast != null && toast != undefined && toast != "") {
    $.toast({
      text: toast,
      hideAfter: 1000,
      loader:false,
      allowToastClose: false,
      position: 'bottom-center',
      textAlign:'center'
    });
  }
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
      cellId.innerHTML = "<span style='font-family: monaco, Consolas, monospace;'><a href='https://pullsh.me/" + json[key].memo._id + "'>" + json[key].memo._id + "</a></span>";
      cellContent.innerHTML = processText(json[key].memo.msg);
      cellContent.addEventListener('click', function(e) {
        var target = e.target || e.srcElement;
        if (target.tagName != "A") {
          copyToClipboard(e.currentTarget.textContent, "Memo copied!");
        }
      });
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