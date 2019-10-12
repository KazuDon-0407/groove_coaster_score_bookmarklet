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

var disp="";
var diff_str=["simple","normal","hard","extra"];
var genre_str=["アニメ・ポップス","ボーカロイド","東方アレンジ","音楽ゲーム","ゲーム","バラエティ","オリジナル"];
var god_count=[0,0];

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

/*配列の初期化*/
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


function get_id(){
    var xmlHttp=new XMLHttpRequest();
    /*id set*/
    xmlHttp.open("GET","https://mypage.groovecoaster.jp/sp/json/music_list.php",true);
    xmlHttp.timeout=3000;
    xmlHttp.onreadystatechange = function(){
        console.log("readyState:"+xmlHttp.readyState);
        console.log("status:"+xmlHttp.status);
        if (xmlHttp.readyState === 4 && xmlHttp.status === 200){
            var data_s=JSON.parse(xmlHttp.responseText);
            var play_id=data_s.music_list.map(function(e){
                return e.music_id;
            });
            play_id.sort(
                function(a,b) {
                    return a - b;
                }
            );
            get_score(play_id);
        }
        else if (xmlHttp.readyState === 4 && xmlHttp.status === 0){
            alert("通信エラー\nマイページにログインして実行してください");
        }
    };
    xmlHttp.send(null);
}

function get_score(id){
    var data_array=[];
    var xhr=[];
    disp+='<html><head><title>新規タブ</title></head><body><h1>あなたの全スコア</h1>';
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
                    (path[i]==null) ? score_data=0 : score_data=path[i].score;
                    data_array[music_id][i+1]=score_data;
                }
                if(index==id.length-1){
                    console.log(data_array);
                    var csv_array=get_csv();
                    console.log(csv_array);
                    data_search(csv_array,data_array);
                    score_detail();
                    disp+='</body></html>'
                    var nwin=window.open();
                    //nwin.document.open();
                    nwin.document.write(disp);
                    //nwin.document.close();
                    console.log("err");
                }
            }
        };
        xhr[music_id].send();
    });
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
    disp+='<button onclick="copyToClipboard()">Copy Score</button>';
    disp+='<div id="CopyTarget">';
    var current_genre=-1;
    disp+='<p>';
    for(var i=0;i<csv.length;i++){
        if(current_genre!=csv[i][genre]){
            current_genre=csv[i][genre];
            disp+='<h2>'+genre_str[current_genre]+'</h2>';
        }
        var current_id=csv[i][csv_id];
        if(score[current_id]!=undefined){
            var s_diff=csv[i][simple_diff];
            var n_diff=csv[i][normal_diff];
            var h_diff=csv[i][hard_diff];
            var e_diff=csv[i][extra_diff];
            var s_score=score[current_id][simple_score];
            var n_score=score[current_id][normal_score];
            var h_score=score[current_id][hard_score];
            disp+=csv[i][title]+",";
            
            genre_total_score[current_genre]+=s_score;
            simple_total_score[s_diff-1]+=s_score;
            if(s_score>0) {
                simple_num[s_diff-1]++;
                genre_num[current_genre]++;
            }
            disp+=s_score+",";
            
            genre_total_score[current_genre]+=n_score;
            normal_total_score[n_diff-1]+=n_score;
            if(n_score>0) {
                normal_num[n_diff-1]++;
                genre_num[current_genre]++;
            }
            disp+=n_score+",";
            
            genre_total_score[current_genre]+=h_score;
            hard_total_score[h_diff-1]+=h_score;
            if(h_score>0) {
                hard_num[h_diff-1]++;
                genre_num[current_genre]++;
            }
            disp+=h_score;
            
            if(s_score+n_score+h_score==3000000) god_count[0]++;
            
            if(csv[i][extra_diff]>=1){
                var e_score=score[current_id][extra_score];
                genre_total_score[current_genre]+=e_score;
                extra_total_score[e_diff-1]+=e_score;
                if(e_score>0) {
                    extra_num[e_diff-1]++;
                    genre_num[current_genre]++;
                }
                disp+=","+e_score;
                
                if(s_score+n_score+h_score+e_score==4000000) god_count[1]++;
            }
            disp+='<br>';
        }
       
    }
    disp+='</p>';
    disp+='</div>';
    disp+='<script>';
    disp+='function copyToClipboard(){';
    disp+='var copyTarget = document.getElementById("CopyTarget");';
    disp+='var text = document.createElement("textarea");';
    disp+='text.value = copyTarget.innerText;';
    disp+='document.body.appendChild(text);';
    disp+='text.select();';
    disp+='document.execCommand("copy");';
    disp+='alert("クリップボードにコピーしました。");';
    disp+='text.parentElement.removeChild(text);}';
    disp+='</script>'; 
    
}


function score_detail(){
    disp+='<h1>スコア詳細</h1>';
    disp+='<h2>ジャンル別詳細</h2>';
    disp+='<table style="padding:15px">';
    disp+='<tr align="center"><th>ジャンル</th><th>トータルスコア</th><th>平均スコア</th></tr>';
    for(var i=0;i<genre_str.length;i++){
        disp+='<tr align="center">';
        disp+='<td>'+genre_str[i]+'</td>';
        disp+='<td>'+genre_total_score[i]+'</td>';
        disp+='<td>'+Math.floor(genre_total_score[i]/genre_num[i])+'</td>';
        disp+='</tr>';
    }
    disp+='</table>';
    
    disp+='<h2>難易度別詳細</h2>';
    disp+='<h3>simple</h3>';
    disp+='<table style="padding:15px">';
    disp+='<tr align="center"><th>難易度</th><th>トータルスコア</th><th>平均スコア</th></tr>';
    for(var i=0;i<diff_rank;i++){
        if(simple_num[i]>0){
            disp+='<tr align="center">';
            disp+='<td>simple'+(i+1)+'</td>';
            disp+='<td>'+simple_total_score[i]+'</td>';
            disp+='<td>'+Math.floor(simple_total_score[i]/simple_num[i])+'</td>';
            disp+='</tr>';
        }
    }
    disp+='</table>';
    
    disp+='<h3>normal</h3>';
    disp+='<table style="padding:15px">';
    disp+='<tr align="center"><th>難易度</th><th>トータルスコア</th><th>平均スコア</th></tr>';
    for(var i=0;i<diff_rank;i++){
        if(normal_num[i]>0){
            disp+='<tr align="center">';
            disp+='<td>normal'+(i+1)+'</td>';
            disp+='<td>'+normal_total_score[i]+'</td>';
            disp+='<td>'+Math.floor(normal_total_score[i]/normal_num[i])+'</td>';
            disp+='</tr>';
        }
    }
    disp+='</table>';
    
    disp+='<h3>hard</h3>';
    disp+='<table style="padding:15px">';
    disp+='<tr align="center"><th>難易度</th><th>トータルスコア</th><th>平均スコア</th></tr>';
    for(var i=0;i<diff_rank;i++){
        if(hard_num[i]>0){
            disp+='<tr align="center">';
            disp+='<td>hard'+(i+1)+'</td>';
            disp+='<td>'+hard_total_score[i]+'</td>';
            disp+='<td>'+Math.floor(hard_total_score[i]/hard_num[i])+'</td>';
            disp+='</tr>';
        }
    }
    disp+='</table>';
    
    disp+='<h3>extra</h3>';
    disp+='<table style="padding:15px">';
    disp+='<tr align="center"><th>難易度</th><th>トータルスコア</th><th>平均スコア</th></tr>';
    for(var i=0;i<diff_rank;i++){
        if(extra_num[i]>0){
            disp+='<tr align="center">';
            disp+='<td>extra'+(i+1)+'</td>';
            disp+='<td>'+extra_total_score[i]+'</td>';
            disp+='<td>'+Math.floor(extra_total_score[i]/extra_num[i])+'</td>';
            disp+='</tr>';
        }
    }
    disp+='</table>';
    
    disp+='<h2>300万、400万数</h2>';
    disp+='<p>300万:'+god_count[0]+'曲</p>';
    disp+='<p>400万:'+god_count[1]+'曲</p>';
}

get_id();
