const title=0;
const csv_id=1;
const genre=2;

/*csv data index*/
const diff_idx=3;

/*score data index*/
const score_idx=1;
const play_count_idx=5;
const perfect_count_idx=9;
const rank_idx=13;
const score_data_maxlen = 17;

const diff_rank=15;

var player_name;
var play_id;
var all_data=[];
var csv=[];

var is_display_alert = false;
var is_NaN = false;

var csv_txt="";

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
var genre_is_play=new Array(genre_str.length);

var diff_s_rate=new Array(diff_str.length);
var diff_sp_rate=new Array(diff_str.length);
var diff_spp_rate=new Array(diff_str.length);
var diff_perfect_rate=new Array(diff_str.length);
var diff_is_play=new Array(diff_str.length);


/*initialize*/
for(var i=0;i<genre_str.length;i++){
    genre_total_score[i]=new Array(diff_str.length);
    genre_num[i]=new Array(diff_str.length);
    genre_s_rate[i]=new Array(diff_str.length);
    genre_sp_rate[i]=new Array(diff_str.length);
    genre_spp_rate[i]=new Array(diff_str.length);
    genre_perfect_rate[i]=new Array(diff_str.length);
    genre_is_play[i]=new Array(diff_str.length);
    for(var j=0;j<diff_str.length;j++){
        genre_total_score[i][j]=0;
        genre_num[i][j]=0;
        genre_s_rate[i][j]=0;
        genre_sp_rate[i][j]=0;
        genre_spp_rate[i][j]=0;
        genre_perfect_rate[i][j]=0;
        genre_is_play[i][j]=0;
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
    diff_is_play[i]=new Array(diff_rank);
    for(var j=0;j<diff_rank;j++){
        diff_total_score[i][j]=0;
        diff_num[i][j]=0;
        diff_s_rate[i][j]=0;
        diff_sp_rate[i][j]=0;
        diff_spp_rate[i][j]=0;
        diff_perfect_rate[i][j]=0;
        diff_is_play[i][j]=0;
    }
}


const timeout=10000;
const s_timeout=100000;

const mypage_host='https://mypage.groovecoaster.jp';
const github_host='https://kazudon-0407.github.io';

function get_url(host,path,param){
    return host+path+param;
}

async function get_player_name(){
    return new Promise(function(resolve) {
        const list_path='/sp/json/player_data.php';
        const list_para='';
        const list_url=get_url(mypage_host,list_path,list_para);
        var xmlHttp=new XMLHttpRequest();

        /*id set*/
        xmlHttp.open("GET",list_url,true);
        xmlHttp.timeout=timeout;
        xmlHttp.onreadystatechange = function(){
            if (xmlHttp.readyState === 4 && xmlHttp.status === 200){
                var data_s=JSON.parse(xmlHttp.responseText);
                player_name = data_s.player_data.player_name;
                resolve();
                /*get_id(data_s.player_data.player_name)*/
            }
            else if (xmlHttp.readyState === 4 && xmlHttp.status === 0){
                /*get_id("あなた")*/
                player_name = "あなた";
                resolve();
            }
        };
        xmlHttp.send(null);
    });
}

async function get_id(){
    return new Promise(function(resolve) {
        const list_path='/sp/json/music_list.php';
        const list_para='';
        const list_url=get_url(mypage_host,list_path,list_para);
        var xmlHttp=new XMLHttpRequest();
        /*id set*/
        xmlHttp.open("GET",list_url,true);
        xmlHttp.timeout=timeout;
        /*プレイ済み楽曲のIDを取得*/
        xmlHttp.onreadystatechange = function(){
            if (xmlHttp.readyState === 4 && xmlHttp.status === 200){
                var data_s=JSON.parse(xmlHttp.responseText);
                play_id=data_s.music_list.map(function(e){
                    return e.music_id;
                });
                play_id.sort(
                    function(a,b) {
                        return a - b;
                    }
                );
                alert("グルコススコア保存ツールver.1.0\nOK or 閉じるを押すとデータ取り込みを開始します\n※処理に時間がかかる場合があります");
                resolve();
                /* get_score(play_id, player_name); */
            }
            else if (xmlHttp.readyState === 4 && xmlHttp.status === 0){
                alert("通信エラー\nマイページにログインして実行してください");
            }
        };
        xmlHttp.send(null);
    });
}

async function get_score(){
    return new Promise(function(resolve) {
        /*data_arrayの構成：music_idごとに0:title, 1:score_simple, 2:score_normal, 3:score_hard, 4:score_extra*/
        var xhr=[];
        const detail_path='/sp/json/music_detail.php';
        const detail_para='?music_id=';
        const detail_url=get_url(mypage_host,detail_path,detail_para);

        disp+='<html><head><meta name="format-detection" content="telephone=no"><title>スコア</title></head><body><h1>'+player_name+'のプレイ済み楽曲のスコア</h1>';

        play_id.forEach(function(music_id,index){
            /*score dataは添字music_idに格納*/
            all_data[music_id]=new Array();
            xhr[music_id]=new XMLHttpRequest();
            xhr[music_id].open("GET",detail_url+music_id,true);
            xhr[music_id].timeout=s_timeout;
            xhr[music_id].onreadystatechange = function(){
                if (xhr[music_id].readyState === 4 && xhr[music_id].status === 200){
                    var data=JSON.parse(xhr[music_id].responseText);
                    const path=[data.music_detail.simple_result_data,data.music_detail.normal_result_data,data.music_detail.hard_result_data,data.music_detail.extra_result_data];
                    all_data[music_id][0]=data.music_detail.music_title;

                    var score_data;
                    var play_count_data;
                    var perfect_count_data;
                    var rank_data;
                    var diff_lng=4;

                    if(!data.music_detail.ex_flag) diff_lng--;


                    /*難易度毎に各種データを取得*/
                    for(var i=0;i<diff_lng;i++){
                        /*スコアデータ*/
                        (path[i]==null || path[i].score==null) ? score_data=0 : score_data=path[i].score;
                        all_data[music_id][i+score_idx]=score_data;

                        /*プレイ回数*/
                        (path[i]==null) ? play_count_data=0 : play_count_data=path[i].play_count;
                        all_data[music_id][i+play_count_idx]=play_count_data;

                        /*Perfect回数*/
                        (path[i]==null) ? perfect_count_data=0 : perfect_count_data=path[i].perfect;
                        all_data[music_id][i+perfect_count_idx]=perfect_count_data;

                        /*順位*/
                        (data.music_detail.user_rank[i]==null) ? rank_data=0 : rank_data=data.music_detail.user_rank[i].rank;
                        all_data[music_id][i+rank_idx]=rank_data;
                    }

                    if(index==play_id.length-1){
                        resolve();
                        /*get_csv(all_data);*/
                    }
                }
                else if (xhr[music_id].readyState === 4 && xhr[music_id].status === 0){
                    is_display_alert = true;
                }
            };
            xhr[music_id].send(null);
        });
    });
}

async function get_csv(){
    return new Promise(function(resolve) {
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

                for(var i = 0; i < arr.length; i++){
                    if(arr[i] == '') break;
                    csv[i] = arr[i].split(',');
                }
                /*data_search(csv,score_data);*/
                resolve();
            }
            else if (xmlHttp.readyState === 4 && xmlHttp.status === 0){
                alert("CSVデータの取得に失敗しました");
            }
        };
        xmlHttp.send(null);
    });
}

async function data_search(){
    return new Promise(function(resolve) {
        
        disp+='<h3>以下のボタンを押すとデータをCSVファイルとして保存できます</h3>';
        disp+='<style>.custom-button {display: inline-block;padding: 10px 20px;font-size: 16px;text-align: center;text-decoration: none;cursor: pointer;border: 2px solid #9A7BF4;color: #9A7BF4;background-color: transparent;border-radius: 5px;transition: background-color 0.3s, color 0.3s;}.custom-button:hover {background-color: #9A7BF4;color: white;}</style>';
        disp+='<button class="custom-button" onclick="downloadCSV()">CSV Download</button>';
        /*disp+='<button class="js-copybtn">copy</button>';*/
        disp+='<div id="CopyTarget">';
        var current_genre=-1;
        disp+='<p>';

        disp += '<table style="font-size:20px;border-collapse: collapse;line-height: 30px;" cellpadding="5">';
        disp += '<tr align="center"><th rowspan="2" style="border-right: 1px solid black;">曲名</th><th colspan="4" style="border-right: 1px solid black;">スコア</th><th colspan="4" style="border-right: 1px solid black;">プレイ回数</th><th colspan="4" style="border-right: 1px solid black;">Perfect回数</th><th colspan="4">順位</th></tr>';
        disp += '<tr align="center" style="border-bottom: 3px solid black;"><th>simple</th><th>normal</th><th>hard</th><th style="border-right: 1px solid black;">extra</th><th>simple</th><th>normal</th><th>hard</th><th style="border-right: 1px solid black;">extra</th><th >simple</th><th>normal</th><th>hard</th><th style="border-right: 1px solid black;">extra</th><th>simple</th><th >normal</th><th>hard</th><th>extra</th></tr>';

        csv_txt+="曲名,スコア(simple),スコア(normal),スコア(hard),スコア(extra),プレイ回数(simple),プレイ回数(normal),プレイ回数(hard),プレイ回数(extra),Perfect回数(simple),Perfect回数(normal),Perfect回数(hard),Perfect回数(extra),順位(simple),順位(normal),順位(hard),順位(extra)\n";
        
        /*曲の数だけループを回す*/
        for(var i=0;i<csv.length;i++){
            if(current_genre!=csv[i][genre]){
                current_genre=csv[i][genre];
                /*disp+='<h2>['+genre_str[current_genre]+']</h2>';*/
            }
            var current_id=csv[i][csv_id];

            /*難易度データとスコアデータのリスト*/
            var diff_list=new Array(diff_str.length);
            var score_list=new Array(diff_str.length);

            /*プレイ済み楽曲だった場合の処理*/
            if(all_data[current_id]!=undefined){
                /*disp+='<tr align="left">';*/
                /*disp+='<td>'+csv[i][title]+'</td>';*/
                /*csv_txt+=csv[i][title];*/

                /*各種カウント*/
                for(var j=0;j<diff_str.length;j++){
                    diff_list[j]=csv[i][diff_idx+j];
                    score_list[j]=all_data[current_id][score_idx+j];            
                    
                    /*extraがない場合スキップ*/
                    if(csv[i][diff_idx+j]<1){
                        continue;
                    }
                    
                    /*disp+='<td>'+score_list[j]+'</td>';*/
                    /*csv_txt+=","+score_list[j];*/

                    /*プレイ曲済み楽曲をカウント*/
                    if(all_data[current_id][play_count_idx+j]>0) {
                        diff_is_play[j][diff_list[j]-1]++;
                        genre_is_play[current_genre][j]++;
                    }
                    
                    /*母数をカウント*/
                    diff_num[j][diff_list[j]-1]++;
                    genre_num[current_genre][j]++;
                    
                    genre_total_score[current_genre][j]+=score_list[j];
                    diff_total_score[j][diff_list[j]-1]+=score_list[j];
                    
                    
                    if(score_list[j]>=900000){
                        genre_s_rate[current_genre][j]++;
                        diff_s_rate[j][diff_list[j]-1]++;
                    }
                    
                    if(score_list[j]>=950000){
                        genre_sp_rate[current_genre][j]++;
                        diff_sp_rate[j][diff_list[j]-1]++;
                    }
                    
                    if(score_list[j]>=990000){
                        genre_spp_rate[current_genre][j]++;
                        diff_spp_rate[j][diff_list[j]-1]++;
                    }
                    
                    if(score_list[j]==1000000){
                        genre_perfect_rate[current_genre][j]++;
                        diff_perfect_rate[j][diff_list[j]-1]++;
                    }
                }            
                
                /*神称号数カウント*/
                if((score_list[0]+score_list[1]+score_list[2])==3000000) god_count[0]++;  
                if((score_list[0]+score_list[1]+score_list[2]+score_list[3])==4000000) god_count[1]++;


                /*表示用データの生成*/
                disp+='<tr align="left">';
                for(var j=0;j<score_data_maxlen;j++){
                    if(typeof all_data[current_id][j] === "undefined") {
                        all_data[current_id][j] = "-";
                    }
                    if(j==0){
                        disp+='<td align="left" style="border-right: 1px solid black;">';
                        disp+=csv[i][title]+'</td>';
                        csv_txt+=csv[i][title];
                    }
                    else if(j==4 || j==8 || j==12){
                        disp+='<td align="center" style="border-right: 1px solid black;">';
                        disp+=all_data[current_id][j]+'</td>';
                        csv_txt+=all_data[current_id][j];
                    }
                    else{
                        disp+='<td align="center">';
                        disp+=all_data[current_id][j]+'</td>';
                        csv_txt+=all_data[current_id][j];
                    }

                    if(j<score_data_maxlen-1) csv_txt+=',';
                }
                disp+='</tr>';
                csv_txt+='\n';
            }
            
            /*完全未プレイ楽曲だった場合の処理(母数のみカウントする)*/
            else{
                for(var j=0;j<diff_str.length;j++){
                    diff_list[j]=csv[i][diff_idx+j];
                    
                    if(csv[i][diff_idx+j]<1){
                        continue;
                    }
                    diff_num[j][diff_list[j]-1]++;
                    genre_num[current_genre][j]++;
                }
            }
        }       
        disp+='</table>';
        disp+='</p>';
        disp+='</div>';
        
        /*Clipboard Tag*/
        
        /*score_detail();*/
        resolve();

    });
    
}


async function score_detail(){
    await new Promise(function(resolve) {
        disp+='<h1>◎スコア詳細</h1>';
        disp+='<h2>〇ジャンル別詳細</h2>';

        for(var i=0;i<genre_str.length;i++){
            disp+='<h3>['+genre_str[i]+']</h3>';
            disp+='<table style="padding:15px;font-size:20px;" cellpadding="3">';
            disp+='<tr align="center"><th>難易度</th><th>プレイ済み楽曲数</th><th>トータルスコア</th><th>平均スコア</th><th>S率</th><th>S+率</th><th>S++率</th><th>Perfect率</th></tr>';
            disp += '<tr>';
            disp += '<td colspan="17" style="border-top: 3px solid black;"></td>';
            disp += '</tr>';

            for(var j=0;j<diff_str.length;j++){
                var avg_score=0;
                if(genre_is_play[i][j]>0){
                    avg_score=Math.floor(genre_total_score[i][j]/genre_is_play[i][j]);
                }
                if(Number.isNaN(genre_total_score[i][j])){
                    is_NaN=true;
                }
                disp+='<tr align="center">';
                disp+='<td>'+diff_str[j]+'</td>';
                disp+='<td>'+genre_is_play[i][j]+"/"+genre_num[i][j]+'</td>';
                disp+='<td>'+genre_total_score[i][j]+'</td>';
                disp+='<td>'+avg_score+'</td>';
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
            disp+='<table style="padding:15px;font-size:20px;" cellpadding="3">';
            disp+='<tr align="center"><th>難易度</th><th>プレイ済み楽曲数</th><th>トータルスコア</th><th>平均スコア</th><th>S率</th><th>S+率</th><th>S++率</th><th>Perfect率</th></tr>';
            disp += '<tr>';
            disp += '<td colspan="17" style="border-top: 3px solid black;"></td>';
            disp += '</tr>';

            for(var j=0;j<diff_rank;j++){
                if(diff_num[i][j]>0){
                    var avg_score=0;
                    if(diff_is_play[i][j]>0){
                        avg_score=Math.floor(diff_total_score[i][j]/diff_is_play[i][j]);
                    }
                    if(Number.isNaN(diff_total_score[i][j])){
                        is_NaN=true;
                    }
                    disp+='<tr align="center">';
                    disp+='<td>'+diff_str[i]+(j+1)+'</td>';
                    disp+='<td>'+diff_is_play[i][j]+"/"+diff_num[i][j]+'</td>';
                    disp+='<td>'+diff_total_score[i][j]+'</td>';
                    disp+='<td>'+avg_score+'</td>';
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
        disp+='<h3>300万:'+god_count[0]+'曲</h3>';
        disp+='<h3>400万:'+god_count[1]+'曲</h3>';

        if(is_NaN){
            alert("一部データの取り込みに失敗しました\nページをリロードして再度実行してください");
        }
        
        /*score_disp();*/
        resolve();
    });
}

async function score_disp(){
    return new Promise(function(resolve) {
        csv_txt = "\ufeff" + csv_txt;
        disp+='<textarea id="csv_txt" style="display:none">'+csv_txt+'</textarea>'; /*csv保存用テキスト*/
        disp+='<script>function downloadCSV() {var csvContent = document.getElementById("csv_txt").value;var blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });var link = document.createElement("a");if (link.download !== undefined) {var url = URL.createObjectURL(blob);link.setAttribute("href", url);link.setAttribute("download", "gc_score.csv");link.style.visibility = "hidden";document.body.appendChild(link);link.click();document.body.removeChild(link);}}</script>';
        disp+='</body></html>';
        document.write(disp);
        resolve();
    }); 
}

async function runAll(){
    try{
        await get_player_name();
        await get_id();
        await get_score();

        if(is_display_alert){
            alert("データの取得に失敗しました");
        }
        else{
            await get_csv();
            await data_search();
            await score_detail();
            await score_disp();
        }
    }
    catch(error){
        console.error(error);
    }
}

/* runAll(); */

async function runOmikuji(){
    try{
        await get_csv();
        const randomIndex = Math.floor(Math.random() * csv.length);
        const randomMusic = csv[randomIndex][0];
        alert("このブックマークレットは現在使用できません\n代わりに本日のオススメ楽曲を表示します\n\n" + randomMusic);
    }
    catch(error){
        console.error(error);
    }
}

runOmikuji();
