'use strict';
const toggle=document.querySelector('.menu-toggle');
const nav=document.querySelector('#site-nav');
function closeMenu(){nav?.classList.remove('open');toggle?.setAttribute('aria-expanded','false');if(toggle)toggle.lastElementChild.textContent='＋'}
toggle?.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open);toggle.lastElementChild.textContent=open?'−':'＋'});
nav?.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&toggle?.getAttribute('aria-expanded')==='true'){closeMenu();toggle.focus()}});
document.addEventListener('click',e=>{if(!e.target.closest('.site-header'))closeMenu()});
// A non-modal menu must not cover content after keyboard focus leaves the header.
document.addEventListener('focusin',e=>{if(!e.target.closest('.site-header'))closeMenu()});
window.addEventListener('pageshow',closeMenu);
const guide=document.querySelector('.use-guide');
if(guide){
 const choices=guide.querySelector('.use-choices');
 const buttons=[...choices.querySelectorAll('button')];
 const panels=[...guide.querySelectorAll('.use-panel')];
 const choose=key=>{buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.use===key)));panels.forEach(p=>{p.hidden=p.id!=='use-'+key})};
 choices.hidden=false;choose('conference');buttons.forEach(b=>b.addEventListener('click',()=>choose(b.dataset.use)));
}
const form=document.querySelector('#brief-form');
if(form){
 const params=new URLSearchParams(location.search);
 const topics={'warehouse':'倉庫作業（出庫準備・内容照合・返却確認）','venue-stream':'会場と配信の画面構成','show-cues':'進行に合う映像操作','outdoor':'屋外イベントの雨・防水対策','led-size':'画面サイズと見る距離','mice':'会議・展示会などの映像の役割','fiber':'光ファイバーでの映像の伝送','signal':'SDI と HDMI の変換','monitor':'確認用の小型モニター','distribution':'映像の分配','power':'電源コネクターと給電'};
 const topic=params.get('brief')==='technical'&&Object.hasOwn(topics,params.get('topic'))?topics[params.get('topic')]:'';
 const starts={technical:'技術提供',rental:'機材レンタル',both:'技術と機材'};
 const uses={conference:'発表会・会議',exhibition:'展示会・展示空間',stage:'ステージ・ライブ'};
 const equipment={'power-planning':'電源・トランス・分岐の構成','ethercon':'ネットワーク端子・ケーブル','power':'電源端子・ケーブル','led-display':'LEDディスプレイ',projection:'プロジェクター',switching:'切り替え・映像調整','led-processing':'LEDプロセッサー',recording:'録画・リプレイ',monitoring:'確認モニター',signage:'会場表示ディスプレイ',conversion:'映像形式の変換',routing:'映像の振り分け',playback:'映像の再生・送出',operation:'進行・スタッフ連絡',screen:'投写スクリーン','document-camera':'書画カメラ','ptz-camera':'PTZカメラ','ptz-control':'PTZカメラコントローラー','presenter-control':'資料送り・プレゼンテーション','usb-conference':'USB会議機材','wireless-video':'ワイヤレス映像伝送','midi-control':'USB MIDI操作'};
 const models={'roland-v160hd':'Roland V-160HD','panasonic-pt-vmz71':'Panasonic PT-VMZ71','brompton-sx40':'Brompton Tessera SX40','roland-p20hd':'Roland P-20HD','hyperdeck-studio-hd-plus':'Blackmagic HyperDeck Studio HD Plus','adtechno-uh1561s':'ADTECHNO UH1561S','roe-rubyc26':'ROE Ruby-C 2.6','roe-dm26':'ROE Diamond DM2.6','roland-vr120hd':'Roland VR-120HD','teranex-av':'Blackmagic Teranex AV','videohub40-12g':'Blackmagic Videohub 40x40 12G','panasonic-rq25kj':'Panasonic PT-RQ25KJ','aquilon-cplus':'Analog Way Aquilon C+','barco-imagepro4k':'Barco ImagePRO-4K','novastar-mx40pro':'NovaStar MX40 Pro','disguise-vx4plus':'Disguise VX 4+','videoassist7-12ghdr':'Blackmagic Video Assist 7インチ 12G HDR','aja-kiprogo2':'AJA Ki Pro GO2','decimator-mdhx':'Decimator MD-HX','aja-hdmi-sdi12g':'AJA HA5-12G / Hi5-12G','bmd-optical12g':'Blackmagic Mini Converter Optical Fiber 12G','aja-fido12g':'AJA FiDO-T-12G / FiDO-R-12G','brightsign-xd236':'BrightSign XD236','barco-encore3':'Barco Encore3','panasonic-req15jlb':'Panasonic PT-REQ15JLB','panasonic-et-c1w300':'Panasonic ET-C1W300','roland-vc1dl':'Roland VC-1-DL','imagenics-nex02t-hfs':'IMAGENICS NEX-02T/HF-S','imagenics-dvh14a':'IMAGENICS DVH-14A','novastar-cvt10pro':'NovaStar CVT10 Pro','smartscope-duo4k':'Blackmagic SmartScope Duo 4K','bmd-streaming-encoder4k':'Blackmagic Streaming Encoder 4K','ultrastudio-express-recorder3g':'Blackmagic UltraStudio Express Recorder 3G','aja-gen10':'AJA GEN10','analogway-rc400t':'Analog Way RC400T','imagenics-dmc4k':'IMAGENICS DM-C4K','imagenics-hevu41':'IMAGENICS HEV-U41','iodata-cwq341sdbf':'I-O DATA LCD-CWQ341SDB-F','canare-hdmpa6':'CANARE HDM**P-A6シリーズ','panasonic-c1u100':'Panasonic ET-C1U100','sharp-pnp506':'SHARP PN-P506','sonifex-avn-dio10-12g':'Sonifex AVN-DIO10-12G','magewell-hdmi4kplus':'Magewell USB Capture HDMI 4K Plus','visualproductions-timecore':'Visual Productions TimeCore','adtechno-dav02':'ADTECHNO DAV-02HT / DAV-02HR','epson-ev115':'EPSON LightScene EV-115','leyard-clf5m2':'LEYARD CLF5M2','roe-vanish-v8s':'ROE Vanish V8S','dsan-limitimer':'DSAN Limitimer PRO-2000-PLUS','netgear-gsm4212ux':'NETGEAR GSM4212UX-100AJS','aten-kx9970':'ATEN KX9970T / KX9970R','av-stumpfl-monoclip32':'AV Stumpfl MonoClip32','hollyland-solidcom-c1-pro-6s':'Hollyland Solidcom C1 Pro-6S','elmo-px30e':'ELMO PX-30E','panasonic-aw-ue150k':'Panasonic AW-UE150K','panasonic-aw-rp150gj':'Panasonic AW-RP150GJ','logicool-r1000sl':'Logicool Spotlight R1000SL','bose-videobar-vb1':'Bose Professional Videobar VB1','hollyland-mars-400s-pro':'Hollyland MARS 400S PRO','digitalforecast-x-ts-mini':'Digital Forecast X_TS_mini','korg-nanokontrol2':'KORG nanoKONTROL2','neutrik-ne8mc6-mo':'Neutrik etherCON NE8MC6-MO','neutrik-powercon-true1':'Neutrik powerCON TRUE1 F / M-S','desay-dp26':'DESAY DP2.6','leyard-clm10m2':'Leyard CLM10M2','leyard-clm10m3':'Leyard CLM10M3','leyard-cli39-clt':'Leyard CLI3.9 CLT','leyard-clo39':'Leyard CLO3.9','roe-cb5':'ROE Carbon CB5','roe-jdi59':'ROE Jade JDI5.9','leyard-ecodot2-p55':'Leyard Ecodot-2 P55','apexls-sphere1800-25g':'Apexls sphere1800-2.5G','infiled-db26pro-module':'INFILED DB2.6pro LEDモジュール','videotron-dda25hdsd':'VIDEOTRON DDA-25HD/SD','imagenics-dvh17a':'IMAGENICS DVH-17A','barco-imagepro-ii-jr':'Barco ImagePRO-II Jr','barco-imagepro-ii':'Barco ImagePRO-II','neutrik-opticalcon-duo':'Neutrik opticalCON DUO / DUO X-TREME','theatrixx-xvvsdi2hdmi':'Theatrixx XVVSDI2HDMI','theatrixx-xvision-3g-fiber':'Theatrixx xVision 3G-SDI光伝送','adtechno-lcd1015s':'ADTECHNO LCD1015S','colorlight-z5':'Colorlight Z5','colorlight-h10fn2':'Colorlight H10FN2','brompton-tessera-xd':'Brompton Tessera XD','barco-quad-hdmi-output':'Barco H 2.0 Quad output card'};
 const model=['rental','both'].includes(params.get('brief'))&&Object.hasOwn(models,params.get('model'))?models[params.get('model')]:'';
 // BEGIN GENERATED PRODUCT HINTS
 const modelHints={"roland-v160hd":"接続するPC・カメラの台数、出力先の数、操作担当の有無","panasonic-pt-vmz71":"スクリーンの幅・高さ、設置距離、会場の明るさ、映す素材","brompton-sx40":"LED型式、画面の幅・高さ・枚数、入力機器、操作席からの距離","roland-p20hd":"リプレイする内容、入力機器、イベント時間、送出先、操作担当","hyperdeck-studio-hd-plus":"残したい映像、解像度・フレームレート、収録時間、納品形式、予備収録の要否","adtechno-uh1561s":"確認する映像、接続端子、設置位置、台数、卓上／ラックの希望","roe-rubyc26":"希望する形と画面寸法、屋内会場、見る距離、吊り／自立の希望、背面スペース","roe-dm26":"画面の幅・高さ、映像素材、会場図面、吊り／自立、搬入経路と使用時間","roland-vr120hd":"会場と配信の用途、入力機器とマイク、配信先、回線、録画、操作担当","teranex-av":"入力と出力の映像形式、接続端子、信号距離、音声、許容できる遅延","videohub40-12g":"入力・出力の台数と型式、映像規格、操作場所、別体パネルの要否、配線図","panasonic-rq25kj":"スクリーン寸法、投写距離、設置電源、会場図面、素材解像度、レンズと設営の範囲","aquilon-cplus":"画面ごとの解像度、同時入力数、合成イメージ、搭載カード、操作卓、リハーサル時間","barco-imagepro4k":"入力と出力の形式、端子、切り出す範囲、画面数、信号距離、調整担当","novastar-mx40pro":"LED型式と受信カード、画面の画素数、入力機器、配線距離、光モジュール、設定・操作範囲","disguise-vx4plus":"素材形式、画面構成、Designerの版、入力・出力、同期、予備機、素材制作と操作担当","videoassist7-12ghdr":"接続カメラ、録画形式、収録時間、電源、記録メディア、固定方法","aja-kiprogo2":"同時収録数、入力端子、解像度・fps、収録時間、バックアップ、保存先と納品形式","decimator-mdhx":"入力と出力の映像形式、端子、製造番号の世代、変換目的、電源・ケーブル","aja-hdmi-sdi12g":"送信元と受信先、端子、映像形式、音声、ケーブル距離、必要台数","bmd-optical12g":"映像形式、送受方向、距離、光ケーブル種類、既設光路、相手機器とモジュール","aja-fido12g":"映像規格、送受の機種、距離、光配線、接続損失、台数、電源とケーブル","brightsign-xd236":"画面の台数と型式、素材形式、縦横の向き、表示時間、更新方法、ネットワーク、記録メディア・電源・ソフト契約の範囲","barco-encore3":"画面配置と画素数、入力形式と台数、合成イメージ、カード構成、操作卓、ソフトウェア、予備系と操作担当","panasonic-req15jlb":"画面寸法と縦横比、投写距離、入力機器、レンズ、入力ボード、会場電源、設置・調整の範囲","panasonic-et-c1w300":"対応本体の型式、画面の幅・高さと縦横比、設置距離、客席・通路、レンズ交換・調整の範囲","roland-vc1dl":"映像形式、気になるずれ、映像・音声の経路、基準信号、接続端子、調整担当とリハーサル時間","imagenics-nex02t-hfs":"入力の解像度とフレームレート、送信元と受信先、画面数、距離と光経路、USB操作の要否、制御・設定の範囲","imagenics-dvh14a":"送信元と画面の型式、同じ映像を出す台数、解像度、接続端子、各配線距離、音声の扱い","novastar-cvt10pro":"送出機器・LED受信システムの型式、S/Mの光方式、距離と配線経路、必要な出力数、主・予備経路、ケーブル・設置・設定の範囲","smartscope-duo4k":"接続元のSDI形式、確認したい内容、設置ラック、ループスルー先、設定用PC・配線・担当者の範囲","bmd-streaming-encoder4k":"接続元、配信先、解像度と音声、ネット回線・設定、モニター、配線・電源・運用担当の範囲","ultrastudio-express-recorder3g":"入力機器と信号形式、PC型式・OS・接続規格、ソフトとドライバー、音声、保存先と配線の範囲","aja-gen10":"接続する機器と基準入力、映像形式、必要出力数、配線距離・終端、電源と設定確認の範囲","analogway-rc400t":"操作するプロセッサーの型式とソフトウェア版、画面数、呼び出す構成、操作場所、ネットワーク、付属品と事前設定の範囲","imagenics-dmc4k":"PCと変換アダプター、表示先の型式、解像度・フレームレート、音声、HDCPの有無、配線距離と事前確認の範囲","imagenics-hevu41":"並べる映像の台数と型式、解像度・フレームレート・HDCP、表示先、必要な並べ方、音声、配線と事前設定の範囲","iodata-cwq341sdbf":"PC型式、接続端子、使う解像度と表示内容、必要な音声、設置場所、給電と付属品の範囲","canare-hdmpa6":"送出機器と表示先の型式、HDMI信号形式、配線経路と必要条長、ARCの要否、変換アダプター、現地での接続確認","panasonic-c1u100":"本体型式、必要画面幅と比率、会場図面、設置可能範囲、投写内容、スクリーン、付属品と調整作業の範囲","sharp-pnp506":"用途と表示内容、視距離、会場照明、表示時間、横置き・縦置き、再生機器、設置部材・電源・搬入出の範囲","sonifex-avn-dio10-12g":"SDIの入出力機器と形式、音声チャンネル割り当て、サンプルレート、Danteネットワーク・PoE・クロック、設定担当と確認手順","magewell-hdmi4kplus":"入力機器と映像形式、取り込み解像度・fps、PC・USB・OS・ソフト、HDCPの有無、音声、ループ出力先、保存・配信環境","visualproductions-timecore":"基準機器と受け側の型式、タイムコード方式・フレームレート、キュー表、開始停止と信号断時の動き、配線・電源・設定担当","adtechno-dav02":"送信機器と表示先の型式・台数、映像形式、音声・USB/KVM・制御、既存ネットワーク、PoE+またはAC給電、経路設定と確認作業の範囲","epson-ev115":"投写面の位置・大きさ・素材、周囲の明るさ、映像素材と音声、取付方法、電源と設置条件","leyard-clf5m2":"表示範囲と映像方向、観客・カメラ位置、人や物を載せる条件、既存パネルの型式・改定、制御機器、支持構造・電源・設置確認の担当","roe-vanish-v8s":"見せたい背景、画面の配置、観客距離と文字サイズ、周囲と背後の照明、元型式V8Sか別世代か、制御機器・配線・支持部材・電源","dsan-limitimer":"持ち時間と合図のルール、演者・座長・操作席の位置、必要な表示器の数と大きさ、配線距離、音の有無、計時の操作担当","netgear-gsm4212ux":"接続機器と台数、伝送方式、同時に流す信号、PoE規格と必要電力、配線距離、SFP+とケーブル、会場電源、設定担当、必要なライセンス・付属品","aten-kx9970":"PCと表示器の型式・端子・解像度、USB機器、操作席と台数、接続経路と帯域、管理ソフト・ライセンス、操作権限、給電と周辺部材","av-stumpfl-monoclip32":"会場・客席配置、画面位置と希望サイズ、天井高、前面／背面投写、幕の種類、プロジェクターとレンズ、脚・補助部材、設置と搬入の条件","hollyland-solidcom-c1-pro-6s":"担当と人数、会場・移動範囲・遮蔽物、利用国と実機の適合、通話グループ、他設備との接続、リハーサルを含む使用時間、予備電池と充電場所","elmo-px30e":"映すものと範囲、実演内容、会場画面と配信の接続先、録画・音声の要否、操作担当、記録媒体と周辺機器","panasonic-aw-ue150k":"被写体と移動範囲、撮影距離、設置位置、カメラ台数、必要な映像形式、操作担当・制御機器、電源と配線、会場表示・配信・収録の接続先","panasonic-aw-rp150gj":"カメラ型式と台数、撮影範囲と画角、操作席の位置、操作担当、制御方式とネットワーク、監視映像、カメラ映像の接続先、電源・配線","logicool-r1000sl":"登壇者と操作担当、使用PCとOS、発表ソフトと資料、USB／Bluetooth接続、アプリの事前設定可否、登壇位置、会場画面・配信への出力経路、充電と付属品","bose-videobar-vb1":"部屋の寸法と座席、発言位置、会議アプリとPC、回線、表示画面、設置方法、USB配線長、電源、事前接続テスト","hollyland-mars-400s-pro":"撮影位置と受信位置、距離と遮蔽物、屋内外の使用場所、国内向け実機の確認、映像形式、音声経路と許容遅延、受信機・アプリ台数、電源と取付、事前テスト、有線予備経路","digitalforecast-x-ts-mini":"試験する機器と区間、SDI/HDMI形式、HDCP、試験パターン、切り離し可能な時間、配線・電源・担当者","korg-nanokontrol2":"ソフト名とバージョン、操作したい機能、MIDI CC割り当て可否、PC・OS・USB端子、必要な設定、付属ケーブル、操作担当、事前テストと予備操作","neutrik-ne8mc6-mo":"接続する両端の機器・端子型式、必要な通信性能、ケーブル種類・外径・線径・長さ、部品か完成ケーブルか、使用環境、組立・検査・施工範囲","neutrik-powercon-true1":"接続先の型番・端子写真、IN／OUT、必要な完成ケーブルの長さと両端、機器負荷、会場電源、使用地域、屋内外条件、キャップ、電源担当、電源操作の時機","desay-dp26":"画面の幅・高さ、フル／ハーフの枚数、用途、使用期間、制御機器、支持部材、運搬・設営・操作の範囲","leyard-clm10m2":"画面寸法、フル／ハーフの枚数、客席距離、屋内外、背後の照明、設置方法、制御と作業範囲","leyard-clm10m3":"M3の必要枚数、画面寸法、客席距離、屋内外、使用期間、支持部材、制御機器、設営・操作の範囲","leyard-cli39-clt":"日程、屋内外、画面の幅と高さ、枚数、使用する仕様、制御・支持部材、搬入出、設営・本番操作の担当範囲","leyard-clo39":"日程、屋内外、画面の幅と高さ、枚数、使用する仕様、制御・支持部材、搬入出、設営・本番操作の担当範囲","roe-cb5":"日程、屋内外、画面の幅と高さ、枚数、使用する仕様、制御・支持部材、搬入出、設営・本番操作の担当範囲","roe-jdi59":"日程、屋内外、画面の幅と高さ、枚数、使用する仕様、制御・支持部材、搬入出、設営・本番操作の担当範囲","leyard-ecodot2-p55":"日程、屋内外、画面の幅と高さ、枚数、使用する仕様、制御・支持部材、搬入出、設営・本番操作の担当範囲","apexls-sphere1800-25g":"開催日、会場、来場者の動線、表示内容、設置位置、搬入経路、支持と電源、操作担当の範囲","infiled-db26pro-module":"用途、モジュールか完成パネルか、実機の型式と構成、必要数、日程、点検・設営・操作の担当範囲","videotron-dda25hdsd":"映像形式、出力先と台数、配線距離、パッチ盤の有無、使用期間、電源アダプター・ケーブル・設営の範囲","imagenics-dvh17a":"使用期間、出力先と台数、映像形式、配線距離、変換部品・信号ケーブル・配送・設営の範囲。料金は構成別のお見積りです。","barco-imagepro-ii-jr":"入力機器と出力先の型式、解像度・フレームレート、映像端子、音声の送り先、使用期間、設営・操作の範囲。料金は構成別のお見積りです。","barco-imagepro-ii":"入力機器と出力先の型式、解像度・フレームレート、映像端子、音声の送り先、使用期間、設営・操作の範囲。料金は構成別のお見積りです。","neutrik-opticalcon-duo":"接続機器と光モジュール、型式、長さ、配線経路、使用期間、ドラム・中継部品・配送・敷設の範囲。料金は構成別のお見積りです。","theatrixx-xvvsdi2hdmi":"日程・台数・受渡し方法、接続する機器と信号形式、電源／映像ケーブルの必要数、配送・設営・調整・操作員の希望範囲","theatrixx-xvision-3g-fiber":"使用日程、送受信する地点、映像形式と系統数、返し映像の要否、光ケーブルの方式・長さ・接続箇所、電源・SDIケーブル、敷設・試験・運用の希望範囲","adtechno-lcd1015s":"日程・台数、送り元の映像形式、SDIパススルーの有無、音声の確認方法、専用電源・映像ケーブル・スタンド、配送・設営・操作員の希望範囲","colorlight-z5":"日程・台数、入力素材と映像形式、LED型式と画面画素数、光または銅線の経路、配線距離、受信機器、Genlock・予備系統の要否、設営・本番操作の担当範囲","colorlight-h10fn2":"日程・台数、送出機器とLED型式、光ケーブルの種類・端子・長さ、銅線側の行き先、予備経路、電源・設置場所、配線・表示試験の担当範囲","brompton-tessera-xd":"日程・台数、TesseraプロセッサーとLED型式、画面画素数、幹線の距離と光モジュール、各ポートの割当て、直列・予備経路の構成、配線・本番操作の担当範囲","barco-quad-hdmi-output":"本体型式・ソフトウェア、必要なHDMI出力数、各画面の解像度とフレームレート、使用日数、映像ケーブルと設営作業の範囲。参考料金は個別見積りです。"};
 // END GENERATED PRODUCT HINTS
 // BEGIN GENERATED CASE REFERENCES
 const caseLabels={"lyrics-vtr":"歌詞表示・映像再生","service-led":"LEDプロセッサーの設定","conference-led":"LED画面の設営・撤去","showcase-led":"LED画面まわりの現場対応","hybrid-playback":"進行に合わせた映像切り替え","online-operations":"配信の画面操作・共有確認","hall-led-handover":"LED設営・作業の引き継ぎ","hall-projection-setup":"投影機材・モニターまわりの仕込み・撤去"};
 const caseHints={"lyrics-vtr":"公演日・会場・素材の種類・進行表・使用機材・担当してほしい操作をお知らせください。","service-led":"画面の枚数・サイズ・パネル型式・プロセッサー型式・入力映像・予備系統・担当範囲をお知らせください。","conference-led":"画面数・設置場所・機材構成・設営開始時刻・撤去可能時刻をお知らせください。","showcase-led":"会場・画面サイズ・設営日・公演日・撤去日・担当してほしい工程をお知らせください。","hybrid-playback":"会場とオンラインの参加形態・使用する発表資料・VTRの本数・進行表・担当してほしい操作をお知らせください。","online-operations":"配信の方式・登壇者の人数・共有資料・動画音声の有無・録画の要否・担当してほしい操作をお知らせください。","hall-led-handover":"会場・公演日・画面構成・搬入出の時間・担当してほしい工程・引き継ぎの要否をお知らせください。","hall-projection-setup":"会場と仕込み・撤去の日程、スタッフに頼みたい作業をお知らせください。投影機材やモニターの構成は、分かる範囲でご共有ください。"};
 // END GENERATED CASE REFERENCES
 const caseKey=params.get('case');
 const caseLabel=['technical','both'].includes(params.get('brief'))&&Object.hasOwn(caseLabels,caseKey)?caseLabels[caseKey]:'';
 const context=document.querySelector('#brief-context');
 const warehouseGuidance=document.querySelector('#brief-warehouse-guidance');
 const dateGuidance=document.querySelector('#date-guidance');
 const dateField=document.querySelector('#event-date');
 const defaultDateGuidance=dateGuidance?.textContent;
 const defaultDatePlaceholder=dateField?.placeholder;
 if(topic&&params.get('topic')==='warehouse'){
  if(warehouseGuidance){warehouseGuidance.textContent='作業場所・希望日と時間帯・機材の種類とおおよその物量・出庫準備／内容照合／返却確認のうち頼みたい工程を、ご相談内容へ分かる範囲でお書きください。未定の項目があっても相談できます。';warehouseGuidance.hidden=false;}
  if(dateGuidance)dateGuidance.textContent='倉庫で作業したい日と時間帯をお知らせください。出庫準備と返却確認を別日に頼みたい場合は、工程ごとに分けてご記入ください。';
  if(dateField)dateField.placeholder='例：3/10 午前に出庫準備、3/12 午後に返却確認';
 }

 const modelGuidance=document.querySelector('#brief-model-guidance');
 const modelHint=model&&Object.hasOwn(modelHints,params.get('model'))?modelHints[params.get('model')]:'';
 if(modelGuidance&&modelHint){modelGuidance.textContent='この機材の相談で確認したいこと：'+modelHint+'。分かる範囲でご記入ください。未定でも大丈夫です。';modelGuidance.hidden=false;}
 const caseGuidance=document.querySelector('#brief-case-guidance');
 const caseReference=document.querySelector('#brief-case-reference');
 if(caseReference&&caseLabel){caseReference.href='case-'+caseKey+'.html';caseReference.textContent='「'+caseLabel+'」を別タブで見る ↗';caseReference.hidden=false;}
 const caseHint=caseLabel&&Object.hasOwn(caseHints,params.get('case'))?caseHints[params.get('case')]:'';
 if(caseGuidance&&caseHint){caseGuidance.textContent='今回のご相談のヒント：'+caseHint+' 未定の項目は「未定」で大丈夫です。';caseGuidance.hidden=false;}
 const start=Object.hasOwn(starts,params.get('brief'))?starts[params.get('brief')]:'';
 const use=Object.hasOwn(uses,params.get('use'))?uses[params.get('use')]:'';
 const item=['rental','both'].includes(params.get('brief'))&&Object.hasOwn(equipment,params.get('equipment'))?equipment[params.get('equipment')]:'';
 if(params.get('type')==='partner')form.querySelector('[value="partner"]').checked=true;
 if(params.get('brief')==='rental'||params.get('brief')==='both')form.querySelector('input[name="stage"][value="機材レンタル（LED等）"]').checked=true;
 if(params.get('brief')==='technical'||params.get('brief')==='both')form.querySelector('input[name="stage"][value="技術スタッフの相談"]').checked=true;
 if(use)form.querySelector('#purpose').value=use;
 if(model||item||caseLabel||topic)form.querySelector('#message').value=[topic?'相談したいテーマ：'+topic:'',model||item?'希望する機材：'+(model||item):'',caseLabel?'参考にした事例：'+caseLabel:'',caseLabel?'お願いしたい工程・相談したいこと：':''].filter(Boolean).join('\n')+'\n';
 if(start||use||item||model||caseLabel||topic){context.hidden=false;document.querySelector('#brief-context-text').textContent=[start,use,model||item,topic,caseLabel?'参考事例：'+caseLabel:''].filter(Boolean).join(' ／ ')}
 const result=document.querySelector('#memo-result');
 const output=document.querySelector('#memo-output');
 const status=document.querySelector('#brief-status');
 const copyStatus=document.querySelector('#copy-status');
 const clearConfirm=document.querySelector('#clear-confirm');
 const editable=[...form.querySelectorAll('input[name],textarea[name]')];
 const invalidate=()=>{const hadMemo=!result.hidden;result.hidden=true;output.value='';copyStatus.textContent='';if(hadMemo)status.textContent='入力を変更しました。「相談メモを確認する」で最新の内容に更新できます。'};
 editable.forEach(el=>{el.addEventListener('input',invalidate);el.addEventListener('change',invalidate)});
 document.querySelector('#review-memo').addEventListener('click',e=>{
  e.preventDefault();const d=new FormData();editable.forEach(el=>{if(el.name && (el.type!=='checkbox' && el.type!=='radio' || el.checked))d.append(el.name,el.value)});const val=k=>String(d.get(k)||'').trim()||'未定';
  output.value=['LOTUS ご相談メモ','種別：'+(d.get('type')==='partner'?'技術協力・協業のご相談':'イベント映像のご相談'),'日程・時間：'+val('date'),'会場・場所：'+val('venue'),'イベントの内容：'+val('purpose'),'ご相談したい内容：'+(d.getAll('stage').join('、')||'未定'),'','ご相談内容：',val('message'),'','※ このメモは未送信です。予約・発注は行われていません。'].join('\n');
  result.hidden=false;copyStatus.textContent='';status.textContent='';clearConfirm.hidden=true;result.focus({preventScroll:true});result.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
 });
 document.querySelector('#edit-memo').addEventListener('click',()=>{form.querySelector('input[name="type"]:checked').focus();form.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'})});
 let copyAttempt=0;
 document.querySelector('#copy-memo').addEventListener('click',async()=>{
  const attempt=++copyAttempt,text=output.value;
  if(result.hidden||!text.trim())return;
  const current=()=>attempt===copyAttempt&&!result.hidden&&output.value===text;
  try{await navigator.clipboard.writeText(text);if(current())copyStatus.textContent='コピーしました。外部への送信は行われていません。'}catch{if(!current())return;output.focus();output.select();copyStatus.textContent='自動コピーが利用できません。メモを選択しました。端末のコピー操作をご利用ください。'}
 });
 document.querySelector('#clear-memo').addEventListener('click',()=>{clearConfirm.hidden=false;document.querySelector('#cancel-clear').focus()});
 const cancelClear=()=>{clearConfirm.hidden=true;document.querySelector('#clear-memo').focus()};
 document.querySelector('#cancel-clear').addEventListener('click',cancelClear);
 clearConfirm.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();cancelClear()}});
 document.querySelector('#confirm-clear').addEventListener('click',()=>{
  editable.forEach(el=>{if(el.type==='radio'||el.type==='checkbox')el.checked=el.name==='type'&&el.value==='event';else el.value=''});
  result.hidden=true;output.value='';copyStatus.textContent='';context.hidden=true;clearConfirm.hidden=true;
  if(warehouseGuidance){warehouseGuidance.hidden=true;warehouseGuidance.textContent='';}
  if(dateGuidance)dateGuidance.textContent=defaultDateGuidance;
  if(dateField)dateField.placeholder=defaultDatePlaceholder;
  history.replaceState(null,'',location.pathname);status.textContent='入力内容と相談メモをクリアしました。';document.querySelector('#clear-memo').focus();
 });
}

const motion=document.querySelector('.motion-toggle');
motion?.addEventListener('click',()=>{const playing=motion.getAttribute('aria-pressed')!=='true';motion.setAttribute('aria-pressed',String(playing));motion.closest('.motion-panel').classList.toggle('playing',playing);motion.textContent=playing?'説明を停止 ■':'動きで見る ▶'});

// Progressive enhancement: all role descriptions remain readable without JS.
const signalRoles=document.querySelector('.signal-roles');
if(signalRoles){
 const bar=signalRoles.querySelector('.signal-role-buttons');
 const choices=[...bar.querySelectorAll('button')];
 const panels=[...signalRoles.querySelectorAll('.signal-role-panel')];
 const selectRole=index=>{choices.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));panels.forEach((p,i)=>{p.hidden=i!==index;});};
 choices.forEach((b,i)=>b.addEventListener('click',()=>selectRole(i)));
 selectRole(0);bar.hidden=false;
}

/* メニューの機材マニュアル表記 (Friday 2026-11-09) */
(function(){function relabel(){document.querySelectorAll('#site-nav a[href*="lotus-equipment-guide"]').forEach(function(a){a.setAttribute('aria-label','LOTUSプロアドバイザー向け 機材マニュアル');a.innerHTML='<small>EQUIPMENT MANUAL</small><span>LOTUSプロアドバイザー向け</span><b aria-hidden="true">↗</b>';});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',relabel);else relabel();})();

/* 機材ガイドを機材レンタルに統合 (Friday 2026-11-09) */
(function(){function merge(){
 document.querySelectorAll('#site-nav a[href^="products.html"], .footer-links a[href^="products.html"]').forEach(function(a){if(!a.hash||a.getAttribute('href')==='products.html')a.remove();});
 document.querySelectorAll('a[href^="products.html"]').forEach(function(a){var h=a.getAttribute('href');var hash=h.indexOf('#')>-1?h.slice(h.indexOf('#')):'#guide';a.setAttribute('href','rental.html'+hash);});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',merge);else merge();})();

/* ご依頼の流れページを外す・LOTUS VISUAL 表記 (Friday 2026-11-10) */
(function(){function wf(){
 document.querySelectorAll('#site-nav a[href^="workflow.html"], .footer-links a[href^="workflow.html"], .quick-nav a[href^="workflow.html"]').forEach(function(a){a.remove();});
 document.querySelectorAll('a[href^="workflow.html"]').forEach(function(a){a.setAttribute('href','contact.html');});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wf);else wf();})();
