var xmlHttp=new XMLHttpRequest();
var url="https://cdn.jsdelivr.net/gh/KazuDon-0407/groove_coaster_score_bookmarklet@latest/genre_sort_database.csv";
/*id set*/
xmlHttp.open("GET",url,false);
xmlHttp.send();
var arr = xmlHttp.responseText.split('\n');

var res = [];
 for(var i = 0; i < arr.length; i++){
    if(arr[i] == '') break;
    res[i] = arr[i].split(',');
}

var output=document.getElementsByClassName("output");
output.innerHTML=res[0][0];
console.log(res[0][0]);