var num = 150;

$("#num").text(num);


$("button.http").click(function(){
  withHTTP();
}).show();

// http
// -------------------------------
var withHTTP = function(){
  var out = $('output.http')
    , st
    , res
    , count = 0;

  var getImg = function(id){
    out.append("<img id='httptest"+id+"'src='/images/html5-32.png?"+new Date().getTime()+"'>");


    $("#httptest"+id).bind("load", function(){
      count += 1;
      if(count === num) {
        var dur = new Date().getTime() - st;
        $(".res_http").text("Result: "+dur+"[msec]");
      }
    });
  }

  var start = function(){
    out.empty();
    $(".res_http").empty();

    st = new Date().getTime();
    for(var i = 0; i < num; i += 1){
      getImg(i);
    };
  }
  start();
};
