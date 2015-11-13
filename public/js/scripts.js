// Empty JS for your own code to be here
$(function(){

	// アラートはゆっくり順番にけす。
  setTimeout( function() {
  	$('.alert').each( function(idx, element) {
 		 setTimeout( function(){
 		 	$(element).fadeOut('slow');
 		 }, 400 * idx);
 		});
  }, 3000);


  /* willdoのサムネイル画像をホバーしたら+アイコンを表示 */
  $(document).on({
    "mouseenter": function(){
      $(this).find("#plus").fadeIn(300);
    },
    "mouseleave": function(){
      $(this).find("#plus").fadeOut(300);
    }
  }, '#inner');

  /* willdoの+アイコンをクリックしたら行きたいリストに追加 */
  $(document).on('click', '#plus', (function() {
    var parent = $(this).parent().parent();
    console.log(parent.attr('lat'));
  }));


  /* moreボタンを押したら詳細フィールドが開く */
  $(document).on('click', '#more', (function() {
    $(this).next().show(300);
    setTimeout(function() {
      $('.willdos').masonry({
        itemSelector: '.willdo', //整理される要素のclassを指定
        isAnimated: true, //スムースアニメーション設定
        isFitWidth: true, //親要素の幅サイズがピッタリ
        isRTL: false,     //整理される要素が左右逆になる（読み言語などに）
        isResizable: true //ウィンドウサイズが変更された時に並び替え
      });
    }, 300);
    // 300秒待たせるのは、showに300msかけているので、それが移動しきってからじゃないとwidthをmansoryが計算できないから
  }));

  /* moreボタンを押して詳細フィールドが出現したら、nomoreボタンで元に戻るように */
  $(document).on('click', '#nomore', (function() {
    $(this).parent().hide(300);
    $(this).parent().prev('#more').show(300);
    setTimeout(function() {
      $('.willdos').masonry({
        itemSelector: '.willdo', //整理される要素のclassを指定
        isAnimated: true, //スムースアニメーション設定
        isFitWidth: true, //親要素の幅サイズがピッタリ
        isRTL: false,     //整理される要素が左右逆になる（読み言語などに）
        isResizable: true //ウィンドウサイズが変更された時に並び替え
      });
    }, 300);
  }));



  // 例をクリックするとそれを検索部分にコピー
  $('span#example').click( function() {
    $("#address").val($(this).text());
  });

  // 現在地取得できるなら、取得アイコンを挿入
  if( navigator.geolocation ){
    $('#here-block').append('<a class="here" id="here"><img src="../images/here.png" class="here"></a>');
  };


  var options = {
    enableHighAccurancy: false, // より高精度な位置を求める。バッテリー消費量が増える
    maximumAge: 1, // 最後の現在地情報取得が [maximuAge][ms]以内であればその情報を再利用する設定
    timeout: 10000
  };

  // 現在地取得アイコンをクリックすると現在地を取得する
  $('#here').click( function() {
    navigator.geolocation.watchPosition(is_success, is_error, options);
  });

  // 現在地取得が成功したら
  function is_success(position){
    var lat = position.coords.latitude;
    var lng = position.coords.longitude;
    var geocoder = new google.maps.Geocoder();
    var latlng = new google.maps.LatLng(lat,lng);
    $("input[id='address']").val(latlng);

    geocoder.geocode({'latLng': latlng}, function(results, status) {
      if( status == google.maps.GeocoderStatus.OK) {
        //$('#address').value = results[0].formatted_address;
        //$("input[id='address main']").val(results[0].formatted_address);
        // alert(results[0].formatted_address);
      } else {
        console.log(status);
      }
    });
  };

  // 現在地取得が失敗したら
  function is_error(error){
    var message = '';
    switch(error.code) {
      case 1:
        message = "位置情報の取得が許可されていません"; break;
      case 2:
        message = "位置情報の取得に失敗しました"; break;
      case 3:
        message = "タイムアウトしました"; break;
    }
    $('#messages').append('<div class="alert alert-warning alert-dismisable" role="alert" id="alert"><button type="button" class="close" data-dismiss="alert" aria-label="閉じる"><span aria-hidden="true">×</span></button><p><strong>warning</strong>：' + message + '</p></div>');
  };


});