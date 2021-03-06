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
var diff_total_score=new Array(diff_str.length);
var diff_num=new Array(diff_str.length);

var genre_s_rate=new Array(genre_str.length);
var genre_sp_rate=new Array(genre_str.length);
var genre_spp_rate=new Array(genre_str.length);
var genre_perfect_rate=new Array(genre_str.length);

var diff_s_rate=new Array(diff_str.length);
var diff_sp_rate=new Array(diff_str.length);
var diff_spp_rate=new Array(diff_str.length);
var diff_perfect_rate=new Array(diff_str.length);


/*配列の初期化*/
for(var i=0;i<genre_str.length;i++){
    genre_total_score[i]=new Array(diff_str.length);
    genre_num[i]=new Array(diff_str.length);
    genre_s_rate[i]=new Array(diff_str.length);
    genre_sp_rate[i]=new Array(diff_str.length);
    genre_spp_rate[i]=new Array(diff_str.length);
    genre_perfect_rate[i]=new Array(diff_str.length);
    for(var j=0;j<diff_str.length;j++){
        genre_total_score[i][j]=0;
        genre_num[i][j]=0;
        genre_s_rate[i][j]=0;
        genre_sp_rate[i][j]=0;
        genre_spp_rate[i][j]=0;
        genre_perfect_rate[i][j]=0;
    }
}

/*genre[genre_kind][diff_kind]*/
/*diff[diff_kind][level]*/

for(var i=0;i<diff_str.length;i++){
    diff_total_score[i]=new Array(diff_rank);
    diff_num[i]=new Array(diff_rank);
    diff_s_rate[i]=new Array(diff_rank);
    diff_sp_rate[i]=new Array(diff_rank);
    diff_spp_rate[i]=new Array(diff_rank);
    diff_perfect_rate[i]=new Array(diff_rank);
    for(var j=0;j<diff_rank;j++){
        diff_total_score[i][j]=0;
        diff_num[i][j]=0;
        diff_s_rate[i][j]=0;
        diff_sp_rate[i][j]=0;
        diff_spp_rate[i][j]=0;
        diff_perfect_rate[i][j]=0;
    }
}


const timeout=10000;

const mypage_host='https://mypage.groovecoaster.jp';
const github_host='https://kazudon-0407.github.io';

function get_url(host,path,param){
    return host+path+param;
}

function get_id(){
    const list_path='/sp/json/music_list.php';
    const list_para='';
    const list_url=get_url(mypage_host,list_path,list_para);
    var xmlHttp=new XMLHttpRequest();
    /*id set*/
    xmlHttp.open("GET",list_url,true);
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
    const detail_path='/sp/json/music_detail.php';
    const detail_para='?music_id=';
    const detail_url=get_url(mypage_host,detail_path,detail_para);
    disp+='<html><head><title>スコア</title><script>function copyToClipboard(){var copyTarget = document.getElementById("CopyTarget");var text = document.createElement("textarea");text.value = copyTarget.innerText;document.body.appendChild(text);text.select();document.execCommand("copy");alert("クリップボードにコピーしました。");text.parentElement.removeChild(text);}</script></head><body><h1>あなたのプレイ済み楽曲のスコア</h1>';
    id.forEach(function(music_id,index){
        /*score dataは添字music_idに格納*/
        data_array[music_id]=new Array();
        xhr[music_id]=new XMLHttpRequest();
        xhr[music_id].open("GET",detail_url+music_id,true);
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
    const csv_path='/groove_coaster_score_bookmarklet/genre_sort_database.csv';
    const csv_para='';
    const csv_url=get_url(github_host,csv_path,csv_para);
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
    disp+='<p>以下のボタンを押すとスコアをコピーできます！</p>';
    disp+='<button onclick="copyToClipboard()">Copy Score</button>';
    disp+='<div id="CopyTarget">';
    var current_genre=-1;
    disp+='<p>';
    for(var i=0;i<csv.length;i++){
        if(current_genre!=csv[i][genre]){
            current_genre=csv[i][genre];
            disp+='<h2>['+genre_str[current_genre]+']</h2>';
        }
        var current_id=csv[i][csv_id];
        var all_diff=new Array(diff_str.length);
        var all_score=new Array(diff_str.length);
        if(score[current_id]!=undefined){
            disp+=csv[i][title];
            for(var j=0;j<diff_str.length;j++){
                all_diff[j]=csv[i][lower_diff+j];
                all_score[j]=score[current_id][lower_score+j];            
                
                if(csv[i][lower_diff+j]<1){
                    continue;
                }
                
                disp+=","+all_score[j];
                
                diff_num[j][all_diff[j]-1]++;
                genre_num[current_genre][j]++;
                
                genre_total_score[current_genre][j]+=all_score[j];
                diff_total_score[j][all_diff[j]-1]+=all_score[j];
                
                
                if(all_score[j]>=900000){
                    genre_s_rate[current_genre][j]++;
                    diff_s_rate[j][all_diff[j]-1]++;
                }
                
                if(all_score[j]>=950000){
                    genre_sp_rate[current_genre][j]++;
                    diff_sp_rate[j][all_diff[j]-1]++;
                }
                
                if(all_score[j]>=990000){
                    genre_spp_rate[current_genre][j]++;
                    diff_spp_rate[j][all_diff[j]-1]++;
                }
                
                if(all_score[j]==1000000){
                    genre_perfect_rate[current_genre][j]++;
                    diff_perfect_rate[j][all_diff[j]-1]++;
                }
            }            

            if((all_score[0]+all_score[1]+all_score[2])==3000000) god_count[0]++;  
            if((all_score[0]+all_score[1]+all_score[2]+all_score[3])==4000000) god_count[1]++;
            disp+='<br>';
        }
        
        else{
            //完全未プレイ楽曲だった場合の処理(母数のみ数える)
            for(var j=0;j<diff_str.length;j++){
                all_diff[j]=csv[i][lower_diff+j];
                
                if(csv[i][lower_diff+j]<1){
                    continue;
                }
                diff_num[j][all_diff[j]-1]++;
                genre_num[current_genre][j]++;
            }
        }
        
    }       
    disp+='</p>';
    disp+='</div>';
    
    /*Clipboard Tag*/
    
    score_detail();
    
}


function score_detail(){
    disp+='<h1>◎スコア詳細</h1>';
    disp+='<h2>〇ジャンル別詳細</h2>';

    for(var i=0;i<genre_str.length;i++){
        disp+='<h3>['+genre_str[i]+']</h3>';
        for(var j=0;j<diff_str.length;j++){
            disp+='<table style="padding:15px">';
            disp+='<tr align="center"><th>難易度</th><th>トータルスコア</th><th>S率</th><th>S+率</th><th>S++率</th><th>Perfect率</th></tr>';
            disp+='<tr align="center">';
            disp+='<td>'+diff_str[j]+'</td>';
            disp+='<td>'+genre_total_score[i][j]+'</td>';
            disp+='<td>'+genre_s_rate[i][j]+"/"+genre_num[i][j]+'</td>';
            disp+='<td>'+genre_sp_rate[i][j]+"/"+genre_num[i][j]+'</td>';
            disp+='<td>'+genre_spp_rate[i][j]+"/"+genre_num[i][j]+'</td>';
            disp+='<td>'+genre_perfect_rate[i][j]+"/"+genre_num[i][j]+'</td>';
            disp+='</tr>';
        }
        disp+='</table>';
    }
 
    disp+='<h2>〇難易度別詳細</h2>';
    
    for(var i=0;i<diff_str.length;i++){
        disp+='<h3>['+diff_str[i]+']</h3>';
        disp+='<table style="padding:15px">';
        disp+='<tr align="center"><th>難易度</th><th>トータルスコア</th><th>S率</th><th>S+率</th><th>S++率</th><th>Perfect率</th></tr>';
        for(var j=0;j<diff_rank;j++){
            if(diff_num[i][j]>0){
                disp+='<tr align="center">';
                disp+='<td>'+diff_str[i]+(j+1)+'</td>';
                disp+='<td>'+diff_total_score[i][j]+'</td>';
                disp+='<td>'+diff_s_rate[i][j]+"/"+diff_num[i][j]+'</td>';
                disp+='<td>'+diff_sp_rate[i][j]+"/"+diff_num[i][j]+'</td>';
                disp+='<td>'+diff_spp_rate[i][j]+"/"+diff_num[i][j]+'</td>';
                disp+='<td>'+diff_perfect_rate[i][j]+"/"+diff_num[i][j]+'</td>';
                disp+='</tr>';
            }
        }
        disp+='</table>';
    }
    
   
    
    disp+='<h2>〇300万、400万数(削除曲を除く)</h2>';
    disp+='<p>・300万:'+god_count[0]+'曲</p>';
    disp+='<p>・400万:'+god_count[1]+'曲</p>';
    
    score_disp();
}

function score_disp(){
    disp+='</body></html>';
    document.write(disp);

}
get_id();
