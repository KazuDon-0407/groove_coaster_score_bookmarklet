const title=0;
const csv_id=1;
const genre=2;
const simple_diff=3;
const normal_diff=4;
const hard_diff=5;
const extra_diff=6;

const simple_score=1;
const normal_score=2;
const hard_score=3;
const extra_score=4;

const diff_rank=15;

var genre_str=["アニメ・ポップス","ボーカロイド","東方アレンジ","音楽ゲーム","ゲーム","バラエティ","オリジナル"];

var genre_total_score=new Array(genre_str.length);
var genre_num=new Array(genre_str.length);
var simple_total_score=new Array(diff_rank);
var simple_num=new Array(diff_rank);
var normal_total_score=new Array(diff_rank);
var normal_num=new Array(diff_rank);
var hard_total_score=new Array(diff_rank);
var hard_num=new Array(diff_rank);
var extra_total_score=new Array(diff_rank);
var extra_num=new Array(diff_rank);

for(var i=0;i<genre_str.length;i++){
    genre_total_score[i]=0;
    genre_num[i]=0;
}
for(var i=0;i<diff_rank;i++){
    simple_total_score[i]=0;
    simple_num[i]=0;
    normal_total_score[i]=0;
    normal_num[i]=0;
    hard_total_score[i]=0;
    hard_num[i]=0;
    extra_total_score[i]=0;
    extra_num[i]=0;
}

function get_csv(){
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

function data_search(csv,score){
    var current_genre=-1;
    for(var i=0;i<csv.length;i++){
        if(current_genre!=csv[i][genre]){
            current_genre=csv[i][genre];
            disp+='<h2>'+genre_str[current_genre]+'</h2>';
        }
        var current_id=csv[i][csv_id];
        if(score[current_id]!=undefined){
            disp+='<p>'+csv[i][title]+",";
            disp+=score[current_id][simple_score]+",";
            disp+=score[current_id][normal_score]+",";
            disp+=score[current_id][hard_score];
            if(csv[i][extra_diff]>=1) disp+=","+score[current_id][extra_score];
            disp+='</p>';
        }
    }
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
        /*score dataは添字music_idに格納*/
        data_array[music_id]=new Array();
        xhr[music_id]=new XMLHttpRequest();
        xhr[music_id].open("GET","https://mypage.groovecoaster.jp/sp/json/music_detail.php?music_id="+music_id,true);
        xhr[music_id].onreadystatechange = function(){
            if (xhr[music_id].readyState === 4 && xhr[music_id].status === 200){
                var data=JSON.parse(xhr[music_id].responseText);
                const path=[data.music_detail.simple_result_data,data.music_detail.normal_result_data,data.music_detail.hard_result_data,data.music_detail.extra_result_data];
                data_array[music_id][0]=data.music_detail.music_title;
                var score_data;
                var diff_lng=4;
                if(!data.music_detail.ex_flag) diff_lng--;
                for(var i=0;i<diff_lng;i++){
                    (path[i]==null) ? score_data="%E6%9C%AA%E3%83%97%E3%83%AC%E3%82%A4" : score_data=path[i].score;
                    data_array[music_id][i+1]=score_data;
                }
                if(index==id.length-1){
                    console.log(data_array);
                    var csv_array=get_csv();
                    console.log(csv_array);
                    data_search(csv_array,data_array);
                    disp+='</body></html>'
                    var nwin=window.open();
                    nwin.document.open();
                    nwin.document.write(disp);
                    nwin.document.close();
                    console.log("err");
                }
            }
        };
        xhr[music_id].send();
    });
