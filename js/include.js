$(function(){
	$("include").each(function(){
		var content = $(this).attr("data-file");
		$(this).load("html/"+content);
	});
});
