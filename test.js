function get_data(){
    var xmlHttp=new XMLHttpRequest();
    var csv_url="https://kazudon-0407.github.io/groove_coaster_score_bookmarklet/genre_sort_database.csv";
    /*id set*/
    xmlHttp.open("GET",csv_url,false);
    xmlHttp.send();
    var arr = xmlHttp.responseText.split('\n');

    var res = [];
    for(var i = 0; i < arr.length; i++){
        if(arr[i] == '') break;
        res[i] = arr[i].split(',');
    }
    return res;
}

function data_sort(csv,score){
    console.log("pass");
}

var xmlHttp=new XMLHttpRequest();
    /*id set*/
    xmlHttp.open("GET","https://mypage.groovecoaster.jp/sp/json/music_list.php",false);
    xmlHttp.send(null);
    var data_s=JSON.parse(xmlHttp.responseText);
    var id=data_s.music_list.map(function(e){
        return e.music_id;
    });
    id.sort(
        function(a,b) {
          return a - b;
        }
    );
    var data_array=[];
    var xhr=[];
    var disp='<html><head><title>新規タブ</title></head><body><h1>あなたの全スコア</h1>';
    id.forEach(function(music_id,index){
        data_array[index]=new Array();
        xhr[index]=new XMLHttpRequest();
        xhr[index].open("GET","https://mypage.groovecoaster.jp/sp/json/music_detail.php?music_id="+music_id,true);
        xhr[index].onreadystatechange = function(){
            if (xhr[index].readyState === 4 && xhr[index].status === 200){
                var data=JSON.parse(xhr[index].responseText);
                const path=[data.music_detail.simple_result_data,data.music_detail.normal_result_data,data.music_detail.hard_result_data,data.music_detail.extra_result_data];
                data_array[index][0]=data.music_detail.music_title;
                var score_data;
                var diff_lng=4;
                if(!data.music_detail.ex_flag) diff_lng--;
                for(var i=0;i<diff_lng;i++){
                    (path[i]==null) ? score_data="%E6%9C%AA%E3%83%97%E3%83%AC%E3%82%A4" : score_data=path[i].score;
                    data_array[index][i+1]=score_data;
                }
                if(index==id.length-1){
                    console.log(data_array[index]);
                    var csv_array=get_data();
                    console.log(csv_array);
                    data_sort(csv_array,data_array);
                    disp+='</body></html>'
                    var nwin=window.open();
                    nwin.document.open();
                    nwin.document.write(disp);
                    nwin.document.close();
                }
            }
        };
        xhr[index].send();
    });
