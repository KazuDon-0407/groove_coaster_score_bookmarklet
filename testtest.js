const title=0;
const csv_id=1;
const genre=2;
const lower_diff=3;
const lower_score=1;

const diff_rank=15;

var disp="";
var diff_str=["simple","normal","hard","extra"];
var genre_str=["アニメ・ポップス","ボーカロイド","東方アレンジ","音楽ゲーム","ゲーム","バラエティ","オリジナル"];
var god_count=[0,0];

var genre_total_score=new Array(genre_str.length);
var genre_num=new Array(genre_str.length);
var diff_total_score=new Array(diff_rank);
var diff_num=new Array(diff_rank);


/*配列の初期化*/
for(var i=0;i<genre_str.length;i++){
    genre_total_score[i]=0;
    genre_num[i]=0;
}

/*diff[rank][diff]*/

for(var i=0;i<diff_rank;i++){
    diff_total_score[i]=new Array(diff_str.length);
    diff_num[i]=new Array(diff_str.length);
    for(var j=0;j<diff_str.length;j++){
        diff_total_score[i][j]=0;
        diff_num[i][j]=0;
    }
}


const timeout=10000;

function get_id(){
    var xmlHttp=new XMLHttpRequest();
    /*id set*/
    xmlHttp.open("GET","https://mypage.groovecoaster.jp/sp/json/music_list.php",true);
    xmlHttp.timeout=timeout;
    xmlHttp.onreadystatechange = function(){
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
            alert("OKを押すとデータ取り込みを開始します");
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
    disp+='<html><head><title>スコア</title><script>function copyToClipboard(){var copyTarget = document.getElementById("CopyTarget");var text = document.createElement("textarea");text.value = copyTarget.innerText;document.body.appendChild(text);text.select();document.execCommand("copy");alert("クリップボードにコピーしました。");text.parentElement.removeChild(text);}</script></head><body><h1>あなたの全スコア</h1>';
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
                    //console.log(data_array);
                    get_csv(data_array);
                }
            }
        };
        xhr[music_id].send(null);
    });
}

function get_csv(data){
    var xmlHttp=new XMLHttpRequest();
    var csv_url="https://kazudon-0407.github.io/groove_coaster_score_bookmarklet/genre_sort_database.csv";
    /*id set*/
    xmlHttp.open("GET",csv_url,true);
    xmlHttp.timeout=timeout;
    xmlHttp.onreadystatechange = function(){
        if (xmlHttp.readyState === 4 && xmlHttp.status === 200){
            var arr = xmlHttp.responseText.split('\n');

            var res = [];
            for(var i = 0; i < arr.length; i++){
                if(arr[i] == '') break;
                res[i] = arr[i].split(',');
            }
            data_search(res,data);
        }
        else if (xmlHttp.readyState === 4 && xmlHttp.status === 0){
            alert("CSVデータの取得に失敗しました");
        }
    };
    xmlHttp.send(null);
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
            var all_diff=new Array(diff_str.length);
            var all_score=new Array(diff_str.length);
            disp+=csv[i][title];
            for(var j=0;j<diff_str.length;j++){
                all_diff[j]=csv[i][lower_diff+j];
                all_score[j]=score[current_id][lower_score+j];            
                
                disp+=","+all_score[j];
                if(csv[i][lower_diff+j]<1){
                    continue;
                }
                
                genre_total_score[current_genre]+=all_score[j];
                diff_total_score[all_diff[j]-1]+=all_score[j];
                
                diff_num[all_diff[j]-1][j]++;
                genre_num[current_genre]++;
            }            

            if((all_score[0]+all_score[1]+all_score[2])==3000000) god_count[0]++;  
            if((all_score[0]+all_score[1]+all_score[2]+all_score[3])==4000000) god_count[1]++;
          }
            disp+='<br>';
       }
       
    }
    disp+='</p>';
    disp+='</div>';
    
    /*Clipboard Tag*/
    
    score_detail();
    
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
    
    for(var i=0;i<diff_str.length;i++){
        disp+='<h3>'+diff_str[i]+'</h3>';
        disp+='<table style="padding:15px">';
        disp+='<tr align="center"><th>難易度</th><th>トータルスコア</th><th>平均スコア</th></tr>';
        for(var j=0;j<diff_rank;j++){
            if(diff_num[j][i]>0){
                disp+='<tr align="center">';
                disp+='<td>'+diff_str[i]+(j+1)+'</td>';
                disp+='<td>'+diff_total_score[j][i]+'</td>';
                disp+='<td>'+Math.floor(diff_total_score[j][i]/diff_num[j][i])+'</td>';
                disp+='</tr>';
            }
        }
        disp+='</table>';
    }
    
   
    
    disp+='<h2>300万、400万数</h2>';
    disp+='<p>300万:'+god_count[0]+'曲</p>';
    disp+='<p>400万:'+god_count[1]+'曲</p>';
    
    score_disp();
}

function score_disp(){
    disp+='</body></html>';
    document.write(disp);

}
get_id();
